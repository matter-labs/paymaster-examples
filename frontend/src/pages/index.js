import React, { useState, useEffect } from "react";
import { utils } from "zksync-web3";
import { ethers } from "ethers";
import useWeb3 from "../hooks/useWeb3";
import useNFTBalance from "../hooks/useNFTBalance";
import useAccountChanges from "../hooks/useAccountChanges";
import { updateGreeting } from "../utils";
import Greeting from "../components/Greeting";
import Input from "../components/Input";
import Loading from "../components/Spinner";
import Button from "@/components/Button";
import { PAYMASTER_CONTRACT_ADDRESS } from "../constants/consts";

const Home = () => {
  const {
    provider,
    signer,
    contractInstance,
    NFTcontractInstance,
    setProvider,
    setSigner,
    setContractInstance,
    setNFTContractInstance,
  } = useWeb3();
  const [newGreeting, setNewGreeting] = useState("");
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  const nftBalance = useNFTBalance(NFTcontractInstance, signer);
  useAccountChanges(
    setProvider,
    setSigner,
    setContractInstance,
    setNFTContractInstance,
    () => setGreeting(updateGreeting(contractInstance))
  );

    // Initial fetch of the greeting
    useEffect(() => {
      async function fetchGreeting() {
        if (contractInstance) {
          const fetchedGreeting = await contractInstance.greet();
          setGreeting(fetchedGreeting);
          setLoading(false);
        }
      }
  
      fetchGreeting();
    }, [contractInstance]);

  const payForGreetingChange = async () => {
    if (NFTcontractInstance) {
      try {
        const signerAddress = await signer.getAddress();

        // Query for the balance of the current user
        const nftBalance = await NFTcontractInstance.balanceOf(signerAddress);

        if (nftBalance > 0) {
          const txHandle = await contractInstance.setGreeting(
            newGreeting,
            await payWithPayMaster(),
          );
          // Wait until the transaction is committed
          const receipt = await txHandle.wait();
          // Update greeting
          const updatedGreeting = await contractInstance.greet();
          setGreeting(updatedGreeting);
        } else {
          const txHandle = await contractInstance.setGreeting(newGreeting);
          const receipt = await txHandle.wait();
          const updatedGreeting = await contractInstance.greet();
          setGreeting(updatedGreeting);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const payWithPayMaster = async () => {
    let paymasterBalance = await provider.getBalance(
      PAYMASTER_CONTRACT_ADDRESS,
    );
    const gasPrice = await provider.getGasPrice();

    // estimate gasLimit via paymaster
    const paramsForFeeEstimation = utils.getPaymasterParams(
      PAYMASTER_CONTRACT_ADDRESS,
      {
        type: "General",
        innerInput: new Uint8Array(),
      },
    );

    // estimate gasLimit via paymaster
    const gasLimit = await contractInstance.estimateGas.setGreeting(
      newGreeting,
      {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paramsForFeeEstimation,
        },
      },
    );
    
    const paymasterParams = utils.getPaymasterParams(
      PAYMASTER_CONTRACT_ADDRESS,
      {
        type: "General",
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
      },
    );

    return {
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: ethers.BigNumber.from(0),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Greeting greeting={greeting} nftBalance={nftBalance} />
          <Input
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
          />
          <Button
            onClick={() => payForGreetingChange()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Change greeting
          </Button>
        </>
      )}
    </div>
  );
};

export default Home;
