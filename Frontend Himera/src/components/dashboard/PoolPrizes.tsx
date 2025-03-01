
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { ERC20_ABI, TOKEN_ADDRESSES } from "@/types/erc20";

export const PoolPrizes = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [fromToken, setFromToken] = useState("CRASH");
  const [poolRatio, setPoolRatio] = useState<number>(0);
  const [selectedPool, setSelectedPool] = useState(() => 
    localStorage.getItem('selectedPool') || 'Pool1'
  );
  const poolRatioRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPool') {
        const newPool = localStorage.getItem('selectedPool') || 'Pool1';
        setSelectedPool(newPool);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const updatePoolRatio = async () => {
      if (!window.ethereum) return;
      
      // Evitar actualizaciones demasiado frecuentes
      const now = Date.now();
      if (now - lastUpdateRef.current < 5000) { // 5 segundos mínimo entre actualizaciones
        return;
      }
      lastUpdateRef.current = now;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const poolAddress = selectedPool === 'Pool1' ? TOKEN_ADDRESSES.POOL1 : TOKEN_ADDRESSES.POOL2;
        
        const crashContract = new Contract(TOKEN_ADDRESSES.CRASH, ERC20_ABI, provider);
        const burnContract = new Contract(TOKEN_ADDRESSES.BURN, ERC20_ABI, provider);

        const [crashBalance, burnBalance] = await Promise.all([
          crashContract.balanceOf(poolAddress),
          burnContract.balanceOf(poolAddress)
        ]);

        const crashAmount = Number(formatEther(crashBalance));
        const burnAmount = Number(formatEther(burnBalance));
        
        const newRatio = crashAmount / burnAmount;
        
        // Solo actualizar el estado si el ratio ha cambiado significativamente
        if (Math.abs(newRatio - poolRatioRef.current) > 0.01) {
          poolRatioRef.current = newRatio;
          setPoolRatio(newRatio);
        }
        
        console.log("Pool balances:", {
          crash: crashAmount,
          burn: burnAmount,
          ratio: newRatio
        });
      } catch (error) {
        console.error("Error updating pool ratio:", error);
      }
    };

    // Actualizar ratio al cambiar de pool
    updatePoolRatio();
    
    // Configurar intervalo con frecuencia más baja
    const intervalId = setInterval(updatePoolRatio, 10000); // 10 segundos
    
    return () => {
      clearInterval(intervalId);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [selectedPool]);

  const swapTokens = () => {
    setFromToken(fromToken === "CRASH" ? "BURN" : "CRASH");
  };

  const calculateToAmount = () => {
    if (!fromAmount || !poolRatio || poolRatio === 0) return "0.0000";
    const amount = Number(fromAmount);
    
    const calculated = fromToken === "CRASH" 
      ? amount / poolRatio 
      : amount * poolRatio;
    
    return calculated.toFixed(4);
  };

  return (
    <section className="border border-[color:var(--Neutral-Colors-400,#5F5F5B)] shadow-[1px_1px_1px_0px_rgba(16,25,52,0.40)] bg-[#1E1E1E] flex w-full flex-col items-stretch text-base px-4 py-4 rounded-[5px] border-solid">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#E7E7E6]">Swap Tokens</h2>
        <span className="text-[#B2B1AE] text-sm">{selectedPool}</span>
      </div>

      <div className="bg-[#2A2A2A] rounded-lg p-4 mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[#B2B1AE] text-sm">From</span>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-grow bg-[#1E1E1E] border-[#464544]"
                placeholder="0.0"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-[#1E1E1E] border-[#464544]">
                    ${fromToken}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#3E3E3B] border-[#464544]">
                  <DropdownMenuItem onClick={() => setFromToken("CRASH")}>
                    $CRASH
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFromToken("BURN")}>
                    $BURN
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <button onClick={swapTokens} className="self-center">
            ↓
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-[#B2B1AE] text-sm">To</span>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromAmount ? calculateToAmount() : ""}
                readOnly
                className="flex-grow bg-[#1E1E1E] border-[#464544]"
                placeholder="0.0"
              />
              <Button 
                variant="outline" 
                className="bg-[#1E1E1E] border-[#464544]"
                disabled
              >
                ${fromToken === "CRASH" ? "BURN" : "CRASH"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-[#B2B1AE] mb-4">
        {poolRatio && !isNaN(poolRatio) ? 
          `1 ${fromToken} = ${fromToken === "CRASH" ? (1/poolRatio).toFixed(4) : poolRatio.toFixed(4)} ${fromToken === "CRASH" ? "BURN" : "CRASH"}` : 
          "NO LIQUIDITY PROVIDED"}
      </div>

      <Button 
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        SWAP
      </Button>
    </section>
  );
};
