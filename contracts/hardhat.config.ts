import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@nomiclabs/hardhat-etherscan";

import { HardhatUserConfig } from "hardhat/config";

const getNetworkConfig = () => {
  const env = process.env.DEPLOY_ENV || "local";
  switch (env) {
    case "local":
      return {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      };
    case "ci":
      return {
        url: "http://127.0.0.1:8011",
        ethNetwork: "sepolia",
        zksync: true,
      };
    case "testnet":
      return {
        url: "https://sepolia.era.zksync.dev",
        ethNetwork: "sepolia",
        zksync: true,
        // Verification endpoint for Sepolia
        verifyURL:
          "https://explorer.sepolia.era.zksync.dev/contract_verification",
      };
    default:
      throw new Error(`Unsupported DEPLOY_ENV: ${env}`);
  }
};

const networkConfig = getNetworkConfig();

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet: networkConfig,
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
