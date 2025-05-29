
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Store, Star, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PreferencesMenu = () => {
  const preferenceTypes = [
    {
      type: 'stores',
      title: 'Preferred Stores',
      description: 'Choose stores where you shop most often',
      icon: Store,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      type: 'brands',
      title: 'Favorite Brands',
      description: 'Select brands you love to see personalized offers',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      type: 'categories',
      title: 'Favorite Categories',
      description: 'Select categories you are interested in',
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Preferences</h1>
            <p className="text-white/90 text-sm">Customize your experience</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {preferenceTypes.map((preference) => {
          const IconComponent = preference.icon;
          return (
            <Link key={preference.type} to={`/preferences/${preference.type}`}>
              <Card className={`${preference.borderColor} hover:shadow-md transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-full ${preference.bgColor}`}>
                      <IconComponent className={`w-8 h-8 ${preference.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {preference.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {preference.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PreferencesMenu;
