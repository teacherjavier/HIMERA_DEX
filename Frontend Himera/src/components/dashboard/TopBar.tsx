
import React, { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopBar = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [selectedPool, setSelectedPool] = useState(() => 
    localStorage.getItem('selectedPool') || "Pool1"
  );
  const { toast } = useToast();

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

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem('walletBalance');
    localStorage.removeItem('walletConnectedAt');
    localStorage.removeItem('walletAddress');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Solicitar a Metamask que reinicie la conexión
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
        
        const accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });
        
        const networkSwitched = await switchNetwork();
        if (!networkSwitched) {
          toast({
            variant: "destructive",
            title: "Network Switch Failed",
            description: "Please manually switch to the correct network.",
          });
          return;
        }
        
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        const balance = await provider.getBalance(accounts[0]);
        const formattedBalance = formatEther(balance);
        
        setAccount(accounts[0]);
        localStorage.setItem('walletBalance', formattedBalance);
        localStorage.setItem('walletAddress', accounts[0]);
        localStorage.setItem('walletConnectedAt', Date.now().toString());
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect to MetaMask. Please try again.",
        });
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
      });
    }
  };

  const handlePoolChange = (pool: string) => {
    setSelectedPool(pool);
    localStorage.setItem('selectedPool', pool);
    // Disparamos el evento para que otros componentes se actualicen
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          localStorage.removeItem('walletAddress');
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected.",
          });
        } else {
          setAccount(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
          toast({
            title: "Account Changed",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <header className="shadow-[0px_32px_72px_0px_rgba(20,20,43,0.24)] bg-[#1E1E1E] flex w-full items-stretch gap-5 text-xs text-white font-medium text-center leading-none flex-wrap justify-between px-6 py-[19px] max-md:max-w-full max-md:mr-1 max-md:pr-5">
      <div className="flex items-center gap-5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/45b490384eae4eb6a53b528c6ba6ac8f/a76d399081b98081f20713ea82ddc4433d22c82a211729bef92786fc4e211d0a?placeholderIfAbsent=true"
          alt="Logo"
          className="aspect-[3.41] object-contain w-[123px] shrink-0 max-w-full"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="h-8 border-[#464544] bg-[#3E3E3B] text-[#B2B1AE] hover:bg-[#4a4a47] hover:text-white"
            >
              {selectedPool}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="z-50 bg-[#3E3E3B] border-[#464544] text-[#B2B1AE]"
          >
            <DropdownMenuItem 
              className="hover:bg-[#4a4a47] hover:text-white cursor-pointer"
              onClick={() => handlePoolChange("Pool1")}
            >
              Pool1
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-[#4a4a47] hover:text-white cursor-pointer"
              onClick={() => handlePoolChange("Pool2")}
            >
              Pool2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="flex items-stretch gap-[15px] my-auto">
        <button
          className="self-stretch rounded bg-[#3E3E3B] gap-1.5 whitespace-nowrap p-2"
          aria-label="Profile"
        >
          Profile
        </button>
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="self-stretch rounded bg-[#138ACB] gap-1.5 px-4 py-2 hover:bg-[#1070A3] transition-colors flex items-center">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="z-50 bg-[#3E3E3B] border-[#464544] text-[#B2B1AE]"
            >
              <DropdownMenuItem 
                className="hover:bg-[#4a4a47] hover:text-white cursor-pointer"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            className="self-stretch rounded bg-[#138ACB] gap-1.5 px-4 py-2 hover:bg-[#1070A3] transition-colors"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
};
