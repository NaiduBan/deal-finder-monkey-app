import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search, Star, Store, Tag, X, Plus, Filter, SortAsc, SortDesc, TrendingUp, Users, BarChart3, RefreshCw, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';

type SortOption = 'name' | 'count' | 'popular';
type SortDirection = 'asc' | 'desc';

const PreferenceScreen = () => {
  const { type } = useParams<{ type: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<{ id: string; name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSelected, setShowSelected] = useState<'all' | 'selected' | 'unselected'>('all');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Configuration based on preference type
  const getConfig = () => {
    switch (type) {
      case 'stores':
        return {
          title: 'Favorite Stores',
          subtitle: 'Choose your go-to shopping destinations',
          gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
          placeholder: 'Search stores...',
          emptyMessage: 'No stores found',
          icon: Store,
          description: 'Select stores where you love to shop for personalized offers',
          emoji: '🏪'
        };
      case 'brands':
        return {
          title: 'Preferred Brands', 
          subtitle: 'Select brands you trust and love',
          gradient: 'from-purple-500 via-pink-500 to-rose-500',
          placeholder: 'Search brands...',
          emptyMessage: 'No brands found',
          icon: Star,
          description: 'Choose your favorite brands to see relevant offers',
          emoji: '⭐'
        };
      case 'categories':
        return {
          title: 'Interest Categories',
          subtitle: 'Pick what you love to explore',
          gradient: 'from-blue-500 via-indigo-500 to-purple-500',
          placeholder: 'Search categories...',
          emptyMessage: 'No categories found',
          icon: Tag,
          description: 'Select categories that match your interests',
          emoji: '🏷️'
        };
      case 'banks':
        return {
          title: 'Banking Partners',
          subtitle: 'Your trusted financial institutions',
          gradient: 'from-orange-500 via-red-500 to-pink-500',
          placeholder: 'Search banks...',
          emptyMessage: 'No banks found',
          icon: CreditCard,
          description: 'Add your banks for exclusive credit card offers',
          emoji: '🏦'
        };
      default:
        return {
          title: 'Preferences',
          subtitle: 'Manage your preferences',
          gradient: 'from-gray-500 to-gray-600',
          placeholder: 'Search...',
          emptyMessage: 'No items found',
          icon: Tag,
          description: 'Customize your experience',
          emoji: '⚙️'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  // Fetch available items with counts from Offers_data table
  const fetchAvailableItems = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching ${type} data from Offers_data table...`);
      
      const { data: offers, error } = await supabase
        .from('Offers_data')
        .select('store, categories, terms_and_conditions, description, long_offer');
      
      if (error) throw error;

      const itemsMap = new Map<string, number>();
      
      if (type === 'stores') {
        offers?.forEach(offer => {
          if (offer.store) {
            const storeName = offer.store.trim();
            if (storeName) {
              itemsMap.set(storeName, (itemsMap.get(storeName) || 0) + 1);
            }
          }
        });
      } else if (type === 'brands' || type === 'categories') {
        offers?.forEach(offer => {
          if (offer.categories) {
            const categories = offer.categories.split(',');
            categories.forEach(cat => {
              const trimmed = cat.trim();
              if (trimmed) {
                itemsMap.set(trimmed, (itemsMap.get(trimmed) || 0) + 1);
              }
            });
          }
        });
      } else if (type === 'banks') {
        offers?.forEach(offer => {
          const fullText = `${offer.description || ''} ${offer.terms_and_conditions || ''} ${offer.long_offer || ''}`.toLowerCase();
          const bankKeywords = [
            'hdfc bank', 'icici bank', 'sbi', 'state bank of india', 'axis bank', 
            'kotak mahindra bank', 'paytm payments bank', 'citi bank', 'citibank',
            'american express', 'amex', 'standard chartered', 'yes bank', 
            'indusind bank', 'bank of baroda', 'bob', 'canara bank',
            'union bank', 'pnb', 'punjab national bank', 'bank of india', 
            'central bank', 'indian bank', 'rbl bank', 'federal bank'
          ];
          
          bankKeywords.forEach(bank => {
            if (fullText.includes(bank)) {
              const bankName = bank.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              itemsMap.set(bankName, (itemsMap.get(bankName) || 0) + 1);
            }
          });
        });
      }

      const items = Array.from(itemsMap.entries())
        .map(([name, count]) => ({ id: name, name, count }))
        .sort((a, b) => b.count - a.count);

      setAvailableItems(items);
      console.log(`Loaded ${items.length} ${type} items`);
    } catch (error) {
      console.error('Error fetching available items:', error);
      toast({
        title: "Error",
        description: "Failed to load available options",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAvailableItems();
  }, [type]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAvailableItems();
    setIsRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Latest preferences data has been loaded",
    });
  };

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!session?.user || !type) return;

      try {
        console.log('Loading preferences for user:', session.user.id, 'type:', type);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_id')
          .eq('user_id', session.user.id)
          .eq('preference_type', type);

        if (error) throw error;

        console.log('Loaded preferences:', data);
        setSelectedItems(data?.map(item => item.preference_id) || []);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadUserPreferences();
  }, [session, type]);

  useEffect(() => {
    if (!session?.user || !type) return;

    console.log('Setting up real-time subscription for user:', session.user.id, 'type:', type);

    const channel = supabase
      .channel(`user-preferences-${session.user.id}-${type}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${session.user.id},preference_type=eq.${type}`
        },
        (payload) => {
          console.log('Real-time preference change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPreferenceId = payload.new.preference_id;
            setSelectedItems(prev => {
              if (!prev.includes(newPreferenceId)) {
                console.log('Adding preference:', newPreferenceId);
                return [...prev, newPreferenceId];
              }
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedPreferenceId = payload.old.preference_id;
            setSelectedItems(prev => {
              const filtered = prev.filter(id => id !== deletedPreferenceId);
              console.log('Removing preference:', deletedPreferenceId);
              return filtered;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [session, type]);

  const sortedAndFilteredItems = useMemo(() => {
    let filtered = availableItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showSelected === 'selected') {
      filtered = filtered.filter(item => selectedItems.includes(item.id));
    } else if (showSelected === 'unselected') {
      filtered = filtered.filter(item => !selectedItems.includes(item.id));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'popular':
          comparison = a.count - b.count;
          break;
        default:
          comparison = a.count - b.count;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [availableItems, searchTerm, selectedItems, sortBy, sortDirection, showSelected]);

  const selectedFilteredItems = sortedAndFilteredItems.filter(item => selectedItems.includes(item.id));
  const unselectedFilteredItems = sortedAndFilteredItems.filter(item => !selectedItems.includes(item.id));

  const toggleItem = async (item: string) => {
    if (!session?.user || !type) return;

    if (bulkSelectMode) {
      setPendingSelection(prev => 
        prev.includes(item) 
          ? prev.filter(id => id !== item)
          : [...prev, item]
      );
      return;
    }

    try {
      const isSelected = selectedItems.includes(item);
      console.log('Toggling item:', item, 'currently selected:', isSelected);
      
      if (isSelected) {
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', type)
          .eq('preference_id', item);

        if (error) throw error;
        
        toast({
          title: "Preference removed",
          description: `${item} removed from your ${type}`,
        });
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preference_type: type,
            preference_id: item
          });

        if (error) throw error;
        
        toast({
          title: "Preference added",
          description: `${item} added to your ${type}`,
        });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive"
      });
    }
  };

  const applyBulkSelection = async () => {
    if (!session?.user || !type) return;

    try {
      const toRemove = selectedItems.filter(id => !pendingSelection.includes(id));
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', type)
          .in('preference_id', toRemove);

        if (deleteError) throw deleteError;
      }

      const toAdd = pendingSelection.filter(id => !selectedItems.includes(id));
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert(
            toAdd.map(id => ({
              user_id: session.user.id,
              preference_type: type,
              preference_id: id
            }))
          );

        if (insertError) throw insertError;
      }

      setBulkSelectMode(false);
      setPendingSelection([]);
      
      toast({
        title: "Bulk selection applied",
        description: `Updated ${toAdd.length + toRemove.length} preferences`,
      });
    } catch (error) {
      console.error('Error applying bulk selection:', error);
      toast({
        title: "Error",
        description: "Failed to apply bulk selection",
        variant: "destructive"
      });
    }
  };

  const clearAllPreferences = async () => {
    if (!session?.user || !type) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', session.user.id)
        .eq('preference_type', type);

      if (error) throw error;
      
      toast({
        title: "All preferences cleared",
        description: `All ${type} preferences have been removed`,
      });
    } catch (error) {
      console.error('Error clearing preferences:', error);
      toast({
        title: "Error",
        description: "Failed to clear preferences",
        variant: "destructive"
      });
    }
  };

  const toggleSort = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen ${isMobile ? 'pb-16' : ''}`}>
      {/* Modern Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-100 dark:border-gray-700">
        <div className={`px-4 py-6 ${!isMobile ? 'max-w-[1440px] mx-auto' : ''}`}>
          <div className="flex items-center space-x-3 mb-6">
            <Link to="/preferences" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="flex items-center space-x-3 flex-1">
              <div className={`p-3 bg-gradient-to-r ${config.gradient} rounded-xl`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{config.emoji}</span>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{config.title}</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{config.subtitle}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{config.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{selectedItems.length}</span>
              </div>
              <p className="text-xs text-green-600 text-center font-medium">Selected</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold text-blue-700">{availableItems.length}</span>
              </div>
              <p className="text-xs text-blue-600 text-center font-medium">Available</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-bold text-purple-700">{Math.round((selectedItems.length / Math.max(availableItems.length, 1)) * 100)}%</span>
              </div>
              <p className="text-xs text-purple-600 text-center font-medium">Coverage</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!bulkSelectMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkSelectMode(true)}
                  className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Bulk Select
                </Button>
                {selectedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllPreferences}
                    className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyBulkSelection}
                  className="bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Apply ({pendingSelection.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkSelectMode(false);
                    setPendingSelection([]);
                  }}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'max-w-[1440px] mx-auto px-6 py-8'}`}>
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder={config.placeholder}
              className="pl-12 pr-4 py-4 w-full border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters and Sort */}
          <div className={`flex gap-2 items-center justify-between ${isMobile ? 'flex-wrap' : ''}`}>
            <div className="flex gap-2">
              <Button
                variant={showSelected === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('all')}
                className="text-xs rounded-full"
              >
                All ({sortedAndFilteredItems.length})
              </Button>
              <Button
                variant={showSelected === 'selected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('selected')}
                className="text-xs rounded-full"
              >
                Selected ({selectedFilteredItems.length})
              </Button>
              <Button
                variant={showSelected === 'unselected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('unselected')}
                className="text-xs rounded-full"
              >
                Available ({unselectedFilteredItems.length})
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('name')}
                className="text-xs rounded-full"
              >
                Name {sortBy === 'name' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('count')}
                className="text-xs rounded-full"
              >
                Count {sortBy === 'count' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
              </Button>
            </div>
          </div>
        </div>

        {/* Items Display */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Selected items */}
              {showSelected === 'all' && selectedFilteredItems.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    Selected ({selectedFilteredItems.length})
                  </h2>
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {selectedFilteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={true}
                        isBulkMode={bulkSelectMode}
                        isPendingSelection={pendingSelection.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                        config={config}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Available items */}
              {((showSelected === 'all' && unselectedFilteredItems.length > 0) || 
                (showSelected === 'unselected' && unselectedFilteredItems.length > 0) ||
                (showSelected === 'selected' && selectedFilteredItems.length > 0)) && (
                <div>
                  {showSelected === 'all' && (
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-blue-600" />
                      Available ({unselectedFilteredItems.length})
                    </h2>
                  )}
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {(showSelected === 'selected' ? selectedFilteredItems : 
                      showSelected === 'unselected' ? unselectedFilteredItems : 
                      unselectedFilteredItems).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        isBulkMode={bulkSelectMode}
                        isPendingSelection={pendingSelection.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                        config={config}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && sortedAndFilteredItems.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <IconComponent className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {config.emptyMessage}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? `No ${type} found matching "${searchTerm}"` : `No ${type} available at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard: React.FC<{
  item: { id: string; name: string; count: number };
  isSelected: boolean;
  isBulkMode: boolean;
  isPendingSelection: boolean;
  onClick: () => void;
  config: any;
}> = ({ item, isSelected, isBulkMode, isPendingSelection, onClick, config }) => {
  const displaySelected = isBulkMode ? isPendingSelection : isSelected;
  
  return (
    <div
      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
        displaySelected 
          ? `bg-gradient-to-r ${config.gradient.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')} bg-opacity-10 border-blue-300 dark:border-blue-600 shadow-md` 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isBulkMode && (
            <Checkbox 
              checked={isPendingSelection}
              className="rounded w-5 h-5"
            />
          )}
          <div className={`p-3 rounded-xl ${
            displaySelected ? 'bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <config.icon className={`w-6 h-6 ${
              displaySelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
            }`} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${
              displaySelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} offers available</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            displaySelected 
              ? 'bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50 text-blue-700 dark:text-blue-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {item.count}
          </span>
          {!isBulkMode && (
            <div className={`p-3 rounded-full transition-all ${
              displaySelected 
                ? 'bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50 text-green-700 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400'
            }`}>
              {displaySelected ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferenceScreen;
