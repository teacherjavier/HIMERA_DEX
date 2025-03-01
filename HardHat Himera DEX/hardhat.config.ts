import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, ".env") });

const { PRIVATE_KEY, POLYGON_RPC_URL } = process.env;
const { PRIVATE_KEY_DEV, RPC_URL, CHAIN_ID } = process.env;

if (!POLYGON_RPC_URL) {
  throw new Error("POLYGON_RPC_URL no está definido en el archivo .env");
}

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY no está definido en el archivo .env");
}

const config: HardhatUserConfig = {
  defaultNetwork: "polygon",
  networks: {
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    ABC_testnet:{
      url: RPC_URL || "",
      accounts: PRIVATE_KEY_DEV ? [PRIVATE_KEY_DEV] : [],
      chainId: parseInt(CHAIN_ID || "0"),
    }, 
  },
  etherscan: {
    apiKey: {
      'ABC_testnet': 'empty'
    },
    customChains: [
      {
        network: "ABC_testnet",
        chainId: 112,
        urls: {
          apiURL: "https://explorer.abc.t.raas.gelato.cloud/api",
          browserURL: "https://explorer.abc.t.raas.gelato.cloud",
        }
      }, 
   ]
  }, 
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
