
import React, { useState, useEffect, useRef } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ERC20_ABI, POOL_ABI, TOKEN_ADDRESSES } from "@/types/erc20";
import SnowEffect from "./SnowEffect";

export const SwapPoolChart = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [showInputs, setShowInputs] = useState(false);
  const [crashAmount, setCrashAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [crashBalance, setCrashBalance] = useState("0");
  const [burnBalance, setBurnBalance] = useState("0");
  const [tvl, setTvl] = useState<number>(0);
  const [priceRatio, setPriceRatio] = useState<number>(0);
  const [showSnowEffect, setShowSnowEffect] = useState(false);
  const { toast } = useToast();

  // Refs para control de actualizaciones
  const tvlRef = useRef<number>(0);
  const priceRatioRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const [selectedPool, setSelectedPool] = useState(() => 
    localStorage.getItem('selectedPool') || 'Pool1'
  );
  const poolAddress = selectedPool === 'Pool1' ? TOKEN_ADDRESSES.POOL1 : TOKEN_ADDRESSES.POOL2;

  // Solo comprobar si hay una cuenta conectada para el botón "Add Liquidity"
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccount(accounts.length > 0 ? accounts[0] : null);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Escuchar eventos de MetaMask para habilitar/deshabilitar el botón
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', () => {});
        }
      };
    }
  }, []);

  const updateBalances = async (address: string) => {
    if (!window.ethereum || !address) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const crashContract = new Contract(TOKEN_ADDRESSES.CRASH, ERC20_ABI, provider);
      const burnContract = new Contract(TOKEN_ADDRESSES.BURN, ERC20_ABI, provider);
      
      const [crashBal, burnBal] = await Promise.all([
        crashContract.balanceOf(address),
        burnContract.balanceOf(address)
      ]);
      
      setCrashBalance(formatEther(crashBal));
      setBurnBalance(formatEther(burnBal));
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const updateTVL = async () => {
    if (!window.ethereum) return;
    
    // Evitar actualizaciones demasiado frecuentes
    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) return; // 5 segundos mínimo entre actualizaciones
    
    lastUpdateRef.current = now;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const crashContract = new Contract(TOKEN_ADDRESSES.CRASH, ERC20_ABI, provider);
      const burnContract = new Contract(TOKEN_ADDRESSES.BURN, ERC20_ABI, provider);

      const [crashBalance, burnBalance] = await Promise.all([
        crashContract.balanceOf(poolAddress),
        burnContract.balanceOf(poolAddress)
      ]);

      const crashAmount = Number(formatEther(crashBalance));
      const burnAmount = Number(formatEther(burnBalance));
      
      const newTVL = (crashAmount + burnAmount) / 100;
      const newRatio = crashAmount / burnAmount;
      
      // Solo actualizar si hay cambios significativos
      if (Math.abs(newTVL - tvlRef.current) > 0.05) {
        tvlRef.current = newTVL;
        setTvl(newTVL);
      }
      
      if (Math.abs(newRatio - priceRatioRef.current) > 0.01) {
        priceRatioRef.current = newRatio;
        setPriceRatio(newRatio);
      }
    } catch (error) {
      console.error("Error updating TVL:", error);
    }
  };

  useEffect(() => {
    updateTVL();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPool') {
        const newPool = localStorage.getItem('selectedPool') || 'Pool1';
        setSelectedPool(newPool);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Reducir la frecuencia de comprobación
    const intervalId = setInterval(updateTVL, 10000); // 10 segundos
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    updateTVL();
  }, [selectedPool]);

  const handleSnowEffectComplete = () => {
    setShowSnowEffect(false);
    // Guardar en localStorage para que HimeraChat lo detecte
    localStorage.setItem('showCongratulations', 'true');
    localStorage.setItem('congratsShownAt', Date.now().toString());
  };

  const handleAddLiquidity = async () => {
    if (!account || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first.",
      });
      return;
    }

    if (!showInputs) {
      setShowInputs(true);
      return;
    }

    if (!crashAmount || !burnAmount || parseFloat(crashAmount) <= 0 || parseFloat(burnAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid amounts for both tokens.",
      });
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get contracts
      const crashContract = new Contract(TOKEN_ADDRESSES.CRASH, ERC20_ABI, signer);
      const burnContract = new Contract(TOKEN_ADDRESSES.BURN, ERC20_ABI, signer);
      const poolContract = new Contract(poolAddress, POOL_ABI, signer);

      // Convert amounts to wei
      const crashWei = parseEther(crashAmount);
      const burnWei = parseEther(burnAmount);

      // Approve tokens
      toast({
        title: "Approval Required",
        description: "Please approve token transfers...",
      });

      const tx1 = await crashContract.approve(poolAddress, crashWei);
      await tx1.wait();
      
      const tx2 = await burnContract.approve(poolAddress, burnWei);
      await tx2.wait();

      // Add liquidity
      toast({
        title: "Adding Liquidity",
        description: "Please confirm the transaction...",
      });

      const tx3 = await poolContract.addLiquidity(crashWei, burnWei);
      await tx3.wait();

      // Update balances
      await updateBalances(account);
      await updateTVL();

      toast({
        title: "Success",
        description: "Liquidity added successfully!",
      });

      // Reset form
      setShowInputs(false);
      setCrashAmount("");
      setBurnAmount("");
      
      // Activar el efecto de nieve
      setShowSnowEffect(true);

    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add liquidity. Please try again.",
      });
    }
  };

  // Calculamos el valor escalado de TVL para la visualización
  const scaledTvl = tvl * 100; // Multiplicamos por 100 para que 30 = 3000

  return (
    <section className="border border-[color:var(--Neutral-Colors-400,#5F5F5B)] shadow-[1px_1px_1px_0px_rgba(16,25,52,0.40)] bg-[#1E1E1E] flex w-full flex-col items-stretch font-medium pl-[22px] pr-12 pt-[18px] pb-[31px] rounded-[5px] border-solid max-md:max-w-full max-md:px-5 relative">
      <div className="flex w-full items-stretch gap-5 flex-wrap justify-between max-md:max-w-full">
        <div className="flex flex-col items-stretch">
          <div className="flex items-center gap-4 relative z-50">
            <h2 className="text-[#B2B1AE] text-base leading-none">{selectedPool}</h2>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap mt-2.5">
            <div className="text-white text-2xl leading-none self-stretch my-auto">
              T{tvl.toFixed(4)}
            </div>
            <div className="items-stretch border-[color:var(--Other-Green-50,rgba(5,193,104,0.20))] bg-[rgba(5,193,104,0.20)] self-stretch flex flex-col text-[10px] text-[#14CA74] leading-[1.4] justify-center w-12 my-auto px-1 py-0.5 rounded-sm border-[0.6px] border-solid">
              <div className="w-full max-w-10">
                <div className="flex items-center gap-0.5">
                  <span>{((tvl / 30) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-white">
            {priceRatio && !isNaN(priceRatio) ? 
              `1 CRASH = ${(1/priceRatio).toFixed(4)} BURN` : 
              "NO LIQUIDITY PROVIDED"}
          </div>
          <Button
            onClick={handleAddLiquidity}
            disabled={!account}
            className="bg-[#138ACB] hover:bg-[#1070A3] text-white"
          >
            Add Liquidity
          </Button>
        </div>
      </div>

      {showInputs && (
        <div className="absolute top-24 right-12 bg-[#1E1E1E] border border-[#5F5F5B] rounded-lg p-4 z-50 w-64">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="CRASH amount"
                value={crashAmount}
                onChange={(e) => setCrashAmount(e.target.value)}
              />
              <p className="text-xs text-[#5F5F5B]">Balance: {Number(crashBalance).toFixed(4)} CRASH</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="BURN amount"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
              />
              <p className="text-xs text-[#5F5F5B]">Balance: {Number(burnBalance).toFixed(4)} BURN</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-4 mt-7">
        <div className="flex flex-col justify-between text-right text-white text-xs h-[200px]">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="font-medium">
              {(10000 - i * 1000).toLocaleString()}
            </div>
          ))}
        </div>

        <div className="relative h-[200px]">
          {/* Líneas horizontales de fondo */}
          <div className="absolute inset-0 grid grid-rows-[repeat(10,1fr)]">
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                className="border-t border-[#464544] border-opacity-50"
                style={{ top: `${i * 10}%` }}
              />
            ))}
          </div>

          {/* Línea ascendente y horizontal para TVL */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            {/* Línea desde 0 al día 1 con ascenso hasta TVL */}
            <line 
              x1="0" 
              y1="100" 
              x2="16.66" 
              y2={100 - (scaledTvl / 100)} 
              stroke="#138ACB" 
              strokeWidth="1.5"
            />
            
            {/* Línea horizontal desde día 1 hasta día 6 */}
            <line 
              x1="16.66" 
              y1={100 - (scaledTvl / 100)} 
              x2="100" 
              y2={100 - (scaledTvl / 100)}
              stroke="#138ACB" 
              strokeWidth="1.5"
            />
          </svg>

          {/* Días en el eje X */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white text-xs">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-2 w-[1px] bg-[#464544] mb-1" />
                <span className="text-[10px]">{i} d</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Efecto de nieve */}
      <SnowEffect isPlaying={showSnowEffect} onComplete={handleSnowEffectComplete} />
    </section>
  );
};
