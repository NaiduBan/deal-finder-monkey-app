
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Award } from 'lucide-react';

const PointsHistoryScreen = () => {
  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-spring-green-600 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <Link to="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Rewards</h1>
        <div className="w-6"></div> {/* Empty div for layout balance */}
      </div>
      
      {/* Coming soon message */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center border">
          <div className="bg-spring-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Award className="w-10 h-10 text-spring-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rewards Coming Soon!</h2>
          <p className="text-gray-600 mb-4 max-w-sm mx-auto">We're working on an exciting rewards program. Earn points and redeem them for amazing deals and exclusive offers!</p>
          <p className="text-sm text-gray-500">Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};

export default PointsHistoryScreen;
