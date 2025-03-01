
import React, { useState, useEffect, useRef } from "react";
import { BrowserProvider, formatEther, parseEther, Contract } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { ERC20_ABI, SALE_ABI, TOKEN_ADDRESSES } from "@/types/erc20";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SwapCard = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [crashBalance, setCrashBalance] = useState<string>("0");
  const [burnBalance, setBurnBalance] = useState<string>("0");
  const [showCrashInput, setShowCrashInput] = useState(false);
  const [showBurnInput, setShowBurnInput] = useState(false);
  const [crashAmount, setCrashAmount] = useState<string>("");
  const [burnAmount, setBurnAmount] = useState<string>("");
  const { toast } = useToast();
  
  // Referencias para evitar actualizaciones innecesarias
  const lastAccountRef = useRef<string | null>(null);
  const balanceRef = useRef<string | null>(null);
  const crashBalanceRef = useRef<string>("0");
  const burnBalanceRef = useRef<string>("0");
  const lastCheckRef = useRef<number>(0);

  const updateTokenBalances = async (address: string) => {
    if (!window.ethereum || !address) return;
    
    // Evitar actualizaciones demasiado frecuentes
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) return; // Al menos 2 segundos entre actualizaciones
    lastCheckRef.current = now;
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Actualizar saldo de ETH
      const ethBalance = await provider.getBalance(address);
      const formattedBalance = formatEther(ethBalance);
      
      // Solo actualizar si el valor ha cambiado significativamente
      if (formattedBalance !== balanceRef.current) {
        balanceRef.current = formattedBalance;
        setBalance(formattedBalance);
      }
      
      // Actualizar saldo de CRASH
      const crashContract = new Contract(TOKEN_ADDRESSES.CRASH, ERC20_ABI, provider);
      const crashBalanceWei = await crashContract.balanceOf(address);
      const formattedCrashBalance = formatEther(crashBalanceWei);
      
      // Solo actualizar si el valor ha cambiado
      if (formattedCrashBalance !== crashBalanceRef.current) {
        crashBalanceRef.current = formattedCrashBalance;
        setCrashBalance(formattedCrashBalance);
      }

      // Actualizar saldo de BURN
      const burnContract = new Contract(TOKEN_ADDRESSES.BURN, ERC20_ABI, provider);
      const burnBalanceWei = await burnContract.balanceOf(address);
      const formattedBurnBalance = formatEther(burnBalanceWei);
      
      // Solo actualizar si el valor ha cambiado
      if (formattedBurnBalance !== burnBalanceRef.current) {
        burnBalanceRef.current = formattedBurnBalance;
        setBurnBalance(formattedBurnBalance);
      }
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const resetBalances = () => {
    if (balanceRef.current !== null) {
      balanceRef.current = null;
      setBalance(null);
    }
    
    if (crashBalanceRef.current !== "0") {
      crashBalanceRef.current = "0";
      setCrashBalance("0");
    }
    
    if (burnBalanceRef.current !== "0") {
      burnBalanceRef.current = "0";
      setBurnBalance("0");
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ 
            method: "eth_accounts" 
          });
          
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            
            // Solo actualizar si la cuenta ha cambiado
            if (currentAccount !== lastAccountRef.current) {
              lastAccountRef.current = currentAccount;
              setAccount(currentAccount);
              await updateTokenBalances(currentAccount);
            }
          } else if (lastAccountRef.current !== null) {
            // Solo resetear si hay un cambio real
            lastAccountRef.current = null;
            setAccount(null);
            resetBalances();
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    // Verificación inicial
    checkWalletConnection();

    // Verificar localStorage para cambios en la wallet
    const checkLocalStorage = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      
      if (walletAddress && walletAddress !== lastAccountRef.current) {
        // Wallet conectada o cambiada
        lastAccountRef.current = walletAddress;
        setAccount(walletAddress);
        updateTokenBalances(walletAddress);
      } else if (!walletAddress && lastAccountRef.current) {
        // Wallet desconectada
        lastAccountRef.current = null;
        setAccount(null);
        resetBalances();
      }
    };

    const intervalId = setInterval(checkLocalStorage, 1000);

    // Listener para eventos de cambio de cuenta en MetaMask
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          
          // Solo actualizar si la cuenta ha cambiado
          if (newAccount !== lastAccountRef.current) {
            lastAccountRef.current = newAccount;
            setAccount(newAccount);
            await updateTokenBalances(newAccount);
          }
        } else if (lastAccountRef.current !== null) {
          // Solo resetear si hay un cambio real
          lastAccountRef.current = null;
          setAccount(null);
          resetBalances();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
        clearInterval(intervalId);
      };
    }

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Actualización periódica de saldos cuando hay una cuenta conectada
  useEffect(() => {
    if (!account) return;
    
    const updateInterval = setInterval(() => {
      updateTokenBalances(account);
    }, 10000); // Actualizar cada 10 segundos
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [account]);

  const switchNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: import.meta.env.VITE_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: import.meta.env.VITE_CHAIN_ID,
                chainName: import.meta.env.VITE_NETWORK_NAME,
                rpcUrls: [import.meta.env.VITE_RPC_URL],
                blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER_URL],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  const handleBuyToken = async (tokenType: 'CRASH' | 'BURN') => {
    if (!account || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first.",
      });
      return;
    }

    const amount = tokenType === 'CRASH' ? crashAmount : burnAmount;
    
    if (!amount || parseFloat(amount) <= 0) {
      if (tokenType === 'CRASH') {
        setShowCrashInput(!showCrashInput);
      } else {
        setShowBurnInput(!showBurnInput);
      }
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      const currentBalance = await provider.getBalance(account);
      const requiredValue = parseEther(amount);
      
      if (currentBalance < requiredValue) {
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: `You need at least ${amount} TEST to make this purchase.`,
        });
        return;
      }

      const signer = await provider.getSigner();
      const saleContract = new Contract(TOKEN_ADDRESSES.SALE, SALE_ABI, signer);
      
      let tx;
      if (tokenType === 'CRASH') {
        tx = await saleContract.buyCRASH({ 
          value: requiredValue,
          gasLimit: 300000
        });
      } else {
        tx = await saleContract.buyBURN({ 
          value: requiredValue,
          gasLimit: 300000
        });
      }
      
      toast({
        title: "Transaction Sent",
        description: "Please wait for confirmation...",
      });

      await tx.wait();
      
      await updateTokenBalances(account);

      toast({
        title: "Success",
        description: `Successfully purchased ${tokenType} tokens!`,
      });

      if (tokenType === 'CRASH') {
        setCrashAmount("");
        setShowCrashInput(false);
      } else {
        setBurnAmount("");
        setShowBurnInput(false);
      }

    } catch (error: any) {
      console.error("Error buying tokens:", error);
      
      let errorMessage = "Failed to buy tokens. Please try again.";
      if (error.info?.error?.data?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction. Please check your balance.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <section className="card-base flex w-full flex-col py-4 mb-1">
      <div className="self-stretch flex w-full flex-col items-stretch text-card-foreground px-4 gap-4">
        <h2 className="text-base leading-none">Buy Tokens</h2>

        <div className="flex flex-col gap-6 ">
          <div className="flex flex-col gap-2">
            <button 
              className="btn-primary w-full py-3 px-4"
              onClick={() => handleBuyToken('CRASH')}
            >
              {showCrashInput && crashAmount 
                ? `Buy ${(parseFloat(crashAmount) * 100).toFixed(2)} CRASH` 
                : "Buy CRASH"}
            </button>
            <p className="text-sm text-center text-muted">1 TEST = 100 CRASH</p>
            {showCrashInput && (
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  placeholder="Enter TEST amount"
                  value={crashAmount}
                  onChange={(e) => setCrashAmount(e.target.value)}
                  className="w-full"
                />
                {crashAmount && (
                  <p className="text-sm text-center text-muted">
                    You will receive: {(parseFloat(crashAmount) * 100).toFixed(2)} CRASH
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button 
              className="btn-primary w-full py-3 px-4"
              onClick={() => handleBuyToken('BURN')}
            >
              {showBurnInput && burnAmount 
                ? `Buy ${(parseFloat(burnAmount) * 100).toFixed(2)} BURN` 
                : "Buy BURN"}
            </button>
            <p className="text-sm text-center text-muted">1 TEST = 100 BURN</p>
            {showBurnInput && (
              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  placeholder="Enter TEST amount"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="w-full"
                />
                {burnAmount && (
                  <p className="text-sm text-center text-muted">
                    You will receive: {(parseFloat(burnAmount) * 100).toFixed(2)} BURN
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Siempre mostrar la sección de saldos, independientemente de si account existe */}
        <div className="flex flex-col gap-1 text-sm text-muted mt-2">
          <p>TEST: {balance ? Number(balance).toFixed(2) : "0.00"}</p>
          <p>CRASH: {Number(crashBalance).toFixed(4)}</p>
          <p>BURN: {Number(burnBalance).toFixed(4)}</p>
        </div>
      </div>
    </section>
  );
};
