
import React from 'react';
import { Link } from 'react-router-dom';

interface PersonalizationBannerProps {
  hasLoadedPreferences: boolean;
  userPreferences: {[key: string]: string[]};
}

const PersonalizationBanner = ({ hasLoadedPreferences, userPreferences }: PersonalizationBannerProps) => {
  if (!hasLoadedPreferences || 
      (userPreferences.brands.length === 0 && 
       userPreferences.stores.length === 0 && 
       userPreferences.banks.length === 0)) {
    return null;
  }

  return (
    <div className="bg-spring-green-50 p-3 rounded-lg flex justify-between items-center mb-6">
      <div>
        <h3 className="font-medium text-spring-green-700">Personalized for You</h3>
        <p className="text-xs text-gray-600">Offers are filtered based on your preferences</p>
      </div>
      <Link 
        to="/preferences/brands" 
        className="bg-spring-green-600 text-white text-sm px-3 py-1 rounded-full"
      >
        Edit
      </Link>
    </div>
  );
};

export default PersonalizationBanner;
