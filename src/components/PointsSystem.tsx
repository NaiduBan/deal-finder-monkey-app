
import React, { useState, useEffect } from 'react';
import { Coins, Trophy, Target, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTotalPoints, getUserPointsHistory, awardPoints } from '@/services/pointsService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PointsSystem = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchPointsData();
    }
  }, [session]);

  const fetchPointsData = async () => {
    if (!session?.user) return;
    
    try {
      const [points, history] = await Promise.all([
        getUserTotalPoints(session.user.id),
        getUserPointsHistory(session.user.id)
      ]);
      
      setTotalPoints(points);
      setPointsHistory(history);
      
      // Check last checkin
      const todayCheckin = history.find(h => 
        h.action_type === 'daily_checkin' && 
        new Date(h.created_at).toDateString() === new Date().toDateString()
      );
      
      if (todayCheckin) {
        setLastCheckin(todayCheckin.created_at);
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCheckin = async () => {
    if (!session?.user) return;

    try {
      await awardPoints(
        session.user.id,
        10,
        'daily_checkin',
        'Daily check-in bonus'
      );
      
      setTotalPoints(prev => prev + 10);
      setLastCheckin(new Date().toISOString());
      
      toast({
        title: 'Daily Check-in Complete!',
        description: 'You earned 10 points! 🎉',
      });
      
      fetchPointsData();
    } catch (error) {
      console.error('Error with daily checkin:', error);
      toast({
        title: 'Error',
        description: 'Unable to complete check-in. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!session?.user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Earn Points & Rewards</h3>
        <p className="text-gray-600 mb-4">Sign in to start earning points for your activities!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-6 rounded mb-4"></div>
          <div className="bg-gray-200 h-20 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-4 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canCheckinToday = !lastCheckin || 
    new Date(lastCheckin).toDateString() !== new Date().toDateString();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
      {/* Points Summary */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Coins className="w-8 h-8 text-monkeyGreen mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">{totalPoints}</h2>
        </div>
        <p className="text-gray-600">Total Points Earned</p>
      </div>

      {/* Daily Check-in */}
      <div className="bg-gradient-to-r from-monkeyGreen to-green-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold">Daily Check-in</h3>
              <p className="text-sm opacity-90">Earn 10 points daily</p>
            </div>
          </div>
          <Button
            onClick={handleDailyCheckin}
            disabled={!canCheckinToday}
            variant={canCheckinToday ? "secondary" : "outline"}
            size="sm"
          >
            {canCheckinToday ? 'Check In' : 'Done Today'}
          </Button>
        </div>
      </div>

      {/* Ways to Earn Points */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-monkeyGreen" />
          Ways to Earn Points
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Daily Check-in</span>
            <span className="text-monkeyGreen font-medium">+10 points</span>
          </div>
          <div className="flex justify-between">
            <span>Save a Deal</span>
            <span className="text-monkeyGreen font-medium">+5 points</span>
          </div>
          <div className="flex justify-between">
            <span>Write a Review</span>
            <span className="text-monkeyGreen font-medium">+15 points</span>
          </div>
          <div className="flex justify-between">
            <span>Share a Deal</span>
            <span className="text-monkeyGreen font-medium">+5 points</span>
          </div>
          <div className="flex justify-between">
            <span>Refer a Friend</span>
            <span className="text-monkeyGreen font-medium">+50 points</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {pointsHistory.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-monkeyGreen" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pointsHistory.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-monkeyGreen font-medium">
                  +{activity.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsSystem;
