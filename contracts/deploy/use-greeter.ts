import { Contract } from "zksync-ethers";
import * as ethers from "ethers";
import * as hre from "hardhat";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as ContractArtifact from "../artifacts-zk/contracts/utils/Greeter.sol/Greeter.json";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// Address of the greeter contract on zksync
const CONTRACT_ADDRESS = "";

if (!CONTRACT_ADDRESS) throw "⛔️ Contract address not provided";

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
  console.log(
    `Running script to interact with contract ${CONTRACT_ADDRESS} on ${hre.network.name}`,
  );
  const [signer] = await hre.ethers.getSigners();

  // Initialise contract instance
  const contract = new Contract(CONTRACT_ADDRESS, ContractArtifact.abi, signer);

  // Read message from contract
  console.log(`The message is ${await contract.greet()}`);

  // send transaction to update the message
  const newMessage = "Hello people!";
  const tx = await contract.setGreeting(newMessage);

  console.log(`Transaction to change the message is ${tx.hash}`);
  await tx.wait();

  // Read message after transaction
  console.log(`The message now is ${await contract.greet()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
