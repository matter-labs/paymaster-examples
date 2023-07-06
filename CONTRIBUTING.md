# Contributing

## Welcome! 👋

Hello there, contributor! We're thrilled that you're interested in contributing to the Paymaster Examples Repository. This document aims to provide you with all the information you need to make meaningful contributions to this project. 

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Getting Started

- **Fork the repository.** Start by forking the main Paymaster Examples Repository to your own GitHub account.

- **Clone the repository.** Once forked, clone the repository to your local machine.

```bash
git clone https://github.com/<your-github-username>/paymaster-examples.git
```

- **Create a new branch.** Branches should have descriptive names to help track the feature, bugfix, or enhancement you're working on. Use the following format:

```bash
git checkout -b feature/description-of-your-feature
```

## Making Changes

- **Make your changes.** Be sure to thoroughly test your code and ensure it works as expected. We encourage comments and clear, readable code.

- **Compile and test contracts.** Remember to compile your contracts and test them before committing. You will need to write unit tests for each contract contributed. Use the following commands:

```bash
yarn compile:contracts
yarn test:contracts
```

- **Commit your changes.** Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

- **Push your changes.** Push your changes to your forked repository.

```bash
git push origin feature/description-of-your-feature
```

## Submitting a Pull Request

- **Create a pull request (PR).** Navigate to the main Paymaster Examples Repository, and you should see your recently pushed branch highlighted with a "Compare & pull request" button. Fill in the PR title and provide a clear, detailed description of your changes.

- **Wait for a review.** Your PR will be reviewed by our maintainers. They may ask for changes or clarifications, so be prepared to address any feedback.

## Code Style Guide

We use `Prettier` for code formatting. Ensure to run the formatter before committing your changes:

```bash
yarn format
```

## Where Can I Ask for Help?

If you need help with contributing or have any questions or concerns, feel free to open an issue or start a discussion in our [zkSync Community Hub](https://github.com/zkSync-Community-Hub/zkync-developers/discussions). We are here to help you.

## What's Next?

Once your PR is approved and merged, your contribution will be part of the Paymaster Examples Repository. Congratulations! We appreciate your efforts and look forward to more of your contributions in the future.

Remember, the best way to contribute is to have fun, be respectful, and keep learning. Thank you for contributing!

---

*Last updated: July 6, 2023*