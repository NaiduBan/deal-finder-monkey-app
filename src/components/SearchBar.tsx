
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getPopularSearchTerms, SearchFilters } from '@/services/searchService';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search deals, stores, or categories..." 
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      const terms = await getPopularSearchTerms();
      setSuggestions(terms);
    };
    loadSuggestions();
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), filters);
      setShowSuggestions(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-20 py-3 text-sm rounded-full"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="e.g., Electronics, Fashion"
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Store</label>
                    <Input
                      placeholder="e.g., Amazon, Flipkart"
                      value={filters.store || ''}
                      onChange={(e) => handleFilterChange('store', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Min Price</label>
                      <Input
                        type="number"
                        placeholder="₹100"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Price</label>
                      <Input
                        type="number"
                        placeholder="₹5000"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Min Discount %</label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={filters.discountMin || ''}
                      onChange={(e) => handleFilterChange('discountMin', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    handleSearch();
                    setShowFilters(false);
                  }}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={() => handleSearch()}
            size="sm"
            className="rounded-full"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            {suggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
              >
                <Search className="inline w-3 h-3 mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
