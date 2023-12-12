import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
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
  console.log(`Running deploy script for the MyNFT contract...`);

  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // Deploying the ERC721 contract
  const nftContractArtifact = await deployer.loadArtifact("MyNFT");
  const nftContract = await deployer.deploy(nftContractArtifact, []);
  console.log(`NFT Contract address: ${nftContract.address}`);

  // Mint NFTs to the recipient address
  const tx = await nftContract.createCollectible(RECIPIENT_ADDRESS);
  await tx.wait();

  // Get and log the balance of the recipient
  const balance = await nftContract.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Balance of the recipient: ${balance}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/token/ERC721.sol:MyNFT";
  const verificationId = await hre.run("verify:verify", {
    address: nftContract.address,
    contract: contractFullyQualifedName,
    constructorArguments: [],
    bytecode: nftContractArtifact.bytecode,
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );

  console.log(`Done!`);
}
