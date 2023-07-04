import React from "react";

const Input = ({ value, onChange, placeholder, title, className }) => {
  return (
    <div className={`${className}`}>
      <div className="ml-1 font-bold">{title}:</div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mb-3 mt-1.5 border border-gray-400 mr-2 px-4 py-1.5 rounded-lg w-96"
      />
    </div>
  );
};

export default Input;
