import React from 'react';

function LoadingSpinner({ message = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">{message}</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;