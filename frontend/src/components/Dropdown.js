import React from "react";

const CONTRACTS = [
  "Allowlist Paymaster 📜",
  "Gasless Paymaster 🆓",
  "ERC20Fixed Paymaster 🎫",
  "ERC721Gated Paymaster 🎨",
];

const ContractDropdown = ({
  selectedPaymaster,
  handleContractChange,
  className,
}) => {
  return (
    <div className={`${className}`}>
      <div className="ml-1 font-bold">Select Paymaster Contract:</div>
      <select
        value={selectedPaymaster}
        onChange={handleContractChange}
        className="block w-64 mt-2 mb-3 border border-gray-400 mr-2 px-4 py-2 rounded-lg sm:text-sm"
      >
        <option value="" disabled hidden>
          Select a contract
        </option>
        {CONTRACTS.map((contract, index) => (
          <option key={index} value={contract}>
            {contract}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ContractDropdown;
