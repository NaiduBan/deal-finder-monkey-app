
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Crown, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onPriceRangeChange?: (range: [number, number]) => void;
  onDiscountFilterChange?: (discount: string) => void;
  onSortChange?: (sort: string) => void;
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
  onClearFilters,
  onPriceRangeChange,
  onDiscountFilterChange,
  onSortChange
}: SearchAndFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [discountFilter, setDiscountFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');

  const handlePriceRangeChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setPriceRange(range);
    onPriceRangeChange?.(range);
  };

  const handleDiscountChange = (value: string) => {
    setDiscountFilter(value);
    onDiscountFilterChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };
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

      {/* Enhanced Search Bar with Filters */}
      <div className="relative mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="🔍 Search for offers, stores, categories..."
              className="pl-12 pr-4 py-3 w-full border-border rounded-xl text-lg shadow-sm focus:shadow-md transition-shadow"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-xl border-border ${showAdvancedFilters ? 'bg-primary/10 border-primary' : ''}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 p-6 bg-card rounded-xl border border-border shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Price Range</label>
                <div className="px-3">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Minimum Discount</label>
                <Select value={discountFilter} onValueChange={handleDiscountChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any discount</SelectItem>
                    <SelectItem value="10">10% or more</SelectItem>
                    <SelectItem value="25">25% or more</SelectItem>
                    <SelectItem value="50">50% or more</SelectItem>
                    <SelectItem value="75">75% or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Sort by</label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort offers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Relevance</SelectItem>
                    <SelectItem value="discount">Highest Discount</SelectItem>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground mr-3">Quick filters:</span>
              {['Ending Today', 'Free Shipping', 'No Code Required', 'Verified'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
