import React from "react";
import Input from "./Input";
import Button from "./Button";

const PaymasterMessage = ({
  selectedPaymaster,
  additionalInput,
  handleAdditionalAddressSubmit,
  handleAdditionalInputChange,
}) => {
  let message;
  let additionalInputNeeded = false;

  switch (selectedPaymaster) {
    case "Allowlist Paymaster 📜":
      message =
        "You've selected the Allowlist Paymaster. Please proceed with the transaction.";
      break;
    case "Gasless Paymaster 🆓":
      message =
        "You've selected the Gasless Paymaster. Ensure you have enough funds for the transaction.";
      break;
    case "ERC20Fixed Paymaster 🎫":
      message =
        "You've selected the ERC20Fixed Paymaster. You will need to input the ERC20Fixed Paymaster address and the token contract address that is required for the paymaster.";
      additionalInputNeeded = true;
      break;
    case "ERC721Gated Paymaster 🎨":
      message =
        "You've selected the ERC721Gated Paymaster. You will need to input the ERC721Gated Paymaster address and the NFT contract address that is gating the paymaster.";
      additionalInputNeeded = true;
      break;
    default:
      message = "Please select a Paymaster from the dropdown.";
  }

  return (
    <div>
      {additionalInputNeeded && (
        <div className="flex flex-row">
          <Input
            value={additionalInput}
            onChange={handleAdditionalInputChange}
            placeholder="Enter contract address..."
            title="Contract Address"
          />
          <Button
            className="mt-6"
            onClick={() => handleAdditionalAddressSubmit(additionalInput)}
          >
            Set Additional Contract
          </Button>
        </div>
      )}
      <p>{message}</p>
    </div>
  );
};

export default PaymasterMessage;
