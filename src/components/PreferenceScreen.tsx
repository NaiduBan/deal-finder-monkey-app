
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ShoppingBag, Store, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBrands, mockStores, mockBanks } from '@/mockData';

const PreferenceScreen = () => {
  const { preferenceType = 'brands' } = useParams<{ preferenceType?: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const getDataAndTitle = (type: string) => {
    switch (type) {
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
  
  const handleTabChange = (value: string) => {
    navigate(`/preferences/${value}`);
  };
  
  const { title } = getDataAndTitle(preferenceType);
  
  // Filter data based on search query
  const filteredData = getDataAndTitle(preferenceType).data.filter(item => 
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
        <h1 className="text-xl font-semibold">Preferences</h1>
        <button 
          onClick={savePreferences} 
          className="text-sm bg-monkeyYellow text-black px-3 py-1 rounded-full font-medium"
        >
          Save
        </button>
      </div>
      
      {/* Preference Tabs */}
      <div className="p-2 bg-white">
        <Tabs
          defaultValue={preferenceType}
          value={preferenceType}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Brands</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>Stores</span>
            </TabsTrigger>
            <TabsTrigger value="banks" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Banks</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {/* Search bar */}
            <div className="px-2 py-2">
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
          
            {/* Selected items as bubbles */}
            <div className="px-4 py-3">
              <h3 className="text-sm text-gray-600 mb-2">Selected {title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItems.length > 0 ? (
                  filteredData
                    .filter(item => selectedItems.includes(item.id))
                    .map(item => (
                      <Badge 
                        key={item.id}
                        variant="outline" 
                        className="bg-monkeyGreen/10 text-monkeyGreen border-monkeyGreen/30 px-3 py-1"
                        onClick={() => toggleSelection(item.id)}
                      >
                        {item.logo} {item.name}
                      </Badge>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">No {title.toLowerCase()} selected</p>
                )}
              </div>
            </div>
            
            {/* List of available items */}
            <div className="px-4 space-y-2 mt-2">
              <h3 className="text-sm text-gray-600 mb-2">Available {title}</h3>
              
              {filteredData.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredData
                    .filter(item => !selectedItems.includes(item.id))
                    .map((item) => (
                      <Badge 
                        key={item.id}
                        variant="outline" 
                        className="bg-white hover:bg-gray-100 text-gray-800 cursor-pointer px-3 py-1"
                        onClick={() => toggleSelection(item.id)}
                      >
                        {item.logo} {item.name}
                      </Badge>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No results found. Try a different search term.
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PreferenceScreen;
