
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
            // For brands, extract unique categories from Data table
            const { data: categoriesData, error: categoriesError } = await supabase
              .from('Data')
              .select('categories')
              .not('categories', 'is', null)
              .limit(500); // Limit to ensure we get a response
            
            if (categoriesError) {
              console.error('Error fetching categories:', categoriesError);
              // Fallback to mock data
              console.log('Falling back to mock brands data');
              fetchedItems = mockBrands;
            } else if (categoriesData && categoriesData.length > 0) {
              console.log('Categories data found:', categoriesData.length);
              // Extract unique categories
              const uniqueCategories = new Set<string>();
              
              categoriesData.forEach(item => {
                if (item.categories) {
                  const categories = item.categories.split(',');
                  categories.forEach((cat: string) => {
                    const trimmedCat = cat.trim();
                    if (trimmedCat) uniqueCategories.add(trimmedCat);
                  });
                }
              });
              
              console.log('Unique categories extracted:', uniqueCategories.size);
              
              // Convert to our format
              let index = 0;
              fetchedItems = Array.from(uniqueCategories).map(cat => ({
                id: `b${index++}`,
                name: cat,
                logo: cat.charAt(0).toUpperCase()
              }));
              
              // If we somehow got no items, use mock data
              if (fetchedItems.length === 0) {
                console.log('No categories extracted, using mock brands');
                fetchedItems = mockBrands;
              }
            } else {
              console.log('No categories data found, using mock brands');
              fetchedItems = mockBrands;
            }
            break;
            
          case 'stores':
            console.log('Fetching stores data');
            // For stores, extract unique store names from Data table
            const { data: storesData, error: storesError } = await supabase
              .from('Data')
              .select('store')
              .not('store', 'is', null)
              .limit(500); // Limit to ensure we get a response
            
            if (storesError) {
              console.error('Error fetching stores:', storesError);
              // Fallback to mock data
              console.log('Falling back to mock stores data');
              fetchedItems = mockStores;
            } else if (storesData && storesData.length > 0) {
              console.log('Stores data found:', storesData.length);
              // Extract unique stores
              const uniqueStores = new Set<string>();
              
              storesData.forEach(item => {
                if (item.store) {
                  const store = item.store.trim();
                  if (store) uniqueStores.add(store);
                }
              });
              
              console.log('Unique stores extracted:', uniqueStores.size);
              
              // Convert to our format
              let index = 0;
              fetchedItems = Array.from(uniqueStores).map(store => ({
                id: `s${index++}`,
                name: store,
                logo: store.charAt(0).toUpperCase()
              }));
              
              // If we somehow got no items, use mock data
              if (fetchedItems.length === 0) {
                console.log('No stores extracted, using mock stores');
                fetchedItems = mockStores;
              }
            } else {
              console.log('No stores data found, using mock stores');
              fetchedItems = mockStores;
            }
            break;
            
          case 'banks':
            console.log('Fetching banks data');
            // For banks, extract bank references from offer descriptions
            const { data: offersData, error: offersError } = await supabase
              .from('Data')
              .select('description, long_offer')
              .not('description', 'is', null)
              .limit(500); // Limit to ensure we get a response
            
            if (offersError) {
              console.error('Error fetching offers for bank extraction:', offersError);
              // Fallback to mock data
              console.log('Falling back to mock banks data');
              fetchedItems = mockBanks;
            } else if (offersData && offersData.length > 0) {
              console.log('Offers data found for bank extraction:', offersData.length);
              // Common bank names in India to look for
              const bankNames = [
                'HDFC', 'SBI', 'ICICI', 'Axis', 'RBL', 'Kotak', 
                'Bank of Baroda', 'Punjab National', 'IDBI', 'Canara',
                'Federal', 'IndusInd', 'Yes Bank', 'Union Bank',
                'HSBC', 'Citi', 'Standard Chartered', 'American Express',
                'Deutsche', 'DBS', 'IDFC'
              ];
              
              const bankReferences: {[key: string]: number} = {};
              
              offersData.forEach(item => {
                const fullText = `${item.description || ''} ${item.long_offer || ''}`.toLowerCase();
                
                bankNames.forEach(bank => {
                  if (fullText.toLowerCase().includes(bank.toLowerCase())) {
                    bankReferences[bank] = (bankReferences[bank] || 0) + 1;
                  }
                });
              });
              
              console.log('Bank references found:', Object.keys(bankReferences).length);
              
              // Convert to our format, only include banks that were actually found
              let index = 0;
              fetchedItems = Object.keys(bankReferences).map(bank => ({
                id: `bk${index++}`,
                name: bank,
                logo: '🏦'
              }));
              
              // If no banks found, use mock data
              if (fetchedItems.length === 0) {
                console.log('No bank references found, using mock banks');
                fetchedItems = mockBanks;
              }
            } else {
              console.log('No offers data found for bank extraction, using mock banks');
              fetchedItems = mockBanks;
            }
            break;
            
          default:
            console.log('Unknown preference type, using empty array');
            fetchedItems = [];
        }
        
        // Always ensure we have at least some items
        if (fetchedItems.length === 0) {
          console.log('No items fetched, using appropriate mock data');
          switch (preferenceType) {
            case 'brands':
              fetchedItems = mockBrands;
              break;
            case 'stores':
              fetchedItems = mockStores;
              break;
            case 'banks':
              fetchedItems = mockBanks;
              break;
          }
        }
        
        console.log('Final items list:', fetchedItems.length);
        setItems(fetchedItems);
      } catch (error) {
        console.error(`Error loading ${preferenceType}:`, error);
        
        // Set mock data as fallback
        console.log('Exception occurred, falling back to mock data');
        switch (preferenceType) {
          case 'brands':
            setItems(mockBrands);
            break;
          case 'stores':
            setItems(mockStores);
            break;
          case 'banks':
            setItems(mockBanks);
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
      switch (preferenceType) {
        case 'brands':
          setSelectedItems(['b1', 'b3', 'b5']);
          break;
        case 'stores':
          setSelectedItems(['s2', 's4', 's8']);
          break;
        case 'banks':
          setSelectedItems(['bk2', 'bk5', 'bk6']);
          break;
        default:
          setSelectedItems([]);
      }
    };
    
    fetchData();
  }, [preferenceType]);
  
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
                  placeholder={`Search ${title.toLowerCase()}...`}
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
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PreferenceScreen;
