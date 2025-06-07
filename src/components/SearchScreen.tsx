
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, TrendingUp, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import SearchBar from './SearchBar';
import OfferCard from './OfferCard';
import { searchOffers, SearchFilters } from '@/services/searchService';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const SearchScreen = () => {
  const { offers } = useData();
  const isMobile = useIsMobile();
  const [searchResults, setSearchResults] = useState(offers);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches] = useState(['electronics', 'amazon deals', 'fashion']);
  const [popularSearches] = useState(['smartphones', 'laptops', 'clothing', 'books']);

  useEffect(() => {
    setSearchResults(offers);
  }, [offers]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchOffers({ ...filters, keyword: query });
      setSearchResults(results);
      
      // Save to recent searches (in a real app, this would be stored)
      console.log('Search performed:', query);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (newFilters.keyword) {
      handleSearch(newFilters.keyword);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchResults(offers);
  };

  const categories = [
    'Electronics', 'Fashion', 'Food', 'Travel', 'Beauty', 
    'Home', 'Sports', 'Books', 'Automotive', 'Health'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/home" className="text-gray-600">
              <X className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search deals, stores, categories..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {isMobile ? '' : 'Filters'}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Store</label>
                  <input
                    type="text"
                    value={filters.store || ''}
                    onChange={(e) => handleFilterChange({ ...filters, store: e.target.value })}
                    placeholder="Enter store name"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Min Discount (%)</label>
                  <input
                    type="number"
                    value={filters.discountMin || ''}
                    onChange={(e) => handleFilterChange({ ...filters, discountMin: Number(e.target.value) })}
                    placeholder="Min discount"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.featured || false}
                    onChange={(e) => handleFilterChange({ ...filters, featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured Only</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Suggestions */}
        {searchResults.length === offers.length && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 bg-white rounded-full text-sm border hover:bg-gray-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Tips */}
        {searchResults.length === offers.length && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Search Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use specific keywords like "smartphone", "laptop", "shoes"</li>
              <li>• Try store names like "Amazon", "Flipkart", "Myntra"</li>
              <li>• Filter by category or discount percentage</li>
              <li>• Look for featured deals for the best offers</li>
            </ul>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for deals...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {searchResults.length === offers.length 
                  ? 'All Deals' 
                  : `${searchResults.length} deals found`}
              </h2>
            </div>
            
            {searchResults.length > 0 ? (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {searchResults.map((offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
