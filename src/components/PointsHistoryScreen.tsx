
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Award } from 'lucide-react';

const PointsHistoryScreen = () => {
  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Rewards</h1>
        <div className="w-6"></div> {/* Empty div for layout balance */}
      </div>
      
      {/* Coming soon message */}
      <div className="m-4 bg-white rounded-xl p-6 shadow-sm text-center">
        <div className="bg-monkeyGreen/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Award className="w-8 h-8 text-monkeyGreen" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Rewards Coming Soon!</h2>
        <p className="text-gray-600 mb-4">We're working on an exciting rewards program for you.</p>
        <p className="text-sm text-gray-500">Stay tuned for amazing deals and exclusive offers!</p>
      </div>
    </div>
  );
};

export default PointsHistoryScreen;
