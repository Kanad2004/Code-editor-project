import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        role="status"
      ></div>
    </div>
  );
};

export default Loader;