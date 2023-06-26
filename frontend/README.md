# Paymaster UI Starter Template

This is a frontend application for the Greeter contract, built with [Next.js](https://nextjs.org/) and deployed on the zkSync Testnet.

## Getting Started

To get started with the project, first install deps from root directory

```
yarn install
```

Next, we will need to compile, and deploy the required contracts. To do so in the root project directory run:

```
yarn compile && yarn deploy
```

This will compile and deploy all the contracts in `../contracts/contracts`. 

Update the `consts` to include the deployed contract addresses for the paymaster, greeter, and ERC721 contracts. 

## Running the Application

To run the application, use the following command:

```
yarn dev
```

This will start the Next.js server on `localhost:3000`.

## Updating the Greeting

To change the greeting message, navigate to `localhost:3000` in your web browser. Make sure you have MetaMask set up for the zkSync Testnet.

If you possess the applicable NFT then the transaction fees will be covered by the paymaster.

Enter a new greeting message and submit it by clicking the "Change greeting" button.

Note that the application is currently only deployed on the zkSync Testnet, so you will need to have an account on that network and some testnet funds to use it.

## Contributing

If you would like to contribute to the project, please follow the steps below:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push your changes to your fork
5. Submit a pull request to the main repository
