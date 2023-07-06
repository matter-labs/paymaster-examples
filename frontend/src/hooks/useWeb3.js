import { useState, useEffect } from "react";
import { Web3Provider } from "zksync-web3";
import { ethers } from "ethers";

const useWeb3 = (selectedPaymaster) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerBalance, setSignerBalance] = useState(null);

  useEffect(() => {
    const setupWeb3 = async () => {
      if (window.ethereum) {
        const provider = new Web3Provider(window.ethereum);
        setProvider(provider);

        await provider.send("eth_requestAccounts", []);

        const networkVersion = await provider
          .getNetwork()
          .then((network) => network.chainId);

        console.log("networkVersion :>> ", networkVersion);
        // supports both testnet and local-setup
        if (networkVersion != 270 && networkVersion != 280) {
          alert("Please switch to the zkSync Testnet to use this application.");
          return;
        }

        const signerInstance = provider.getSigner();
        setSigner(signerInstance);
        const signerBalance = await signerInstance.getBalance();
        setSignerBalance(ethers.utils.formatEther(signerBalance));
      }
    };

    setupWeb3();
  }, [selectedPaymaster]);

  return {
    provider,
    signer,
    signerBalance,
    setProvider,
    setSigner,
  };
};

export default useWeb3;
