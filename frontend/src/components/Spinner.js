import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center mx-auto text-center justify-center">
      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 018 8v-2a6 6 0 00-6-6h-2zm-8 0a4 4 0 014-4V4a8 8 0 00-8 8h4zm12 0a4 4 0 01-4 4v2a6 6 0 006-6h2z"
        ></path>
      </svg>
      <span>Loading...</span>
    </div>
  );
};

export default Spinner;
