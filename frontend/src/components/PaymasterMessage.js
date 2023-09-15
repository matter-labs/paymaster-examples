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
      message = (
        <>
          {" "}
          <p>
            You've selected the Allowlist Paymaster. Let's see if you are on the
            list! 📜
          </p>{" "}
          <br />
          <p className="flex-wrap max-w-4xl	">
            The Allowlist Paymaster uses the{" "}
            <span className="font-bold">general paymaster flow</span> which
            should be used if no prior actions are required from the user for
            the paymaster to operate. For more information, proceed to our docs{" "}
            <a
              className="text-cyan-400"
              href="https://era.zksync.io/docs/reference/concepts/aa.html#general-paymaster-flow"
            >
              here.
            </a>
          </p>
        </>
      );
      break;
    case "Gasless Paymaster 🆓":
      message = (
        <>
          <p>
            You've selected the Gasless Paymaster. Things are going to be cheap
            for you!
          </p>{" "}
          <br />
          <p className="flex-wrap max-w-4xl	">
            The Gasless Paymaster uses the{" "}
            <span className="font-bold">general paymaster flow</span> which
            should be used if no prior actions are required from the user for
            the paymaster to operate. For more information, proceed to our docs{" "}
            <a
              className="text-cyan-400"
              href="https://era.zksync.io/docs/reference/concepts/aa.html#general-paymaster-flow"
            >
              here.
            </a>
          </p>
        </>
      );
      break;
    case "ERC20Fixed Paymaster 🎫":
      message = (
        <>
          <p>
            You've selected the ERC20Fixed Paymaster. You will need to input the
            token contract address that is required for the paymaster.
          </p>{" "}
          <br />
          <p className="flex-wrap max-w-4xl	">
            The ERC20Fixed Paymaster uses the{" "}
            <span className="font-bold">approval-based paymaster flow</span>{" "}
            which should be used if the user is required to set certain
            allowance to a token for the paymaster to operate. For more
            information, proceed to our docs{" "}
            <a
              className="text-cyan-400"
              href="https://era.zksync.io/docs/reference/concepts/aa.html#built-in-paymaster-flows"
            >
              here.
            </a>
          </p>
        </>
      );
      additionalInputNeeded = true;
      break;
    case "ERC721Gated Paymaster 🎨":
      message = (
        <>
          <p>
            You've selected the ERC721Gated Paymaster. You will need to input
            the NFT contract address that is gating the paymaster.
          </p>{" "}
          <br />
          <p className="flex-wrap max-w-4xl	">
            The ERC721Gated Paymaster uses the{" "}
            <span className="font-bold">general paymaster flow</span> which
            should be used if no prior actions are required from the user for
            the paymaster to operate. For more information, proceed to our docs{" "}
            <a
              className="text-cyan-400"
              href="https://era.zksync.io/docs/reference/concepts/aa.html#general-paymaster-flow"
            >
              here.
            </a>
          </p>
        </>
      );
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
