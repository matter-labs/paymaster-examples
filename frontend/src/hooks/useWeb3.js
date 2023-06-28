import { useState, useEffect } from "react";
import { Web3Provider, Contract } from "zksync-web3";
import {
  GREETER_CONTRACT_ADDRESS,
  GREETER_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  ERC20_CONTRACT_ADDRESS,
  ERC20_CONTRACT_ABI,
} from "../constants/consts";
import { ethers } from "ethers";

const useWeb3 = (selectedPaymaster, greeterAddress, additionalAddress) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

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
      }
    };

    setupWeb3();
  }, [selectedPaymaster]);

  return {
    provider,
    signer,
    setProvider,
    setSigner,
  };
};

export default useWeb3;
