# Paymaster UI Starter Template 🚀

Welcome to the Paymaster UI Starter Template! This is a frontend application configured to interact with various Paymaster contracts. It's built with the fast, modern web framework, [Next.js](https://nextjs.org/), and is designed to run on the zkSync Testnet.

## Getting Started 🏁

To get started with the project, install the dependencies from the root directory with:

```
yarn install
```

Next, compile and deploy the required contracts. To do so in the root project directory, run:

```
yarn compile && yarn deploy
```

This will compile and deploy all the contracts located in `../contracts/contracts`. 

Following this, update the `consts` to include the deployed contract addresses for the Paymaster, Greeter, and ERC721 contracts. 

## Running the Application 🏃‍♀️

To run the application, use the following command:

```
yarn dev
```

This command starts the Next.js server on `localhost:3000`.

## Interacting with Paymaster Contracts 🖥️

To interact with the Paymaster contracts, navigate to `localhost:3000` in your web browser. Please ensure you have MetaMask set up for the zkSync Testnet.

Should you possess the applicable NFT, the transaction fees will be covered by the Paymaster. 

Enter a new greeting message and submit it by clicking the "Change greeting" button.

Please note, the application is currently deployed only on the zkSync Testnet, so you'll need to have an account on that network, and some testnet funds to use it.

## Contributing 🙋‍♂️

We welcome all contributors! If you're interested in contributing to this project, please follow the steps below:

1. Fork the repository
2. Create a new branch for your changes
3. Implement your changes and commit them
4. Push your changes to your fork
5. Submit a pull request to the main repository

Your contribution will be reviewed and, if it's beneficial to the project, merged into the main branch. Thank you for your interest in our project!