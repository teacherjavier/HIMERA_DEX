
import React, { useState, useEffect, useRef } from "react";
import { TabButtons } from "./positions/TabButtons";
import { TableHeader } from "./positions/TableHeader";
import { PositionRow } from "./positions/PositionRow";
import { usePositions } from "@/hooks/usePositions";

export const PositionsTable = () => {
  const [account, setAccount] = useState<string | null>(null);
  const lastAccountRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAccount = async () => {
      if (!window.ethereum) return;
      
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const currentAccount = accounts[0] || null;
        
        // Solo actualizar si realmente cambió la cuenta
        if (currentAccount !== lastAccountRef.current) {
          lastAccountRef.current = currentAccount;
          setAccount(currentAccount);
        }
      } catch (error) {
        console.error("Error checking account:", error);
        if (lastAccountRef.current !== null) {
          lastAccountRef.current = null;
          setAccount(null);
        }
      }
    };

    checkAccount();

    // Verificar localStorage para cambios en la wallet
    const checkLocalStorage = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      
      if (walletAddress && walletAddress !== lastAccountRef.current) {
        lastAccountRef.current = walletAddress;
        setAccount(walletAddress);
      } else if (!walletAddress && lastAccountRef.current) {
        lastAccountRef.current = null;
        setAccount(null);
      }
    };

    const intervalId = setInterval(checkLocalStorage, 1000);

    // Listener para eventos de cambio de cuenta en MetaMask
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        const newAccount = accounts[0] || null;
        if (newAccount !== lastAccountRef.current) {
          lastAccountRef.current = newAccount;
          setAccount(newAccount);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
        clearInterval(intervalId);
      };
    }

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const positions = usePositions(account);

  return (
    <section className="border border-[color:var(--Neutral-Colors-400,#5F5F5B)] shadow-[1px_1px_1px_0px_rgba(16,25,52,0.40)] bg-[#1E1E1E] p-3 rounded-[5px] border-solid max-md:max-w-full">
      <div className="rounded-sm bg-[#B2B1AE]/30 p-2 mb-1 border-2 border-solid border-2 border-solid border-[#5F5F5B]">
        <div className="items-center border-b-[color:var(--Secondary-Colors-Color-2,#DFF3FD)] z-10 flex gap-2 text-base text-[#B2B1AE] font-medium leading-[1.2] -mt-1 pr-6 border-b border-solid max-md:pr-5">
          <TabButtons />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <TableHeader />
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <PositionRow key={index} position={position} />
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-[#B2B1AE]">
                    No positions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
