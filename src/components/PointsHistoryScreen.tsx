
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Award, Trophy, Gift } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const mockPointsHistory = [
  { id: 'p1', action: 'Saved offer', points: 5, date: '2025-05-15' },
  { id: 'p2', action: 'Enabled notifications', points: 10, date: '2025-05-14' },
  { id: 'p3', action: 'Daily login bonus', points: 15, date: '2025-05-13' },
  { id: 'p4', action: 'Set preferences', points: 20, date: '2025-05-12' },
  { id: 'p5', action: 'Completed profile', points: 50, date: '2025-05-10' },
];

const PointsHistoryScreen = () => {
  const { user, updatePoints } = useUser();
  
  const claimDailyBonus = () => {
    updatePoints(15);
  };
  
  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Loyalty Points</h1>
        <div className="w-6"></div> {/* Empty div for layout balance */}
      </div>
      
      {/* Points summary */}
      <div className="m-4 bg-white rounded-xl p-6 shadow-sm text-center">
        <div className="bg-monkeyGreen/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-monkeyGreen" />
        </div>
        <h2 className="text-3xl font-bold mb-1">{user.points} points</h2>
        <p className="text-gray-600 mb-4">Keep earning to unlock rewards!</p>
        
        {/* Daily bonus button */}
        <button
          onClick={claimDailyBonus}
          className="bg-monkeyYellow text-black font-semibold px-4 py-2 rounded-full flex items-center justify-center mx-auto"
        >
          <Gift className="w-5 h-5 mr-2" />
          Claim Daily Bonus (15pts)
        </button>
      </div>
      
      {/* Rewards section */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Available Rewards</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="bg-monkeyGreen/10 p-2 rounded-full mr-3">
                <Award className="w-6 h-6 text-monkeyGreen" />
              </div>
              <div>
                <h4 className="font-medium">$5 Store Credit</h4>
                <p className="text-sm text-gray-600">Use at any partner store</p>
              </div>
            </div>
            <button className="bg-monkeyGreen text-white px-3 py-1 text-sm rounded-full">
              500 pts
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="bg-monkeyGreen/10 p-2 rounded-full mr-3">
                <Award className="w-6 h-6 text-monkeyGreen" />
              </div>
              <div>
                <h4 className="font-medium">Free Shipping</h4>
                <p className="text-sm text-gray-600">On your next order</p>
              </div>
            </div>
            <button className="bg-monkeyGreen text-white px-3 py-1 text-sm rounded-full">
              200 pts
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg opacity-50">
            <div className="flex items-center">
              <div className="bg-monkeyGreen/10 p-2 rounded-full mr-3">
                <Award className="w-6 h-6 text-monkeyGreen" />
              </div>
              <div>
                <h4 className="font-medium">Premium Membership</h4>
                <p className="text-sm text-gray-600">1 month of exclusive deals</p>
              </div>
            </div>
            <button className="bg-gray-300 text-white px-3 py-1 text-sm rounded-full" disabled>
              1000 pts
            </button>
          </div>
        </div>
      </div>
      
      {/* Points history */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Points History</h3>
        
        <div className="divide-y">
          {mockPointsHistory.map(item => (
            <div key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.action}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <span className="text-monkeyGreen font-semibold">+{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsHistoryScreen;
