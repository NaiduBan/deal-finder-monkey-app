
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, ShoppingBag, Store, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBrands, mockStores, mockBanks } from '@/mockData';
import { supabase } from "@/integrations/supabase/client";

const PreferenceScreen = () => {
  const { preferenceType = 'brands' } = useParams<{ preferenceType?: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Array<{id: string, name: string, logo?: string}>>([]);
  
  // Log preferenceType to debug
  console.log('Current preference type:', preferenceType);
  
  // Fetch data from Supabase based on preference type
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log('Fetching data for preference type:', preferenceType);
      
      try {
        let fetchedItems: Array<{id: string, name: string, logo?: string}> = [];
        
        switch (preferenceType) {
          case 'brands':
            console.log('Fetching brands/categories data');
            try {
              // For brands, extract unique categories from Data table
              const { data: categoriesData, error: categoriesError } = await supabase
                .from('Data')
                .select('categories')
                .not('categories', 'is', null)
                .limit(1000); // Increased limit for more comprehensive data
              
              if (categoriesError) {
                console.error('Error fetching categories:', categoriesError);
                throw categoriesError;
              } else if (categoriesData && categoriesData.length > 0) {
                console.log('Categories data found:', categoriesData.length);
                // Extract unique categories
                const uniqueCategories = new Map<string, boolean>();
                
                categoriesData.forEach(item => {
                  if (item.categories) {
                    const categories = item.categories.split(',');
                    categories.forEach((cat: string) => {
                      const trimmedCat = cat.trim();
                      if (trimmedCat) uniqueCategories.set(trimmedCat.toLowerCase(), true);
                    });
                  }
                });
                
                console.log('Unique categories extracted:', uniqueCategories.size);
                
                // Convert to our format and ensure unique IDs
                fetchedItems = Array.from(uniqueCategories.keys()).map((cat, index) => ({
                  id: `brand-${index}`, // Use index-based IDs to ensure uniqueness
                  name: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize first letter
                  logo: '🏷️'
                }));
                
                console.log('Fetched categories:', fetchedItems.length);
              } else {
                console.log('No categories data found, using mock brands');
                fetchedItems = mockBrands.map((brand, index) => ({
                  ...brand,
                  id: `brand-${index}` // Ensure unique IDs
                }));
              }
            } catch (err) {
              console.error('Error processing categories:', err);
              console.log('Using mock brands due to error');
              fetchedItems = mockBrands.map((brand, index) => ({
                ...brand,
                id: `brand-${index}` // Ensure unique IDs
              }));
            }
            break;
            
          case 'stores':
            console.log('Fetching stores data');
            try {
              // For stores, extract unique store names from Data table
              const { data: storesData, error: storesError } = await supabase
                .from('Data')
                .select('store')
                .not('store', 'is', null)
                .limit(1000); // Increased limit
              
              if (storesError) {
                console.error('Error fetching stores:', storesError);
                throw storesError;
              } else if (storesData && storesData.length > 0) {
                console.log('Stores data found:', storesData.length);
                // Extract unique stores
                const uniqueStores = new Map<string, boolean>();
                
                storesData.forEach(item => {
                  if (item.store) {
                    const store = item.store.trim();
                    if (store) uniqueStores.set(store.toLowerCase(), true);
                  }
                });
                
                console.log('Unique stores extracted:', uniqueStores.size);
                
                // Convert to our format with unique IDs
                fetchedItems = Array.from(uniqueStores.keys()).map((store, index) => ({
                  id: `store-${index}`, // Use index-based IDs to ensure uniqueness
                  name: store.charAt(0).toUpperCase() + store.slice(1), // Capitalize first letter
                  logo: '🏬'
                }));
                
                console.log('Fetched stores:', fetchedItems.length);
              } else {
                console.log('No stores data found, using mock stores');
                fetchedItems = mockStores.map((store, index) => ({
                  ...store,
                  id: `store-${index}` // Ensure unique IDs
                }));
              }
            } catch (err) {
              console.error('Error processing stores:', err);
              console.log('Using mock stores due to error');
              fetchedItems = mockStores.map((store, index) => ({
                ...store,
                id: `store-${index}` // Ensure unique IDs
              }));
            }
            break;
            
          case 'banks':
            console.log('Fetching banks data');
            try {
              // For banks, extract bank references from offer descriptions
              const { data: offersData, error: offersError } = await supabase
                .from('Data')
                .select('description, long_offer, title, terms_and_conditions')
                .limit(1000); // Increased limit
              
              if (offersError) {
                console.error('Error fetching offers for bank extraction:', offersError);
                throw offersError;
              } else if (offersData && offersData.length > 0) {
                console.log('Offers data found for bank extraction:', offersData.length);
                // Common bank names in India to look for
                const bankNames = [
                  'HDFC', 'SBI', 'ICICI', 'Axis', 'RBL', 'Kotak', 
                  'Bank of Baroda', 'Punjab National', 'IDBI', 'Canara',
                  'Federal', 'IndusInd', 'Yes Bank', 'Union Bank',
                  'HSBC', 'Citi', 'Standard Chartered', 'American Express',
                  'Deutsche', 'DBS', 'IDFC', 'AU Small Finance', 'Bank of India',
                  'Indian Bank', 'UCO Bank', 'South Indian Bank', 'Karnataka Bank',
                  'Bandhan Bank', 'J&K Bank', 'Bank of Maharashtra'
                ];
                
                const bankReferences: {[key: string]: number} = {};
                
                offersData.forEach(item => {
                  const fullText = `${item.title || ''} ${item.description || ''} ${item.long_offer || ''} ${item.terms_and_conditions || ''}`.toLowerCase();
                  
                  bankNames.forEach(bank => {
                    if (fullText.toLowerCase().includes(bank.toLowerCase())) {
                      bankReferences[bank] = (bankReferences[bank] || 0) + 1;
                    }
                  });
                });
                
                console.log('Bank references found:', Object.keys(bankReferences).length);
                
                // Convert to our format, only include banks that were actually found
                fetchedItems = Object.keys(bankReferences)
                  .sort((a, b) => bankReferences[b] - bankReferences[a]) // Sort by frequency
                  .map((bank, index) => ({
                    id: `bank-${index}`, // Use index-based IDs to ensure uniqueness
                    name: bank,
                    logo: '🏦'
                  }));
                
                console.log('Fetched banks:', fetchedItems.length);
                
                if (fetchedItems.length === 0) {
                  console.log('No bank references found, using mock banks');
                  fetchedItems = mockBanks.map((bank, index) => ({
                    ...bank,
                    id: `bank-${index}` // Ensure unique IDs
                  }));
                }
              } else {
                console.log('No offers data found for bank extraction, using mock banks');
                fetchedItems = mockBanks.map((bank, index) => ({
                  ...bank,
                  id: `bank-${index}` // Ensure unique IDs
                }));
              }
            } catch (err) {
              console.error('Error processing banks:', err);
              console.log('Using mock banks due to error');
              fetchedItems = mockBanks.map((bank, index) => ({
                ...bank,
                id: `bank-${index}` // Ensure unique IDs
              }));
            }
            break;
            
          default:
            console.log('Unknown preference type, using empty array');
            fetchedItems = [];
        }
        
        // Always ensure we have at least some items
        if (!fetchedItems || fetchedItems.length === 0) {
          console.log('No items fetched, using appropriate mock data');
          switch (preferenceType) {
            case 'brands':
              fetchedItems = mockBrands.map((brand, index) => ({
                ...brand,
                id: `brand-${index}` // Ensure unique IDs
              }));
              break;
            case 'stores':
              fetchedItems = mockStores.map((store, index) => ({
                ...store,
                id: `store-${index}` // Ensure unique IDs
              }));
              break;
            case 'banks':
              fetchedItems = mockBanks.map((bank, index) => ({
                ...bank,
                id: `bank-${index}` // Ensure unique IDs
              }));
              break;
          }
        }
        
        console.log('Final items list length:', fetchedItems.length);
        console.log('Sample items:', fetchedItems.slice(0, 3));
        setItems(fetchedItems);
      } catch (error) {
        console.error(`Error loading ${preferenceType}:`, error);
        
        // Set mock data as fallback
        console.log('Exception occurred, falling back to mock data');
        switch (preferenceType) {
          case 'brands':
            setItems(mockBrands.map((brand, index) => ({
              ...brand,
              id: `brand-${index}` // Ensure unique IDs
            })));
            break;
          case 'stores':
            setItems(mockStores.map((store, index) => ({
              ...store,
              id: `store-${index}` // Ensure unique IDs
            })));
            break;
          case 'banks':
            setItems(mockBanks.map((bank, index) => ({
              ...bank,
              id: `bank-${index}` // Ensure unique IDs
            })));
            break;
          default:
            setItems([]);
        }
      }
      
      // Now fetch user preferences from Supabase
      fetchUserPreferences();
    };
    
    const fetchUserPreferences = async () => {
      try {
        console.log('Fetching user preferences');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('User is authenticated, fetching preferences from Supabase');
          // If authenticated, fetch preferences from Supabase
          const { data, error } = await supabase
            .from('user_preferences')
            .select('preference_id')
            .eq('user_id', session.user.id)
            .eq('preference_type', preferenceType);
            
          if (error) {
            console.error('Error fetching preferences:', error);
            setDefaultSelections();
          } else if (data && data.length > 0) {
            console.log('User preferences found:', data.length);
            // Set the selected items based on fetched preferences
            setSelectedItems(data.map(pref => pref.preference_id));
          } else {
            console.log('No user preferences found in database');
            // Set default selections
            setDefaultSelections();
          }
        } else {
          console.log('User not authenticated, using default selections');
          // If not authenticated, use default selections
          setDefaultSelections();
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setDefaultSelections();
      } finally {
        setIsLoading(false);
      }
    };
    
    const setDefaultSelections = () => {
      console.log('Setting default selections for', preferenceType);
      // Use a few items from the mock data as default selections
      // We'll select these properly once items are loaded
      setSelectedItems([]);
    };
    
    fetchData();
  }, [preferenceType]);

  // Set some default selections after items are loaded
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === 0) {
      console.log('Setting some default selections from loaded items');
      // Select 3-5 random items as default
      const numberOfDefaultSelections = Math.min(3, items.length);
      const randomSelections = [];
      
      for (let i = 0; i < numberOfDefaultSelections; i++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        randomSelections.push(items[randomIndex].id);
      }
      
      setSelectedItems(randomSelections);
    }
  }, [items]);
  
  // Determine which data to use based on preference type
  const getDataAndTitle = (type: string) => {
    switch (type) {
      case 'brands':
        return { data: items, title: 'Favorite Brands' };
      case 'stores':
        return { data: items, title: 'Preferred Stores' };
      case 'banks':
        return { data: items, title: 'Bank Offers' };
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
  
  const savePreferences = async () => {
    setIsLoading(true);
    
    try {
      // Use await to resolve the Promise before accessing session
      const sessionData = await supabase.auth.getSession();
      const session = sessionData.data.session;
      
      if (session) {
        console.log('Saving preferences for authenticated user');
        // First, delete existing preferences of this type for the user
        const { error: deleteError } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', preferenceType);
          
        if (deleteError) {
          console.error('Error deleting existing preferences:', deleteError);
          throw deleteError;
        }
        
        // Then insert the new preferences
        if (selectedItems.length > 0) {
          console.log(`Inserting ${selectedItems.length} new preferences`);
          const preferencesToInsert = selectedItems.map(preferenceId => ({
            user_id: session.user.id,
            preference_type: preferenceType,
            preference_id: preferenceId
          }));
          
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert(preferencesToInsert);
            
          if (insertError) {
            console.error('Error inserting preferences:', insertError);
            throw insertError;
          } else {
            console.log('Preferences saved successfully');
          }
        } else {
          console.log('No preferences to save (empty selection)');
        }
        
        toast({
          title: "Preferences saved",
          description: `Your ${title.toLowerCase()} have been updated`,
        });
        
        // Redirect to home to see updated offers
        navigate('/home');
      } else {
        console.log('User not authenticated, saving preferences locally');
        // User not authenticated, just show a success message
        toast({
          title: "Preferences saved locally",
          description: `Your ${title.toLowerCase()} have been updated locally`,
        });
        
        // Redirect to home
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Error in savePreferences:', error);
      toast({
        title: "Error saving preferences",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
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
                  placeholder={`Search ${getDataAndTitle(preferenceType).title.toLowerCase()}...`}
                  className="pl-10 pr-4 py-2 w-full border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen"></div>
              </div>
            ) : (
              <>
                {/* Data summary */}
                <div className="px-4 py-1 mb-2">
                  <p className="text-xs text-gray-500">
                    {items.length} {getDataAndTitle(preferenceType).title.toLowerCase()} available
                  </p>
                </div>
              
                {/* Selected items as bubbles */}
                <div className="px-4 py-3">
                  <h3 className="text-sm text-gray-600 mb-2">Selected {getDataAndTitle(preferenceType).title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItems.length > 0 ? (
                      items
                        .filter(item => selectedItems.includes(item.id))
                        .map(item => (
                          <Badge 
                            key={`selected-${item.id}`}
                            variant="outline" 
                            className="bg-monkeyGreen/10 text-monkeyGreen border-monkeyGreen/30 px-3 py-1"
                            onClick={() => toggleSelection(item.id)}
                          >
                            {item.logo} {item.name}
                          </Badge>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No {getDataAndTitle(preferenceType).title.toLowerCase()} selected</p>
                    )}
                  </div>
                </div>
                
                {/* List of available items */}
                <div className="px-4 space-y-2 mt-2">
                  <h3 className="text-sm text-gray-600 mb-2">Available {getDataAndTitle(preferenceType).title}</h3>
                  
                  {filteredData.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredData
                        .filter(item => !selectedItems.includes(item.id))
                        .map((item) => (
                          <Badge 
                            key={`available-${item.id}`}
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
                    searchQuery ? (
                      <div className="text-center py-6 text-gray-500">
                        No results found. Try a different search term.
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        All {getDataAndTitle(preferenceType).title.toLowerCase()} are selected.
                      </div>
                    )
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
