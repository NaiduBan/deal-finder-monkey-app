
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const SmartFeaturesSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-6">
      <h2 className="font-bold text-lg mb-3">Smart Shopping Features</h2>
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <Link to="/ai-assistant" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">AI Assistant</h3>
                  <p className="text-sm text-blue-600">Voice search & smart recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/local-deals" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Local Deals</h3>
                  <p className="text-sm text-green-600">Nearby stores & restaurants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/social-shopping" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Social Shopping</h3>
                  <p className="text-sm text-purple-600">Group buys & community deals</p>
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
