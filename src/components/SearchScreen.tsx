
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchBar from './SearchBar';
import OfferCard from './OfferCard';
import { searchOffers, getPopularSearchTerms, SearchFilters } from '@/services/searchService';
import { Offer } from '@/types';
import { Link } from 'react-router-dom';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    fetchPopularTerms();
    loadRecentSearches();
  }, []);

  const fetchPopularTerms = async () => {
    try {
      const terms = await getPopularSearchTerms();
      setPopularTerms(terms);
    } catch (error) {
      console.error('Error fetching popular terms:', error);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (query: string = searchQuery, customFilters: SearchFilters = filters) => {
    if (!query.trim() && Object.keys(customFilters).length === 0) return;
    
    setLoading(true);
    try {
      const results = await searchOffers({
        keyword: query.trim() || undefined,
        ...customFilters
      });
      setSearchResults(results);
      
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
    } catch (error) {
      console.error('Error searching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleSearch(searchQuery, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchResults([]);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => handleSearch()}
                placeholder="Search deals, stores, or categories..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="mt-3 flex items-center space-x-2 flex-wrap">
              <span className="text-sm text-gray-600">Filters:</span>
              {Object.entries(filters).map(([key, value]) => (
                value && (
                  <div key={key} className="bg-monkeyGreen/10 text-monkeyGreen px-2 py-1 rounded-full text-xs flex items-center">
                    {key}: {String(value)}
                    <button
                      onClick={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                      className="ml-1 hover:bg-monkeyGreen/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t bg-gray-50 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="food">Food & Dining</option>
                  <option value="travel">Travel</option>
                  <option value="beauty">Beauty</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

              {/* Store Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Store</label>
                <Input
                  value={filters.store || ''}
                  onChange={(e) => handleFilterChange('store', e.target.value || undefined)}
                  placeholder="Enter store name"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Discount Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Min Discount %</label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={filters.discountMin || ''}
                  onChange={(e) => handleFilterChange('discountMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-24"
                />
              </div>

              {/* Featured Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.featured || false}
                  onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                />
                <label htmlFor="featured" className="text-sm">Featured deals only</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {searchResults.length === 0 && !loading && (
          <div className="space-y-6">
            {/* Popular Searches */}
            {popularTerms.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-monkeyGreen" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTerms.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                      className="px-3 py-2 bg-white rounded-lg border hover:border-monkeyGreen hover:text-monkeyGreen transition-colors text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-monkeyGreen" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                      className="px-3 py-2 bg-white rounded-lg border hover:border-monkeyGreen hover:text-monkeyGreen transition-colors text-sm flex items-center"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Tips */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Search Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Try searching for specific brands or stores</li>
                <li>• Use category filters to narrow down results</li>
                <li>• Set price ranges to find deals in your budget</li>
                <li>• Enable "Featured deals only" for the best offers</li>
              </ul>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching for deals...</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">
              Found {searchResults.length} deal{searchResults.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((offer) => (
                <Link key={offer.id} to={`/offer/${offer.id}`}>
                  <OfferCard offer={offer} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && !loading && (searchQuery || Object.keys(filters).length > 0) && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No deals found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
