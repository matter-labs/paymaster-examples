# Paymaster Examples Repository 📁

Welcome to the world of Paymasters!! 🎉 🌍 🎉

> ⚠️ **Work in Progress**: Please note that none of the contracts in this repository have been fully tested yet! These contracts are **not** designed for production use.

This repository contains several example Paymaster Smart Contracts that cover most common use cases. You can find the following contracts:

- 🆓 **[Gasless Paymaster](./contracts/paymasters/GaslessPaymaster.sol)**: Pays fees for any account.
- 📜 **[Allowlist Paymaster](./contracts/paymasters/AllowlistPaymaster.sol)**: Pays fees for accounts present in a predefined list (the "allow list").
- 🎫 **[ERC20 Fixed Paymaster](./contracts/paymasters/ERC20fixedPaymaster.sol)**: Accepts a fixed amount of a specific ERC20 token in exchange for covering gas fees. It only services accounts that have a balance of the specified token. 
- 🎨 **[ERC721 Gated Paymaster](./contracts/paymasters/ERC721gatedPaymaster.sol)**: Pays fees for accounts that hold a specific ERC721 token (NFT).
- 🎨 **[TimeBased Paymaster](./contracts/paymasters/TimeBasedPaymaster.sol)**: Pays fees for accounts that interact with contract at specific times.
- ✍🏻 **[SignatureBased Paymaster](./contracts/paymasters/SignatureBasedPaymaster.sol)**: Pays fees for accounts that provides valid signatures.

Stay tuned! More Paymaster examples will be added over time. This project was scaffolded with [zksync-cli](https://github.com/matter-labs/zksync-cli).

## Repository structure 🏗️

- `/contracts`: Contains the smart contracts.
- `/deploy`: Contains deployment and contract interaction scripts.
- `/test`: Contains test files.
- `hardhat.config.ts`: The configuration file for the Hardhat framework.

## Commands 💻

- `yarn hardhat compile`: Compiles the contracts.
- `yarn test`: Runs tests. **Make sure to check the test requirements below.**
- `yarn format`: Runs prettier formatter.
- `yarn hardhat deploy-zksync --script <name-of-script>`: This command is used to deploy contracts. Scripts for deployment are located in the `/deploy` directory.

> ⚠️ **Please Note**: Certain deployment scripts (such as `erc20FixedPaymaster.ts` and `erc721GatedPaymaster.ts`) requires addresses as input arguments during the contract's construction phase.

### Environment variables 🌳

To prevent the leakage of private keys, we use the `dotenv` package to load environment variables. This is particularly used to load the wallet private key, which is required to run the deployment script.

To use it, rename `.env.example` to `.env` and input your private key.

```
WALLET_PRIVATE_KEY=123cde574ccff....
```

### Local testing 🧪

To run tests, you'll need to start the zkSync local environment. Please refer to [this section of the docs](https://v2-docs.zksync.io/api/hardhat/testing.html#prerequisites) for details.

Without starting the zkSync local environment, the tests will fail with an error: `Error: could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.7.2)`

## Have a request? 🙋‍♀️
If you would like to see a specific type of Paymaster contract included in this repository, please let us know in the [zkync-developers/discussions](https://github.com/zkSync-Community-Hub/zksync-developers/discussions)! We value your feedback and are always open to new ideas for demonstrating different use-cases and techniques.

## Official links 🔗

- [Website](https://zksync.io/)
- [Documentation](https://v2-docs.zksync.io/dev/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)
