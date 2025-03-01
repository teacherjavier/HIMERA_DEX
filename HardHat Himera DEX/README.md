HIMERA DEX SMART CONTRACTS

Hardhat project

Contracts compiled using "npx hardhat compile", and deployed on ABC Testnet in the addresses specified in .env.example

At HIMERA DEX, we have created 8 contracts:

2 ERC20 Token contracts, Crash & Burn
2 Pools contracts (AMM)
2 LP Token contracts
1 Farm contracts
1 Sale contracts

The Sale Contract let users buy Crash & Burn Tokens, with real TEST tokens in ABC Testnet, and send thos TEST tokens to the Farm contract.
The Pools let users Addliquidity, RemoveLiquidity and make Swaps between Crash & Burn token, following the constant product formula (x * y = k).
The pools issue LP tokens to users, and the Farm contract holds TEST tokens, calculate and distribute rewards to Liquidity Providers, using Web3 Functions from Gelato for that.
Rewards could also be distributed manually by contract owner.
