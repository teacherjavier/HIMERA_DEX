
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)"
] as const;

export const SALE_ABI = [
  "function buyCRASH() payable",
  "function buyBURN() payable"
] as const;

export const POOL_ABI = [
  "function addLiquidity(uint256 amountA, uint256 amountB) returns (uint256)",
  "event AddLiquidity(address indexed user, uint256 amountA, uint256 amountB, uint256 sharesToMint)"
] as const;

export const TOKEN_ADDRESSES = {
  CRASH: "0x66a2b0eafd9e5390a6113ef3a4e0c82ae2499a8f",
  BURN: "0x071ca67da352e2d03d334a47cce766642cd40938",
  SALE: "0x657f7f82ef5e45a32fe168a14b1a24c04d3c6771",
  POOL1: "0xe7Db23D728395873B2E1b848eD1564BBf3ddb4E9",
  POOL2: "0x6667076cD871b663726927304d8712BE1Bf8baCe"
} as const;
