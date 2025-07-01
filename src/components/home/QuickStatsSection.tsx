
import React from 'react';
import { TrendingUp, Zap, Star, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickStatsSectionProps {
  displayedOffersCount: number;
  cuelinkOffersCount: number;
  categoriesCount: number;
}

const QuickStatsSection = ({ displayedOffersCount, cuelinkOffersCount, categoriesCount }: QuickStatsSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-900">{displayedOffersCount}</div>
              <div className="text-sm text-blue-600">Today's Deals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-purple-900">{cuelinkOffersCount}</div>
              <div className="text-sm text-purple-600">Flash Deals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-900">{categoriesCount}</div>
              <div className="text-sm text-green-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-900">₹10K+</div>
              <div className="text-sm text-yellow-600">Avg. Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStatsSection;
