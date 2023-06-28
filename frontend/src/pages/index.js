import React, { useState, useEffect } from "react";
import { utils, Contract } from "zksync-web3";
import { ethers } from "ethers";
import useWeb3 from "../hooks/useWeb3";
import useAccountChanges from "../hooks/useAccountChanges";
import Greeting from "../components/Greeting";
import Input from "../components/Input";
import Loading from "../components/Spinner";
import Button from "@/components/Button";
import Title from "@/components/Title";
import ContractDropdown from "@/components/Dropdown";
import TxDetails from "@/components/TxDetails";
import PaymasterMessage from "@/components/PaymasterMessage";
import {
  GREETER_CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
  ERC20_GATED_PAYMASTER,
  ERC721_GATED_PAYMASTER,
  GASLESS_PAYMASTER,
  ALLOWLIST_PAYMASTER,
} from "../constants/consts";
import InstructionsCard from "@/components/InstructionsCard";

const Home = () => {
  const [greeterContractInstance, setGreeterContractInstance] = useState(null);
  const [additionalContractInstance, setAdditionalContractInstance] =
    useState(null);
  const [newGreeting, setNewGreeting] = useState("");
  const [greeting, setGreeting] = useState("");
  const [greeterSet, isGreeterSet] = useState("");
  const [selectedPaymaster, setSelectedPaymaster] = useState("");
  const [paymasterAddress, setPaymasterAddress] = useState("");
  const [paymasterSet, isPaymasterSet] = useState("");
  const [greeterAddress, setGreeterAddress] = useState("");
  const [additionalAddress, setAdditionalAddress] = useState("");
  const [additionalAddressSet, isAdditionalAddressSet] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [additionalInput, setAdditionalInput] = useState("");
  const [txDetails, setTxDetails] = useState(null);
  const [qualify, isQualify] = useState("");
  const { provider, signer, setProvider, setSigner } = useWeb3();
  const [loading, setLoading] = useState(true);

  // Handler to manage Paymaster selection
  const handlePaymasterChange = (event) => {
    setSelectedPaymaster(event.target.value);
    isPaymasterSet(false);
    isAdditionalAddressSet(false);
    setTxDetails(null);
    isQualify(null);
  };
  // Handler to set Paymaster address
  const handlePaymasterAddress = (event) => {
    setPaymasterAddress(event.target.value);
    isPaymasterSet(true);
  };
  // Handler for changes to the additional input
  const handleAdditionalInputChange = (event) => {
    setAdditionalInput(event.target.value);
  };
  // Handler for setting Greeter contract address
  const handleGreeterAddress = async (address) => {
    setGreeterAddress(address);

    if (provider && signer) {
      const greeterContract = new Contract(
        address,
        GREETER_CONTRACT_ABI,
        signer,
      );

      setGreeterContractInstance(greeterContract);

      const fetchedGreeting = await greeterContract.greet();
      setGreeting(fetchedGreeting);
      isGreeterSet(true);
      setLoading(false);
    }
  };
  // Handler for setting additional contract address
  const handleAdditionalAddressSubmit = async (address) => {
    setAdditionalAddress(address);

    if (provider && signer) {
      let additionalContract;

      if (selectedPaymaster === ERC20_GATED_PAYMASTER) {
        additionalContract = new Contract(
          additionalAddress,
          TOKEN_CONTRACT_ABI,
          signer,
        );
      } else if (selectedPaymaster === ERC721_GATED_PAYMASTER) {
        additionalContract = new Contract(
          additionalAddress,
          NFT_CONTRACT_ABI,
          signer,
        );
      }

      setAdditionalContractInstance(additionalContract);
      isAdditionalAddressSet(true);
    }
  };
  // Updates greeting on the contract
  const updateGreeting = async (newGreeting, params) => {
    try {
      let txHandle;
      if (params) {
        txHandle = await greeterContractInstance.setGreeting(
          newGreeting,
          params,
        );
      } else {
        txHandle = await greeterContractInstance.setGreeting(newGreeting);
      }
      // Wait until the transaction is committed
      await txHandle.wait();
      // Set transaction details
      setTxDetails(txHandle.hash);

      // Update greeting
      const updatedGreeting = await greeterContractInstance.greet();
      setGreeting(updatedGreeting);
    } catch (error) {
      console.error("Failed to update greeting:", error);
    }
  };
  // Handler to pay for greeting change
  const payForGreetingChange = async () => {
    try {
      const paymasterResult = await payWithPayMaster();
      if (paymasterResult.error) {
        // Handle the error message here
        if (
          paymasterResult.error.data.message.includes(
            "failed paymaster validation",
          )
        ) {
          isQualify(false);
          console.log(
            "You do not qualify to use the paymaster. You will have to pay your own way!",
          );
          await updateGreeting(newGreeting);
        }
      } else {
        isQualify(true);
        await updateGreeting(newGreeting, paymasterResult);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to get Paymaster params
  const getPaymasterParams = async () => {
    let params;

    switch (selectedPaymaster) {
      case "ERC20Fixed Paymaster 🎫":
        params = utils.getPaymasterParams(paymasterAddress, {
          type: "ApprovalBased",
          token: TOKEN_ADDRESS,
          minimalAllowance: ethers.BigNumber.from(1),
          innerInput: new Uint8Array(),
        });
        break;
      default:
        params = utils.getPaymasterParams(paymasterAddress, {
          type: "General",
          innerInput: new Uint8Array(),
        });
    }

    return params;
  };
  // Pays for the transaction with the Paymaster
  const payWithPayMaster = async () => {
    try {
      const gasPrice = await provider.getGasPrice();

      const paramsForFeeEstimation = await getPaymasterParams();

      const gasLimit = await greeterContractInstance.estimateGas.setGreeting(
        newGreeting,
        {
          customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paramsForFeeEstimation,
          },
        },
      );

      const paymasterParams = await getPaymasterParams();
      return {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: ethers.BigNumber.from(0),
        gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      };
    } catch (error) {
      return { error: error };
    }
  };

  return (
    <div className="flex flex-col min-h-screen py-2 mb-10">
      <Title />
      <div className="mt-8 mx-8 max-w-fit">
        <InstructionsCard />
      </div>
      <Greeting greeting={greeting} />
      <div className="flex flex-row">
        <Input
          placeholder="Greeter contract address 0x..."
          title="Enter Greeter contract address"
          className="mt-10 ml-8"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
        />
        <Button
          className="mt-16"
          onClick={() => handleGreeterAddress(inputAddress)}
        >
          Set
        </Button>
      </div>
      {greeterSet ? (
        <p className="ml-8 text-green-600">Greeter contract set!</p>
      ) : null}
      <div className="flex flex-row">
        <ContractDropdown
          selectedPaymaster={selectedPaymaster}
          handleContractChange={handlePaymasterChange}
          className="mt-5 ml-8"
        />
        <Input
          placeholder="Contract address 0x..."
          title="Enter Paymaster contract address"
          value={paymasterAddress}
          onChange={handlePaymasterAddress}
          className="mt-5"
        />
      </div>
      {paymasterSet ? (
        <p className="ml-8 text-green-600">Paymaster contract set!</p>
      ) : null}
      <div className="ml-8">
        <PaymasterMessage
          selectedPaymaster={selectedPaymaster}
          additionalInput={additionalInput}
          handleAdditionalInputChange={handleAdditionalInputChange}
          handleAdditionalAddressSubmit={handleAdditionalAddressSubmit}
        />
        {additionalAddressSet ? (
          <p className="text-green-600">Contract set!</p>
        ) : null}
      </div>
      <div className="flex flex-row">
        <Input
          placeholder="Greeter message..."
          title="Enter Greeter message"
          className="ml-8 mt-10"
          value={newGreeting}
          onChange={(e) => setNewGreeting(e.target.value)}
        />
        <Button className="mt-16" onClick={() => payForGreetingChange()}>
          Change Greeting{" "}
        </Button>
      </div>
      {qualify ? (
        <p className="text-green-600 ml-8">
          You are lucky! You qualify to use the paymaster!
        </p>
      ) : (
        <p className="text-red-600 ml-8">
          You do not qualify and will have to pay your own way!
        </p>
      )}
      {txDetails ? <TxDetails txHash={txDetails} /> : null}
    </div>
  );
};

export default Home;
