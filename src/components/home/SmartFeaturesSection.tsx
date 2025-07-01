
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const SmartFeaturesSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl text-gray-900">🚀 Smart Shopping Features</h2>
        <Badge variant="secondary" className="bg-spring-green-100 text-spring-green-700">
          New Features
        </Badge>
      </div>
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <Link to="/ai-assistant" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">AI Assistant</h3>
                  <p className="text-sm text-blue-600">Voice search & smart recommendations</p>
                  <Badge className="mt-2 bg-blue-500 text-white text-xs">Try Now</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/local-deals" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Local Deals</h3>
                  <p className="text-sm text-green-600">Nearby stores & restaurants</p>
                  <Badge className="mt-2 bg-green-500 text-white text-xs">Explore</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/social-shopping" className="block">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 text-lg">Social Shopping</h3>
                  <p className="text-sm text-purple-600">Group buys & community deals</p>
                  <Badge className="mt-2 bg-purple-500 text-white text-xs">Join Now</Badge>
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
