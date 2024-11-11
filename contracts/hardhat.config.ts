import "@matterlabs/hardhat-zksync";

import { HardhatUserConfig } from "hardhat/config";

// load env file
import dotenv from "dotenv";
dotenv.config();

const TEST_RICH_WALLET =
  "stuff slice staff easily soup parent arm payment cotton trade scatter struggle";

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      zksync: true,
    },
    ZKsyncInMemory: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "sepolia",
      zksync: true,
    },
    ZKsyncLocal: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    },
    ZKsyncEraTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      // Verification endpoint for Sepolia
      verifyURL:
        "https://explorer.sepolia.era.zksync.dev/contract_verification",
      accounts: [process.env.WALLET_PRIVATE_KEY || TEST_RICH_WALLET],
    },
    ZKsyncEraMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL:
        "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
      accounts: [process.env.WALLET_PRIVATE_KEY || TEST_RICH_WALLET],
    },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
