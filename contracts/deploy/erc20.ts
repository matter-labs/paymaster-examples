import * as ethers from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-web3";
// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// We will mint the NFTs to this address
const RECIPIENT_ADDRESS = "RECIPIENT_ADDRESS";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

if (!RECIPIENT_ADDRESS)
  throw "⛔️ RECIPIENT_ADDRESS not detected! Add it to the RECIPIENT_ADDRESS variable!";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the MyERC20 contract...`);
  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // Deploying the ERC20 contract
  const name = "My ERC20";
  const symbol = "ERC20";
  const decimals = 18;
  const tokenContractArtifact = await deployer.loadArtifact("MyERC20");
  const deploymentFee = await deployer.estimateDeployFee(
    tokenContractArtifact,
    [name, symbol, decimals],
  );
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);
  // Deploy the contract
  const tokenContract = await deployer.deploy(tokenContractArtifact, [
    name,
    symbol,
    decimals,
  ]);
  console.log(`Token contract address: ${tokenContract.address}`);

  // Mint token to the recipient address
  const amount = ethers.utils.parseEther("100");
  const tx = await tokenContract.mint(RECIPIENT_ADDRESS, amount);
  console.log(`Token minted to ${RECIPIENT_ADDRESS}! TxHash: ${tx.hash}`);
  await tx.wait();

  // Get and log the balance of the recipient
  const balance = await tokenContract.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Token balance of the recipient: ${balance}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/token/ERC20.sol:MyERC20";
  const verificationId = await hre.run("verify:verify", {
    address: tokenContract.address,
    contract: contractFullyQualifedName,
    constructorArguments: [name, symbol, decimals],
    bytecode: tokenContractArtifact.bytecode,
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );

  console.log(`Done!`);
}
