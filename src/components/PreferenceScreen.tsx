
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ShoppingBag, Store, CreditCard, Loader2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useUser } from '@/contexts/UserContext';
import { 
  fetchStoresFromOffers, 
  fetchCategoriesFromOffers, 
  fetchBanksFromOffers,
  getUserPreferences,
  saveUserPreferences
} from '@/services/supabaseService';

// Define the preference types
type PreferenceType = 'brands' | 'stores' | 'banks';
type PreferenceItem = {
  id: string;
  name: string;
  emoji: string;
};

const PreferenceScreen = () => {
  const { preferenceType = 'brands' } = useParams<{ preferenceType?: PreferenceType }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<PreferenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch preference items based on current type
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let items: string[] = [];
        let emoji = '🏷️';
        
        // Fetch items from today's offers
        switch (preferenceType) {
          case 'brands':
            items = await fetchCategoriesFromOffers();
            emoji = '🏷️';
            break;
          case 'stores':
            items = await fetchStoresFromOffers();
            emoji = '🏬';
            break;
          case 'banks':
            items = await fetchBanksFromOffers();
            emoji = '🏦';
            break;
        }
        
        // Convert to PreferenceItem format
        const formattedItems = items.map((name, index) => ({
          id: name,
          name,
          emoji
        }));
        
        setAvailableItems(formattedItems);
        
        // Fetch user's saved preferences
        if (user?.id) {
          const userPrefs = await getUserPreferences(user.id, preferenceType);
          setSelectedItems(userPrefs);
        }
      } catch (error) {
        console.error(`Error loading ${preferenceType}:`, error);
        toast({
          title: "Failed to load preferences",
          description: "Could not load preference items. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, [preferenceType, user?.id]);
  
  const handleTabChange = (value: string) => {
    navigate(`/preferences/${value}`);
  };
  
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const savePreferences = async () => {
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your preferences.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const success = await saveUserPreferences(
        user.id, 
        preferenceType, 
        selectedItems
      );
      
      if (success) {
        toast({
          title: "Preferences saved",
          description: `Your ${preferenceType} preferences have been updated.`,
        });
        navigate('/profile');
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "There was a problem saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Filter items based on search query
  const filteredItems = searchQuery.trim() 
    ? availableItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableItems;
    
  // Split into selected and unselected items
  const selectedItemObjects = filteredItems.filter(item => 
    selectedItems.includes(item.id));
    
  const unselectedItemObjects = filteredItems.filter(item => 
    !selectedItems.includes(item.id));
  
  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">My Preferences</h1>
        <Button 
          onClick={savePreferences} 
          disabled={isLoading || isSaving}
          size="sm"
          className="bg-monkeyYellow text-black hover:bg-monkeyYellow/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Saving
            </>
          ) : (
            'Save'
          )}
        </Button>
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
                  placeholder={`Search ${preferenceType}...`}
                  className="pl-10 pr-4 py-2 w-full border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-monkeyGreen animate-spin" />
              </div>
            ) : (
              <>
                {/* Selected items as bubbles */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Your Selected {preferenceType}</h3>
                    <span className="text-xs text-gray-500">
                      {selectedItems.length} selected
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-20">
                    {selectedItemObjects.length > 0 ? (
                      selectedItemObjects.map((item) => (
                        <Badge 
                          key={`selected-${item.id}`}
                          variant="outline" 
                          className="bg-monkeyGreen/10 text-monkeyGreen border-monkeyGreen/30 px-3 py-1 flex items-center gap-1"
                        >
                          <span>{item.emoji}</span> 
                          <span>{item.name}</span>
                          <button onClick={() => toggleSelection(item.id)} className="ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 w-full text-center py-4">
                        No {preferenceType} selected. Select from available {preferenceType} below.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Available items */}
                <div className="px-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Available {preferenceType}</h3>
                    <span className="text-xs text-gray-500">
                      {unselectedItemObjects.length} available
                    </span>
                  </div>
                  
                  {unselectedItemObjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {unselectedItemObjects.map((item) => (
                        <Badge 
                          key={`available-${item.id}`}
                          variant="outline" 
                          className="bg-white hover:bg-gray-100 text-gray-800 cursor-pointer px-3 py-1 flex items-center gap-1"
                          onClick={() => toggleSelection(item.id)}
                        >
                          <span>{item.emoji}</span> 
                          <span>{item.name}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center py-6 text-gray-500">
                      No results found for "{searchQuery}". Try a different search term.
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      All {preferenceType} have been selected.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PreferenceScreen;
