# Himera DEX Project
HIMERA DEX ON ABC TESTNET (Abundande/Gelato) for Celestia Mammothon '25

Description - A DEX integrated with an AI-powered trading agent. The trading agent (mammoth bot) analyzes market data, detects arbitrage opportunities, and executes trades automatically when the users want the agent to proceed. Users can assign their agents specific strategies, configure risk levels, and allocate funds depending on the parameters that the Users input. The trading agent (Mammoth Bot) dynamically adapts to real-time market conditions, optimizing trading performance to better provide insight to the end User.

## Table of Contents 
Frontend Architecture
Core Features
Blockchain Architecture: Smart Contract and Deployment on ABC Testnet
End to End Workflow

Work in Progress:
AI agent with Gelato Relay, integrated in Frontend.

To-Do:
Backend Architecture

FUTURE DEVELOPMENTS AND PROJECT VISION

-------------------------
### Frontend Architecture
-------------------------
The architecture of the Himera Project Frontend:

We began from sample designs, then got this Figma design:
https://www.figma.com/design/iRYAJw5gfU8sm9tnDOrmMN/Himera-app?node-id=0-1&t=rLsAGru0jGyi8txG-1

   ◦ From there, we built it with Lovable.dev (due to time constrains, "vibe coding" style).
	- Vite
	- TypeScript
	- React
	- shadcn-ui
	- Tailwind CSS 
   ◦ Features:
       • Token swap interface. 
       • Pool stats and liquidity management dashboard. 
       • AI agent chat recommendations display (e.g., "Swap TokenA for TokenB"). 
       • Automation setup (user-defined triggers for swaps).

Description of capabilities of the frontend:  
	User interface can:  
                  - Enable wallet connection for secure interactions. 
                  - Display real-time DEX statistics, including =  Pool reserves / Token prices / User Positions on Pools. 
	Work in progress:
	- AI Agent integration in chat: the Mammoth AI Trading Agent will not stop, because the user is ALWAYS in full 			control of operations. The user can chat with the Agent, the Agent suggests strategies and results, and it always will 	offer two ways to proceed: guide the user in a step-by-step process to execute the strategy, or execute the strategy by itself on behalf of the user. The Mammoth Agent will never act on behalf of the user, automatically, without asking for permission first. 
                  

To-Do:
- Allow users to configure their AI agent:  Choosing trading strategies and setting risk levels to allocate funds. 
- Provide a dashboard to: - Monitor agent activity/  View trading performance (PnL, trade logs). 


-----------------
### Core Features
-----------------
        Core Features of this DEX 
                • Build abasic DEX 
                      ◦ Users can swap tokens directly on the platform using the Automated Market Maker (AMM). 
                      ◦ Token pairs are managed inliquidity pools. 
                • Liquidity Pool Management 
                        ◦ Users can povide liquidity and earn trading fees 
                        ◦ Liquidity providers receive LP tokens for their share in the pool
			◦ Reward are distributed to Liquidity providers from the FARM contract with REAL TEST tokens
			  on ABC Testnet, using Web3 Functions from Gelato.
                • Real-time Pool Stats 
                        ◦ Displaying key metrics (TVL, token price, user position on each Pool).

	Work in progress:
		• AI Agentintegration 
                      ◦ AI analyzes market conditions and poolreserves to identify undervalued tokens. 
                      ◦ Automates swaps based on predefined strategies. 
                • Automated Alerts and actions 
                      ◦ Agent triggers trades when specific conditions are met


-----------------------------
### Blockchain architecture:
----------------------------- 
     ◦ ABC Public Testnet 
      ◦ Features 
               • Smart contracts for: 
                     • Automated Market Maker (AMM) logic for token swaps. 
                     • Liquidity pools to handle reserves and fees. 
                     • Reward distribution for liquidity providers.

### Smart Contract and Deployment on ABC Testnet
Build smart contracts to:     
         Develop a **minimal DEX** with:         
         - Single liquidity pool functionality for token pairs.         
         - Token swapping using the constant product formula (`x * y = k`).         
         - Events for `addLiquidity`, `removeLiquidity`, and `Swap` for tracking activity.            
         - Store on-chain data for AI analysis, such as liquidity reserves and trade history. 
         - Deploy the following components on the ABC testnet:     
         - ERC20 token contracts for mock tokens (`TokenA` and `TokenB`).     
         - A lightweight AMM contract managing token swaps and liquidity.

We have gone a bit beyond the scope, but it was needed to create a price difference between two Liquidity Pools with different reserves and let the Agent offert the user to make an Arbitrage strategy to maximize profits.

At HIMERA DEX, we have created these 8 contracts:
- 2 ERC20 Token contracts, Crash & Burn
- 2 Pools contracts (AMM)
- 2 LP Token contracts
- 1 Farm contract
- 1 Sale contract

The Sale Contract let users buy Crash & Burn Tokens, with real TEST tokens in ABC Testnet, and send those 
TEST tokens to the Farm contract.
The Pools let users Addliquidity, RemoveLiquidity and make Swaps between Crash & Burn token, following the constant product 
formula (x * y = k).
Every swap in the pools takes a 0.3% fee.
The pools issue LP tokens to users, and the Farm contract holds TEST tokens, calculate and distribute rewards to Liquidity Providers, using Web3 Functions from Gelato for that.
Rewards could also be distributed manually by contract owner.

To-Do:
- Add more functions to provide onchain data to the AI Agent.


----------------------
### End-to-End Workflow 
----------------------
Connect Wallet:
	- If the user has not connected the wallet, the AI Agent asks the user to connect it.
	- When the user connects the wallet, the Mammoth shows a welcome message and the user balance. 

Buy Tokens:
	- The user can buy tokens directly, this is not automated.

Liquidity Provision
      ◦ User, after buying tokens, can provide liquidity to Pools, liquidity is added to the pool, and LP tokens are issued to user. 

Recommendations :
      ◦ Suggestions for optimal trades or liquidity actions, as Arbitrage strategy. 

Trading: 
      ◦ User can initiate swaps based on agent insights
      ◦ User can always see the token prices at each pool, and his positions in the Pools.


To-Do:
Pool Stats Analysis 
      ◦ Agent monitors the pool reserves, swap volumes and token price fluctuations 

Automation 
      ◦ Users can set conditions for automated swaps



--------------------
### Work in Progress
--------------------

Integration with Gelato Relay  
         - Enable gasless transactions with AI Agent using Gelato Relay


----------
### To-Do:
----------
Backend Architecture
   The architecture of the Himera Project Backend:
   ◦ Node.js + expressjs 
   ◦ Features 
            • Processes Al agent's recommendations andinteracts withthe blockchain. 
            • Routes user requests to blockchain and automation layers. 
            • Manages user profiles, trade history, and APl integrations.

      



---------------------------------------
### FUTURE DEVELOPMENTS AND PROJECT VISION
---------------------------------------
We believe users should be able to have the right tools to counteract the devaluation of the currency due to inflation.
We know lots of users lack of trading knowledge, so our aim is to help them with an AI Agent that can guide and teach them how to make profits or act on behalf of them to get those profits for them.

We also believe that users should be able to achieve their financial goals without the constrains of traditional systems, that everyday are becoming more and more aware of users activity on crypto finances.

For this reason, we think it would be a great idea to integrate our DEX with ZK proofs, as some projects are doing, so the users could provide real liquidity to other users to be able to earn money.
As this project is doing at the moment, allowing users to convert their Fiat money to crypto without having to pass through a different KYC process every time they need to get into crypto: http://zkp2p.xyz/

We think that the AI Agent can help and teach users on financial education and trading systems, but this Agent will also need to be based on something "better" than actual LLMs. 
For this reason, our vision is to train our own Model with trading strategies and market trends, and funraise this training thanks to ORA Protocol, which has presented a new fundraising strategy.

¿ICO or IDO? No, we plan to use an "IMO" (Initial Model Offering) on ORA Protocol, so users can invest and crowdfund the development of our new Trading Expert Model. In this way, that users will have ownership over the model and will also take a part of the revenue generated by the Model.

¡Help us build the Unstoppable AI Mammoth Model!


























