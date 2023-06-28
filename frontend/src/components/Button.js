import React from "react";

const Button = ({ onClick, children, className }) => {
  return (
    <div className={`${className}`}>
      <button
        onClick={onClick}
        className="ml-2 h-10 max-w-xs bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
