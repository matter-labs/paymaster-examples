import React from "react";

const Input = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Enter new greeting"
      value={value}
      onChange={onChange}
      className="border border-gray-400 mr-2 px-4 py-2 rounded-lg w-64"
    />
  );
};

export default Input;
