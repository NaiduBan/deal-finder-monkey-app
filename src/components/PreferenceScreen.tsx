
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search, Star, Store, Tag, X, Plus, Filter, SortAsc, SortDesc, TrendingUp, Users, BarChart3, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';

type SortOption = 'name' | 'count' | 'popular';
type SortDirection = 'asc' | 'desc';

const PreferenceScreen = () => {
  const { type } = useParams<{ type: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
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
          title: 'Store Preferences',
          subtitle: 'Choose your favorite stores',
          color: 'from-blue-500 to-blue-600',
          bubbleColor: 'from-blue-400 to-blue-500',
          placeholder: 'Search stores...',
          emptyMessage: 'No stores found',
          icon: Store,
          description: 'Select stores to get personalized offers and deals'
        };
      case 'brands':
        return {
          title: 'Brand Preferences', 
          subtitle: 'Select your preferred brands',
          color: 'from-purple-500 to-purple-600',
          bubbleColor: 'from-purple-400 to-purple-500',
          placeholder: 'Search brands...',
          emptyMessage: 'No brands found',
          icon: Star,
          description: 'Choose brands you love to see relevant offers'
        };
      case 'categories':
        return {
          title: 'Category Preferences',
          subtitle: 'Pick your favorite categories',
          color: 'from-green-500 to-green-600',
          bubbleColor: 'from-green-400 to-green-500',
          placeholder: 'Search categories...',
          emptyMessage: 'No categories found',
          icon: Tag,
          description: 'Select categories that interest you most'
        };
      default:
        return {
          title: 'Preferences',
          subtitle: 'Manage your preferences',
          color: 'from-gray-500 to-gray-600',
          bubbleColor: 'from-gray-400 to-gray-500',
          placeholder: 'Search...',
          emptyMessage: 'No items found',
          icon: Tag,
          description: 'Customize your experience'
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
    <div className="pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen relative overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
      </div>

      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} text-white py-6 px-4 sticky top-0 z-10 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-3 bg-white/20 rounded-full animate-pulse">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">{config.title}</h1>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/90 text-sm">{config.subtitle}</p>
              <p className="text-white/75 text-xs mt-1">{config.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Enhanced Stats with floating animation */}
        <div className="grid grid-cols-3 gap-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Check className="w-4 h-4 animate-bounce" />
              <p className="text-2xl font-bold">{selectedItems.length}</p>
            </div>
            <p className="text-xs text-white/80">Selected</p>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <BarChart3 className="w-4 h-4" />
              <p className="text-lg font-semibold">{availableItems.length}</p>
            </div>
            <p className="text-xs text-white/80">Available</p>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-lg font-semibold">{Math.round((selectedItems.length / Math.max(availableItems.length, 1)) * 100)}%</p>
            </div>
            <p className="text-xs text-white/80">Coverage</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4">
          {!bulkSelectMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkSelectMode(true)}
                className="text-white border-white/30 hover:bg-white/20 bg-transparent backdrop-blur-sm"
              >
                <Users className="w-4 h-4 mr-1" />
                Bulk Select
              </Button>
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllPreferences}
                  className="text-white border-white/30 hover:bg-white/20 bg-transparent backdrop-blur-sm"
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
                className="text-white border-white/30 hover:bg-white/20 bg-transparent backdrop-blur-sm"
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
                className="text-white border-white/30 hover:bg-white/20 bg-transparent backdrop-blur-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 relative z-10">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder={config.placeholder}
              className="pl-11 pr-4 py-3 w-full border-none rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={showSelected === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('all')}
                className="text-xs rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all"
              >
                All ({sortedAndFilteredItems.length})
              </Button>
              <Button
                variant={showSelected === 'selected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('selected')}
                className="text-xs rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all"
              >
                Selected ({selectedFilteredItems.length})
              </Button>
              <Button
                variant={showSelected === 'unselected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSelected('unselected')}
                className="text-xs rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all"
              >
                Available ({unselectedFilteredItems.length})
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('name')}
                className="text-xs rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all"
              >
                Name {sortBy === 'name' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('count')}
                className="text-xs rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all"
              >
                Count {sortBy === 'count' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
              </Button>
            </div>
          </div>
        </div>

        {/* Bubble Items Layout */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Selected items as bubbles */}
              {showSelected === 'all' && selectedFilteredItems.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    Selected Bubbles ({selectedFilteredItems.length})
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {selectedFilteredItems.map((item, index) => (
                      <BubbleItem
                        key={item.id}
                        item={item}
                        isSelected={true}
                        isBulkMode={bulkSelectMode}
                        isPendingSelection={pendingSelection.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                        config={config}
                        animationDelay={index * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Available items as bubbles */}
              {((showSelected === 'all' && unselectedFilteredItems.length > 0) || 
                (showSelected === 'unselected' && unselectedFilteredItems.length > 0) ||
                (showSelected === 'selected' && selectedFilteredItems.length > 0)) && (
                <div>
                  {showSelected === 'all' && (
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-blue-600" />
                      Available Bubbles ({unselectedFilteredItems.length})
                    </h2>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {(showSelected === 'selected' ? selectedFilteredItems : 
                      showSelected === 'unselected' ? unselectedFilteredItems : 
                      unselectedFilteredItems).map((item, index) => (
                      <BubbleItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        isBulkMode={bulkSelectMode}
                        isPendingSelection={pendingSelection.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                        config={config}
                        animationDelay={index * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && sortedAndFilteredItems.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl text-center shadow-lg border border-white/20">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <IconComponent className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {config.emptyMessage}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? `No ${type} found matching "${searchTerm}"` : `No ${type} available at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Bubble Item Component
const BubbleItem: React.FC<{
  item: { id: string; name: string; count: number };
  isSelected: boolean;
  isBulkMode: boolean;
  isPendingSelection: boolean;
  onClick: () => void;
  config: any;
  animationDelay: number;
}> = ({ item, isSelected, isBulkMode, isPendingSelection, onClick, config, animationDelay }) => {
  const displaySelected = isBulkMode ? isPendingSelection : isSelected;
  
  // Generate bubble size based on count
  const getBubbleSize = (count: number) => {
    if (count > 100) return 'w-32 h-16';
    if (count > 50) return 'w-28 h-14';
    if (count > 20) return 'w-24 h-12';
    return 'w-20 h-10';
  };

  const bubbleSize = getBubbleSize(item.count);
  
  return (
    <div
      className={`${bubbleSize} cursor-pointer transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 animate-fade-in relative group`}
      onClick={onClick}
      style={{ 
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'both'
      }}
    >
      <div
        className={`w-full h-full rounded-full flex items-center justify-center text-center px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
          displaySelected 
            ? `bg-gradient-to-r ${config.bubbleColor} text-white border-white shadow-2xl animate-pulse` 
            : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:border-blue-300 text-gray-800 hover:bg-white'
        }`}
      >
        {isBulkMode && (
          <div className="absolute -top-2 -right-2 z-10">
            <Checkbox 
              checked={isPendingSelection}
              className={`${displaySelected ? 'border-white bg-white' : 'border-gray-300'} rounded-full w-5 h-5`}
            />
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-1">
          <span className={`font-semibold text-xs leading-tight ${displaySelected ? 'text-white' : 'text-gray-800'}`}>
            {item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name}
          </span>
          <div className="flex items-center space-x-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              displaySelected 
                ? 'bg-white/30 text-white' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {item.count}
            </span>
            {!isBulkMode && (
              <div className={`p-1 rounded-full transition-all ${
                displaySelected 
                  ? 'bg-white/30' 
                  : 'bg-blue-100 group-hover:bg-blue-200'
              }`}>
                {displaySelected ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Plus className="w-3 h-3 text-blue-600" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Floating animation effect */}
        {displaySelected && (
          <div className="absolute inset-0 rounded-full animate-ping bg-white/20"></div>
        )}
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
        {item.name} ({item.count} offers)
      </div>
    </div>
  );
};

export default PreferenceScreen;
