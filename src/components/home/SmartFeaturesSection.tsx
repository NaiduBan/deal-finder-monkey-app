
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const SmartFeaturesSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} text-gray-900`}>🚀 Smart Shopping Features</h2>
        <Badge variant="secondary" className="bg-spring-green-100 text-spring-green-700 w-fit">
          New Features
        </Badge>
      </div>
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <Link to="/ai-assistant" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:scale-105 h-full">
            <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
              <div className="flex items-center space-x-4">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg`}>
                  <Bot className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-blue-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>AI Assistant</h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-600 mt-1`}>Voice search & smart recommendations</p>
                  <Badge className="mt-3 bg-blue-500 text-white text-xs">Try Now</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/local-deals" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:scale-105 h-full">
            <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
              <div className="flex items-center space-x-4">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg`}>
                  <MapPin className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-green-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>Local Deals</h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-green-600 mt-1`}>Nearby stores & restaurants</p>
                  <Badge className="mt-3 bg-green-500 text-white text-xs">Explore</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/social-shopping" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:scale-105 h-full">
            <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
              <div className="flex items-center space-x-4">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg`}>
                  <Users className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-purple-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>Social Shopping</h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-purple-600 mt-1`}>Group buys & community deals</p>
                  <Badge className="mt-3 bg-purple-500 text-white text-xs">Join Now</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default SmartFeaturesSection;
