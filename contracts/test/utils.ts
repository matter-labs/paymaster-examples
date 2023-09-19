import { Contract, Wallet, Provider } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as hre from "hardhat";
import * as ethers from "ethers";

async function deployContract(
  deployer: Deployer,
  contract: string,
  params: any[],
): Promise<Contract> {
  const artifact = await deployer.loadArtifact(contract);

  const deploymentFee = await deployer.estimateDeployFee(artifact, params);
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`${contract} deployment is estimated to cost ${parsedFee} ETH`);

  return await deployer.deploy(artifact, params);
}

async function fundAccount(wallet: Wallet, address: string, amount: string) {
  // fund account
  await (
    await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
    })
  ).wait();

  console.log(`Account ${address} funded with ${amount}`);
}

function setupDeployer(
  url: string,
  privateKey: string,
): [Provider, Wallet, Deployer] {
  // setup deployer
  const provider = new Provider(url);
  const wallet = new Wallet(privateKey, provider);
  const deployer = new Deployer(hre, wallet);

  return [provider, wallet, deployer];
}

export { deployContract, fundAccount, setupDeployer };
