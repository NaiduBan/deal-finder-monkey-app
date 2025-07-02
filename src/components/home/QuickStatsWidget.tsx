import React from 'react';
import { Wallet, Target, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const QuickStatsWidget = () => {
  const { user } = useUser();
  
  // Mock data - in real app this would come from user's activity
  const stats = {
    monthlySavings: 2450,
    dealsUsed: 12,
    streak: 7
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Your Impact</h3>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">₹{stats.monthlySavings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-accent">{stats.dealsUsed}</p>
            <p className="text-xs text-muted-foreground">Deals Used</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          🎉 You're saving more than 89% of users this month!
        </p>
      </div>
    </div>
  );
};

export default QuickStatsWidget;