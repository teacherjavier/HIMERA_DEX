
import { useState, useEffect, useRef } from "react";
import { BrowserProvider, Contract, formatEther, Log } from "ethers";
import { POOL_ABI, TOKEN_ADDRESSES } from "@/types/erc20";
import { Position } from "../types/position";
import { useToast } from "@/hooks/use-toast";

export const usePositions = (account: string | null) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const { toast } = useToast();
  const lastAccountRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // Limpiar posiciones cuando se desconecta la wallet
  useEffect(() => {
    if (!account && lastAccountRef.current) {
      lastAccountRef.current = null;
      setPositions([]);
    } else if (account && account !== lastAccountRef.current) {
      lastAccountRef.current = account;
    }
  }, [account]);

  const loadPositions = async () => {
    if (!window.ethereum || !account) {
      setPositions([]);
      return;
    }

    // Evitar múltiples cargas simultáneas
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Verificar si la cuenta sigue conectada
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        setPositions([]);
        isLoadingRef.current = false;
        return;
      }

      // Verificar si la cuenta corresponde a la que estamos cargando
      const currentAccount = accounts[0].address.toLowerCase();
      if (currentAccount !== account.toLowerCase()) {
        isLoadingRef.current = false;
        return;
      }

      const pool1Contract = new Contract(TOKEN_ADDRESSES.POOL1, POOL_ABI, provider);
      const pool2Contract = new Contract(TOKEN_ADDRESSES.POOL2, POOL_ABI, provider);

      const currentBlock = await provider.getBlockNumber();
      const BLOCK_RANGE = 50000;
      let fromBlock = Math.max(0, currentBlock - 200000);
      const events: Log[] = [];

      while (fromBlock < currentBlock) {
        const toBlock = Math.min(fromBlock + BLOCK_RANGE, currentBlock);
        
        console.log(`Querying from block ${fromBlock} to ${toBlock}`);

        const [events1, events2] = await Promise.all([
          pool1Contract.queryFilter(
            pool1Contract.filters.AddLiquidity(account),
            fromBlock,
            toBlock
          ),
          pool2Contract.queryFilter(
            pool2Contract.filters.AddLiquidity(account),
            fromBlock,
            toBlock
          )
        ]);

        events.push(...events1, ...events2);
        fromBlock += BLOCK_RANGE;
      }

      console.log(`Found ${events.length} total events`);

      const positions = await Promise.all(events.map(async (event) => {
        try {
          const block = await event.getBlock();
          const date = new Date(Number(block.timestamp) * 1000);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

          const parsedLog = pool1Contract.interface.parseLog({
            topics: event.topics as string[],
            data: event.data,
          });

          if (!parsedLog) return null;

          const [user, amountA, amountB, sharesToMint] = parsedLog.args;
          const tokenAAmount = Number(formatEther(amountA));
          const tokenBAmount = Number(formatEther(amountB));
          const totalValue = (tokenAAmount + tokenBAmount) / 100;
          const poolName = event.address === TOKEN_ADDRESSES.POOL1 ? "Pool1" : "Pool2";

          return {
            pool: poolName,
            date: formattedDate,
            price: `${tokenAAmount} CRASH / ${tokenBAmount} BURN`,
            shares: formatEther(sharesToMint),
            value: `${totalValue.toFixed(2)} TEST`
          };
        } catch (error) {
          console.error("Error processing event:", error);
          return null;
        }
      }));

      // Verificar nuevamente si la cuenta sigue conectada y es la misma
      const currentAccounts = await provider.listAccounts();
      if (currentAccounts.length === 0 || 
          currentAccounts[0].address.toLowerCase() !== account.toLowerCase()) {
        setPositions([]);
        isLoadingRef.current = false;
        return;
      }

      const validPositions = positions.filter((p): p is Position => p !== null);
      console.log("Valid positions:", validPositions);
      setPositions(validPositions);

    } catch (error) {
      console.error("Error loading positions:", error);
      setPositions([]);
      toast({
        variant: "destructive",
        title: "Error Loading Positions",
        description: "Failed to load your positions. Please try again.",
      });
    } finally {
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Si hay una cuenta, cargar posiciones
    if (account) {
      loadPositions();
    } else {
      // Si no hay cuenta, asegurarse de que las posiciones estén vacías
      setPositions([]);
    }

    const setupEventListeners = async () => {
      if (!window.ethereum || !account) return;

      const provider = new BrowserProvider(window.ethereum);
      const pool1Contract = new Contract(TOKEN_ADDRESSES.POOL1, POOL_ABI, provider);
      const pool2Contract = new Contract(TOKEN_ADDRESSES.POOL2, POOL_ABI, provider);

      const handleLiquidityAdded = async (
        user: string,
        amountA: bigint,
        amountB: bigint,
        sharesToMint: bigint,
        event: any
      ) => {
        if (user.toLowerCase() !== account.toLowerCase()) return;

        const block = await provider.getBlock(event.blockNumber);
        if (!block) return;

        // Verificar si la cuenta sigue conectada antes de agregar la nueva posición
        const accounts = await provider.listAccounts();
        if (accounts.length === 0 || 
            accounts[0].address.toLowerCase() !== account.toLowerCase()) {
          return;
        }

        const date = new Date(Number(block.timestamp) * 1000);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const tokenAAmount = Number(formatEther(amountA));
        const tokenBAmount = Number(formatEther(amountB));
        const totalValue = (tokenAAmount + tokenBAmount) / 100;
        const poolName = event.address === TOKEN_ADDRESSES.POOL1 ? "Pool1" : "Pool2";

        const newPosition: Position = {
          pool: poolName,
          date: formattedDate,
          price: `${tokenAAmount} CRASH / ${tokenBAmount} BURN`,
          shares: formatEther(sharesToMint),
          value: `${totalValue.toFixed(2)} TEST`
        };

        setPositions(prev => [...prev, newPosition]);
      };

      pool1Contract.on("AddLiquidity", handleLiquidityAdded);
      pool2Contract.on("AddLiquidity", handleLiquidityAdded);

      // Limpiar listeners cuando el componente se desmonta o cambia la cuenta
      return () => {
        pool1Contract.off("AddLiquidity", handleLiquidityAdded);
        pool2Contract.off("AddLiquidity", handleLiquidityAdded);
      };
    };

    const cleanupListeners = setupEventListeners();
    
    // Verificar cambios en localStorage para wallet/cuenta
    const checkLocalStorage = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      
      if (!walletAddress && positions.length > 0) {
        // Si la wallet se desconectó, limpiar posiciones
        setPositions([]);
      }
    };
    
    const intervalId = setInterval(checkLocalStorage, 1000);
    
    return () => {
      if (cleanupListeners) {
        cleanupListeners.then(cleanup => {
          if (cleanup) cleanup();
        });
      }
      clearInterval(intervalId);
    };
  }, [account]);

  return positions;
};
