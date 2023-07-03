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
        "You've selected the Allowlist Paymaster. Let's see if you are on the list!";
      break;
    case "Gasless Paymaster 🆓":
      message =
        "You've selected the Gasless Paymaster. Things are going to be cheap for you!";
      break;
    case "ERC20Fixed Paymaster 🎫":
      message =
        "You've selected the ERC20Fixed Paymaster. You will need to input the token contract address that is required for the paymaster.";
      additionalInputNeeded = true;
      break;
    case "ERC721Gated Paymaster 🎨":
      message =
        "You've selected the ERC721Gated Paymaster. You will need to input the NFT contract address that is gating the paymaster.";
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
