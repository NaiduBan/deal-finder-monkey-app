
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { Filter, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getPreferenceStats } from '@/utils/preferenceFilter';

const PreferenceStatusBanner = () => {
  const { userPreferences, hasPreferences } = useUser();
  const { offers, allOffers } = useData();
  
  const stats = getPreferenceStats(allOffers, offers, userPreferences);

  if (!hasPreferences) {
    return (
      <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Set Your Preferences</h3>
              <p className="text-sm text-blue-700">Get personalized offers by setting your store and category preferences</p>
            </div>
          </div>
          <Link to="/preferences/stores">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Set Preferences
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Filter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 flex items-center">
              Personalized Offers
              <TrendingUp className="w-4 h-4 ml-2" />
            </h3>
            <p className="text-sm text-green-700">
              Showing {stats.filteredOffers} of {stats.totalOffers} offers based on your preferences
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-800">{stats.filterPercentage}%</div>
          <div className="text-xs text-green-600">Match Rate</div>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {stats.preferencesCount.stores > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {stats.preferencesCount.stores} Stores
          </span>
        )}
        {stats.preferencesCount.categories > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {stats.preferencesCount.categories} Categories
          </span>
        )}
        {stats.preferencesCount.banks > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {stats.preferencesCount.banks} Banks
          </span>
        )}
        <Link to="/preferences/stores">
          <Button variant="outline" size="sm" className="h-6 text-xs">
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PreferenceStatusBanner;
