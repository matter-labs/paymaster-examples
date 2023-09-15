import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@nomiclabs/hardhat-etherscan";

const getNetworkConfig = () => {
  const env = process.env.DEPLOY_ENV || 'local';
  switch (env) {
    case 'local':
      return {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      };
    case 'ci':
      return {
        url: "http://127.0.0.1:8011",
        ethNetwork: "goerli",
        zksync: true,
      };
    case 'testnet':
      return {
        url: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "goerli",
        zksync: true,
        // Verification endpoint for Goerli
        verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
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
