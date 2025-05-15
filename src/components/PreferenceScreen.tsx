
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API
const mockBrands = [
  { id: 'b1', name: 'Nike', logo: '🏷️' },
  { id: 'b2', name: 'Adidas', logo: '🏷️' },
  { id: 'b3', name: 'Apple', logo: '🏷️' },
  { id: 'b4', name: 'Samsung', logo: '🏷️' },
  { id: 'b5', name: 'Amazon', logo: '🏷️' },
  { id: 'b6', name: 'Sony', logo: '🏷️' },
  { id: 'b7', name: 'Microsoft', logo: '🏷️' },
  { id: 'b8', name: 'H&M', logo: '🏷️' },
  { id: 'b9', name: 'Zara', logo: '🏷️' },
  { id: 'b10', name: 'IKEA', logo: '🏷️' },
];

const mockStores = [
  { id: 's1', name: 'Walmart', logo: '🏬' },
  { id: 's2', name: 'Target', logo: '🏬' },
  { id: 's3', name: 'Best Buy', logo: '🏬' },
  { id: 's4', name: 'Walgreens', logo: '🏬' },
  { id: 's5', name: 'CVS', logo: '🏬' },
  { id: 's6', name: 'Costco', logo: '🏬' },
  { id: 's7', name: 'Kroger', logo: '🏬' },
  { id: 's8', name: 'Whole Foods', logo: '🏬' },
  { id: 's9', name: 'Home Depot', logo: '🏬' },
  { id: 's10', name: 'Lowe\'s', logo: '🏬' },
];

const mockBanks = [
  { id: 'bk1', name: 'Bank of America', logo: '🏦' },
  { id: 'bk2', name: 'Chase', logo: '🏦' },
  { id: 'bk3', name: 'Wells Fargo', logo: '🏦' },
  { id: 'bk4', name: 'Citibank', logo: '🏦' },
  { id: 'bk5', name: 'Capital One', logo: '🏦' },
  { id: 'bk6', name: 'American Express', logo: '🏦' },
  { id: 'bk7', name: 'Discover', logo: '🏦' },
  { id: 'bk8', name: 'TD Bank', logo: '🏦' },
  { id: 'bk9', name: 'US Bank', logo: '🏦' },
  { id: 'bk10', name: 'PNC Bank', logo: '🏦' },
];

const PreferenceScreen = () => {
  const { preferenceType } = useParams<{ preferenceType: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set default selected items based on preference type
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    switch (preferenceType) {
      case 'brands':
        return ['b1', 'b3', 'b5'];
      case 'stores':
        return ['s2', 's4', 's8'];
      case 'banks':
        return ['bk2', 'bk5', 'bk6'];
      default:
        return [];
    }
  });
  
  // Determine which data to use based on preference type
  const getDataAndTitle = () => {
    switch (preferenceType) {
      case 'brands':
        return { data: mockBrands, title: 'Favorite Brands' };
      case 'stores':
        return { data: mockStores, title: 'Preferred Stores' };
      case 'banks':
        return { data: mockBanks, title: 'Bank Offers' };
      default:
        return { data: [], title: 'Preferences' };
    }
  };
  
  const { data, title } = getDataAndTitle();
  
  // Filter data based on search query
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const savePreferences = () => {
    toast({
      title: "Preferences saved",
      description: `Your ${title.toLowerCase()} have been updated`,
    });
    // In a real app, this would send data to the backend
  };
  
  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
        <button 
          onClick={savePreferences} 
          className="text-sm bg-monkeyYellow text-black px-3 py-1 rounded-full font-medium"
        >
          Save
        </button>
      </div>
      
      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-10 pr-4 py-2 w-full border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* List of items */}
      <div className="px-4 space-y-2">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{item.logo}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <Checkbox 
                checked={selectedItems.includes(item.id)} 
                onCheckedChange={() => toggleSelection(item.id)}
                className="border-monkeyGreen text-monkeyGreen"
              />
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No results found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceScreen;
