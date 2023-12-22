# Paymaster Examples 📁

Welcome to the world of Paymasters! 🎉

This directory contains several example Smart Contracts and a utility. These Smart Contracts are purely illustrative, showcasing different ways that a Paymaster Smart Contract can be structured. ⚠️ These contracts have **not been audited** and  are **not** designed for production use.  Please use these just as a reference.

The structure of the directory is as follows:

```
├── README.md
├── paymasters
│   ├── AllowlistPaymaster.sol
│   ├── ERC20fixedPaymaster.sol
│   ├── ERC721gatedPaymaster.sol
│   └── GaslessPaymaster.sol
├── token
│   ├── ERC20.sol
│   └── ERC721.sol
└── utils
    └── Greeter.sol
```

## Paymaster contracts 📝💰

Under the `paymaster` directory, we have four example Paymaster Smart Contracts:

- 🆓 **[Gasless Paymaster](./paymasters/GaslessPaymaster.sol)**: This Paymaster contract is designed to pay fees for any account. Truly a free-for-all!

- 📜 **[Allowlist Paymaster](./paymasters/AllowlistPaymaster.sol)**: This Paymaster contract only pays fees for accounts present in a predefined list (the "allow list").

- 🎫 **[ERC20 Fixed Paymaster](./paymasters/ERC20fixedPaymaster.sol)**: This Paymaster contract is designed to accept a fixed amount of a specific ERC20 token in exchange for covering gas fees. It only services accounts that have a balance of the specified token.

- 🎨 **[ERC721 Gated Paymaster](./paymasters/ERC721gatedPaymaster.sol)**: This Paymaster contract pays fees for accounts that hold a specific ERC721 token (NFT).

Each of these contracts provides an example of how you can gate or restrict the use of a Paymaster contract, by checking for certain conditions or requiring specific tokens.

## Token 🎟

In the `token` directory, we have two example token contracts:

- 🖼️ **[ERC721 Token](./token/ERC721.sol)**: This contract is an example of a non-fungible token (NFT) implementation using the ERC721 standard.
- 💰 **[ERC20 Token](./token/ERC20.sol)**: This contract is an example of a fungible token contract implementation using the ERC20 standard.

## Utils 🛠️

Under the `utils` directory, you'll find a utility contract:

- 👋 **[Greeter](./utils/Greeter.sol)**: A simple contract that returns a greeting. A classic for demonstrating simple contract structure!

## Have a request? 🙋‍♀️
If you would like to see a specific type of Paymaster contract included in this repository, please let us know in the [zkync-developers/discussions](https://github.com/zkSync-Community-Hub/zksync-developers/discussions)! We value your feedback and are always open to new ideas for demonstrating different use-cases and techniques.

## Important notice ⚠️

These contracts are for demonstration and educational purposes only. They are not audited or ready for production use. Always ensure that smart contracts used in production environments have been audited and tested thoroughly for security and correctness.

Enjoy exploring these contracts! 🚀