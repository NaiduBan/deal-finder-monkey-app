
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Settings, Filter } from 'lucide-react';
import { getPreferenceStats, convertToUserPreferences } from '@/utils/preferenceFilter';

const PreferenceStatusBanner = () => {
  const { userPreferences, hasPreferences } = useUser();
  const { offers, allOffers } = useData();

  const stats = getPreferenceStats(allOffers, offers, userPreferences);

  if (!hasPreferences) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-400 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Set Your Preferences</p>
              <p className="text-blue-600 text-sm">Get personalized offers by setting your preferences</p>
            </div>
          </div>
          <Link 
            to="/preferences/stores" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            Set Preferences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 mx-4 mt-4 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-emerald-400 mr-2" />
          <div>
            <p className="text-emerald-800 font-medium">
              Showing {stats.filteredOffers} of {stats.totalOffers} offers ({stats.filterPercentage}%)
            </p>
            <p className="text-emerald-600 text-sm">
              Based on your preferences: {stats.preferencesCount.stores} stores, {stats.preferencesCount.categories} categories, {stats.preferencesCount.banks} banks
            </p>
          </div>
        </div>
        <Link 
          to="/preferences/stores" 
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center"
        >
          <Settings className="w-4 h-4 mr-1" />
          Manage
        </Link>
      </div>
    </div>
  );
};

export default PreferenceStatusBanner;
