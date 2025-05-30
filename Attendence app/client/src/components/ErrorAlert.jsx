import React from 'react';

function ErrorAlert({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <p>{message}</p>
    </div>
  );
}

export default ErrorAlert;
