
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Category } from '@/types';

interface SearchAndFiltersProps {
  searchQuery: string;
  debouncedSearchTerm: string;
  selectedCategory: string | null;
  dynamicCategories: Category[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCategory: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

const SearchAndFilters = ({
  searchQuery,
  debouncedSearchTerm,
  selectedCategory,
  dynamicCategories,
  onSearchChange,
  onClearCategory,
  onClearSearch,
  onClearAll
}: SearchAndFiltersProps) => {
  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="search"
          placeholder="Search for offers, stores, categories..."
          className="pl-10 pr-4 py-2 w-full border-gray-200"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* Active filters */}
      {(selectedCategory || debouncedSearchTerm) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategory && (
            <div className="bg-spring-green-50 text-spring-green-700 px-3 py-1 rounded-full text-sm flex items-center">
              {dynamicCategories.find(c => c.id === selectedCategory)?.name}
              <button 
                onClick={onClearCategory}
                className="ml-1 text-spring-green-700"
              >
                ✕
              </button>
            </div>
          )}
          {debouncedSearchTerm && (
            <div className="bg-spring-green-50 text-spring-green-700 px-3 py-1 rounded-full text-sm flex items-center">
              "{debouncedSearchTerm}"
              <button 
                onClick={onClearSearch}
                className="ml-1 text-spring-green-700"
              >
                ✕
              </button>
            </div>
          )}
          {(selectedCategory || debouncedSearchTerm) && (
            <button 
              onClick={onClearAll}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default SearchAndFilters;
