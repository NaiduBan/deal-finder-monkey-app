
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CategoryItem from '@/components/CategoryItem';
import { Category } from '@/types';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUsingMockData: boolean;
  hasLoadedPreferences: boolean;
  userPreferences: {[key: string]: string[]};
  dynamicCategories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  isDataLoading: boolean;
  debouncedSearchTerm: string;
  onClearFilters: () => void;
}

const SearchAndFilters = ({
  searchQuery,
  onSearchChange,
  isUsingMockData,
  hasLoadedPreferences,
  userPreferences,
  dynamicCategories,
  selectedCategory,
  onCategorySelect,
  isDataLoading,
  debouncedSearchTerm,
  onClearFilters
}: SearchAndFiltersProps) => {
  const hasPersonalization = hasLoadedPreferences && (
    userPreferences.brands.length > 0 || 
    userPreferences.stores.length > 0 || 
    userPreferences.banks.length > 0
  );

  return (
    <>
      {/* Data source alert */}
      {isUsingMockData && (
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            No real offers found in the Offers_data table. Please check your database.
          </AlertDescription>
        </Alert>
      )}

      {/* Personalization banner */}
      {hasPersonalization && (
        <div className="bg-gradient-to-r from-spring-green-50 to-green-50 p-4 rounded-xl border border-spring-green-200 mb-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-spring-green-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-spring-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-spring-green-800 text-lg">✨ Personalized for You</h3>
                <p className="text-sm text-spring-green-600">Offers curated based on your preferences</p>
              </div>
            </div>
            <Link 
              to="/preferences/brands" 
              className="bg-spring-green-600 hover:bg-spring-green-700 text-white text-sm px-4 py-2 rounded-full transition-colors font-medium"
            >
              Customize
            </Link>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="search"
          placeholder="🔍 Search for offers, stores, categories..."
          className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-xl text-lg shadow-sm focus:shadow-md transition-shadow"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* Categories carousel */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-gray-900">🎯 Popular Categories</h2>
          <Link to="/preferences/brands" className="text-spring-green-600 text-sm font-medium hover:text-spring-green-700">
            Customize preferences →
          </Link>
        </div>
        
        {isDataLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spring-green-600"></div>
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {dynamicCategories.length > 0 ? (
              dynamicCategories.map((category) => (
                <div 
                  key={category.id} 
                  onClick={() => onCategorySelect(category.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCategory === category.id 
                      ? 'scale-110 ring-2 ring-spring-green-500 ring-offset-2' 
                      : 'hover:scale-105'
                  }`}
                >
                  <CategoryItem category={category} />
                  {selectedCategory === category.id && (
                    <div className="h-1 w-full bg-spring-green-600 rounded-full mt-2 animate-pulse"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 py-4 text-center w-full">No categories with sufficient offers available</div>
            )}
          </div>
        )}
      </div>

      {/* Active filters */}
      {(selectedCategory || debouncedSearchTerm) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategory && (
            <div className="bg-spring-green-100 text-spring-green-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
              🏷️ {dynamicCategories.find(c => c.id === selectedCategory)?.name}
              <button 
                onClick={() => onCategorySelect(selectedCategory)}
                className="ml-2 text-spring-green-700 hover:text-spring-green-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          {debouncedSearchTerm && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center font-medium">
              🔍 "{debouncedSearchTerm}"
              <button 
                onClick={onClearFilters}
                className="ml-2 text-blue-700 hover:text-blue-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          {(selectedCategory || debouncedSearchTerm) && (
            <button 
              onClick={onClearFilters}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default SearchAndFilters;
