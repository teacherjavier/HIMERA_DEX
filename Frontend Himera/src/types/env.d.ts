
interface ImportMetaEnv {
  VITE_CHAIN_ID:0x70;
  VITE_NETWORK_NAME:!"ABC TESTNET";
  VITE_RPC_URL:"https://rpc.abc.t.raas.gelato.cloud";
  VITE_BLOCK_EXPLORER_URL:"https://explorer.abc.t.raas.gelato.cloud";
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
