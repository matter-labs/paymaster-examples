import { useState, useEffect } from "react";
import { Web3Provider, Contract } from "zksync-web3";
import {
  GREETER_CONTRACT_ADDRESS,
  GREETER_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
} from "../constants/consts";
import { ethers } from "ethers";

const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [NFTcontractInstance, setNFTContractInstance] = useState(null);

  useEffect(() => {
    const setupWeb3 = async () => {
      if (window.ethereum) {
        const provider = new Web3Provider(window.ethereum);
        setProvider(provider);

        await provider.send("eth_requestAccounts", []);

        const networkVersion = await provider
          .getNetwork()
          .then((network) => network.chainId);
        if (networkVersion !== 280) {
          alert("Please switch to the zkSync Testnet to use this application.");
          return;
        }

        const signerInstance = provider.getSigner();
        setSigner(signerInstance);

        const contract = new Contract(
          GREETER_CONTRACT_ADDRESS,
          GREETER_CONTRACT_ABI,
          signerInstance,
        );
        setContractInstance(contract);

        const NFT_contract = new Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signerInstance,
        );
        setNFTContractInstance(NFT_contract);
      }
    };

    setupWeb3();
  }, []);

  return {
    provider,
    signer,
    contractInstance,
    NFTcontractInstance,
    setProvider,
    setSigner,
    setContractInstance,
    setNFTContractInstance,
  };
};

export default useWeb3;
