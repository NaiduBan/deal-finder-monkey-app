
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
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center space-x-4">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center shadow-md`}>
              <TrendingUp className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-900`}>{displayedOffersCount}</div>
              <div className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-600 font-medium`}>Today's Deals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center space-x-4">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-purple-500 rounded-full flex items-center justify-center shadow-md`}>
              <Zap className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-900`}>{cuelinkOffersCount}</div>
              <div className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-600 font-medium`}>Flash Deals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center space-x-4">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-green-500 rounded-full flex items-center justify-center shadow-md`}>
              <Star className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-900`}>{categoriesCount}</div>
              <div className={`${isMobile ? 'text-sm' : 'text-base'} text-green-600 font-medium`}>Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center space-x-4">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-yellow-500 rounded-full flex items-center justify-center shadow-md`}>
              <Gift className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-900`}>₹10K+</div>
              <div className={`${isMobile ? 'text-sm' : 'text-base'} text-yellow-600 font-medium`}>Avg. Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStatsSection;
