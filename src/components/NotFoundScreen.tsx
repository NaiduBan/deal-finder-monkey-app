
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-monkeyBackground p-4">
      <div className="text-9xl mb-4">🙈</div>
      <h1 className="text-3xl font-bold mb-2">Oops!</h1>
      <p className="text-gray-600 mb-6 text-center">
        We couldn't find the deal you were looking for.
      </p>
      <Link 
        to="/home" 
        className="monkey-button"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundScreen;
