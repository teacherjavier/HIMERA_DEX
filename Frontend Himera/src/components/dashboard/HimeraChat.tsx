
import React, { useState, useEffect, useRef } from "react";

interface Message {
  sender: 'user' | 'mammoth';
  content: string;
}

// Definimos direcciones conocidas para comparar en minúsculas
const KNOWN_WALLETS = {
  WALLET_1: "0xbcaeb9435e312eda7132a774583239a9e077d512", // Primera wallet específica
  WALLET_2: "0xb57dd0448ee807bbd4abde6bfae30ce137de26cb"  // Segunda wallet específica
};

export const HimeraChat = () => {
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Debug: Imprimir las constantes en la consola para verificar
  useEffect(() => {
    console.log("KNOWN_WALLET_1:", KNOWN_WALLETS.WALLET_1);
    console.log("KNOWN_WALLET_2:", KNOWN_WALLETS.WALLET_2);
  }, []);

  useEffect(() => {
    const handleWalletConnection = () => {
      const balance = localStorage.getItem('walletBalance');
      const address = localStorage.getItem('walletAddress');
      
      if (balance && address) {
        setWalletBalance(balance);
        // Guardamos la dirección en minúsculas para comparar de forma consistente
        const normalizedAddress = address.toLowerCase();
        setWalletAddress(normalizedAddress);
        console.log("Wallet conectada:", normalizedAddress);
        setShowWelcomeMessage(true);
      } else {
        setWalletAddress(null);
        setWalletBalance(null);
        setShowWelcomeMessage(false);
      }
    };

    // Check initial state
    handleWalletConnection();

    // Check for congratulation message trigger
    const checkCongratulations = () => {
      if (localStorage.getItem('showCongratulations') === 'true') {
        setShowCongratulations(true);
        // Limpiar flag para no mostrar el mensaje más de una vez
        localStorage.removeItem('showCongratulations');
      }
    };

    // Initial check
    checkCongratulations();

    // Listen for wallet connection updates
    const intervalId = setInterval(() => {
      handleWalletConnection();
      checkCongratulations();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      sender: 'user',
      content: currentMessage
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setCurrentMessage("");
    
    // Generamos la respuesta del Mammoth basada en la dirección de la wallet
    setTimeout(() => {
      let responseContent = "";
      
      if (!walletAddress) {
        responseContent = "I'm afraid that to properly help you to earn money, you must connect your wallet first using that blue button up here";
      } else {
        // Debug para ver exactamente qué estamos comparando
        console.log("Comparando direcciones:");
        console.log("Current wallet address:", walletAddress);
        console.log("Known wallet 1:", KNOWN_WALLETS.WALLET_1);
        console.log("Known wallet 2:", KNOWN_WALLETS.WALLET_2);
        console.log("¿Coincide con wallet 1?", walletAddress === KNOWN_WALLETS.WALLET_1);
        console.log("¿Coincide con wallet 2?", walletAddress === KNOWN_WALLETS.WALLET_2);
        
        // Hacemos la comparación exacta de cadenas en minúsculas
        if (walletAddress === KNOWN_WALLETS.WALLET_1) {
          responseContent = "Well, looking at the Pool Stats and token prices, I can suggest you to BUY CRASH tokens and then making an Arbitrage Strategy to get above 50% profits";
        } else if (walletAddress === KNOWN_WALLETS.WALLET_2) {
          responseContent = "Well, looking at the Pool Stats and token prices, I can suggest you to BUY BURN tokens and then making an Arbitrage Strategy to get above 30% profits";
        } else {
          responseContent = "Based on your wallet activity and current market conditions, I recommend diversifying your portfolio with both CRASH and BURN tokens for optimal returns.";
        }
      }
      
      const newMammothMessage: Message = {
        sender: 'mammoth',
        content: responseContent
      };
      
      setMessages(prevMessages => [...prevMessages, newMammothMessage]);
    }, 800); // Small delay to simulate AI thinking
  };

  return (
    <section className="border mb-1 shadow-[1px_1px_1px_0px_rgba(16,25,52,0.40)] bg-[#1E1E1E] flex w-full flex-col items-stretch pt-2.5 pb-[21px] px-2.5 rounded-[5px] border-solid h-full">
      <h2 className="text-[#E7E7E6] text-base font-medium leading-none" >
        Mammoth Chat
      </h2>

      <div className="flex flex-1 flex-col gap-4 mt-4 overflow-y-auto max-h-[400px]">
        {showCongratulations && (
          <div className="flex gap-2">
            <div className="flex gap-2 w-[38px] py-1">
              <div className="flex w-[38px] gap-2">
                <div className="items-center bg-[#8951FF] flex w-[38px] gap-2 h-[38px] p-1.5 rounded-[2000px]">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/45b490384eae4eb6a53b528c6ba6ac8f/0f776fa2f14a5a23dfe261148dedb4935c6a9aa36342d99dab8339391ee5cad6?placeholderIfAbsent=true"
                    alt="AI Avatar"
                    className="aspect-[1] object-contain w-[26px]"
                  />
                </div>
              </div>
            </div>
            <div className="text-base text-[#E7E7E6] font-normal leading-6 w-[220px]">
              <div className="flex-1 shrink basis-[0%] w-full gap-2 p-2">
                Congratulations! Now you've summoned the Snow Breeze over your CRASH & BURN tokens, contributing to the Liquidity Pool and creating opportunities for other people to earn money. In retribution, you'll receive Rewards from the Great Cave, that will be distributed to your wallet every 15 minutes thanks to "Gelato W3F" Spell.
              </div>
            </div>
          </div>
        )}
        
        {showWelcomeMessage && walletBalance && (
          <div className="flex gap-2">
            <div className="flex gap-2 w-[38px] py-1">
              <div className="flex w-[38px] gap-2">
                <div className="items-center bg-[#8951FF] flex w-[38px] gap-2 h-[38px] p-1.5 rounded-[2000px]">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/45b490384eae4eb6a53b528c6ba6ac8f/0f776fa2f14a5a23dfe261148dedb4935c6a9aa36342d99dab8339391ee5cad6?placeholderIfAbsent=true"
                    alt="AI Avatar"
                    className="aspect-[1] object-contain w-[26px]"
                  />
                </div>
              </div>
            </div>
            <div className="text-base text-[#E7E7E6] font-normal leading-6 w-[220px]">
              <div className="flex-1 shrink basis-[0%] w-full gap-2 p-2">
                Hi, I'm Mammoth, welcome to your DEX Cave. I'll assist you on interpreting those charts painted with blood in the walls.
                At this moment, your balance is: {Number(walletBalance).toFixed(4)} TEST Tokens.
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className="flex gap-2">
            {message.sender === 'mammoth' ? (
              <>
                <div className="flex gap-2 w-[38px] py-1">
                  <div className="flex w-[38px] gap-2">
                    <div className="items-center bg-[#8951FF] flex w-[38px] gap-2 h-[38px] p-1.5 rounded-[2000px]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/45b490384eae4eb6a53b528c6ba6ac8f/0f776fa2f14a5a23dfe261148dedb4935c6a9aa36342d99dab8339391ee5cad6?placeholderIfAbsent=true"
                        alt="AI Avatar"
                        className="aspect-[1] object-contain w-[26px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-base text-[#E7E7E6] font-normal leading-6 w-[220px]">
                  <div className="flex-1 shrink basis-[0%] w-full gap-2 p-2">
                    {message.content}
                  </div>
                </div>
              </>
            ) : (
              <div className="ml-auto text-base text-[#E7E7E6] font-normal leading-6 bg-[#2A2A2A] rounded-lg p-2 max-w-[220px]">
                {message.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="items-stretch border border-[color:var(--Neutral-Colors-400,#5F5F5B)] flex min-h-[43px] gap-4 overflow-hidden mt-auto pl-6 pr-1 py-0.5 rounded-[100px] border-solid">
        <input
          type="text"
          placeholder="Message"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          className="text-[#E7E7E6] text-base font-normal leading-6 flex-1 shrink basis-4 bg-transparent border-none outline-none"
        />
        <button 
          type="submit"
          className="items-center bg-[#8951FF] flex gap-2 overflow-hidden w-10 h-10 my-auto p-2 rounded-[2000px]"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/45b490384eae4eb6a53b528c6ba6ac8f/e9f124ec977b4710f323d86fcae91ae7001f9233870a6104dd4ceeb05a5e79c0?placeholderIfAbsent=true"
            alt="Send"
            className="aspect-[1] object-contain w-6"
          />
        </button>
      </form>
    </section>
  );
};
