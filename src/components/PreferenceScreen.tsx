import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search, Star, Store, Tag, X, Plus, TrendingUp, Users, BarChart3, RefreshCw, Sparkles, CreditCard, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortOption = 'name' | 'count';
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
  const [isSaving, setIsSaving] = useState(false);

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

  // Load user preferences from database
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

      const preferences = data?.map(item => item.preference_id) || [];
      console.log('Loaded preferences:', preferences);
      setSelectedItems(preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load your preferences",
        variant: "destructive"
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAvailableItems();
  }, [type]);

  // Load user preferences when component mounts or type changes
  useEffect(() => {
    loadUserPreferences();
  }, [session, type]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAvailableItems(), loadUserPreferences()]);
    setIsRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Latest preferences data has been loaded",
    });
  };

  // Real-time subscription for preference changes
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
    if (!session?.user || !type || isSaving) return;

    if (bulkSelectMode) {
      setPendingSelection(prev => 
        prev.includes(item) 
          ? prev.filter(id => id !== item)
          : [...prev, item]
      );
      return;
    }

    try {
      setIsSaving(true);
      const isSelected = selectedItems.includes(item);
      console.log('Toggling item:', item, 'currently selected:', isSelected);
      
      if (isSelected) {
        // Remove from database
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', type)
          .eq('preference_id', item);

        if (error) throw error;
        
        // Update local state immediately for better UX
        setSelectedItems(prev => prev.filter(id => id !== item));
        
        toast({
          title: "Preference removed",
          description: `${item} removed from your ${type}`,
        });
      } else {
        // Add to database
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preference_type: type,
            preference_id: item
          });

        if (error) throw error;
        
        // Update local state immediately for better UX
        setSelectedItems(prev => [...prev, item]);
        
        toast({
          title: "Preference added",
          description: `${item} added to your ${type}`,
        });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference. Please try again.",
        variant: "destructive"
      });
      // Reload preferences to sync with database
      await loadUserPreferences();
    } finally {
      setIsSaving(false);
    }
  };

  const applyBulkSelection = async () => {
    if (!session?.user || !type || isSaving) return;

    try {
      setIsSaving(true);
      
      // Remove items that are not in pending selection
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

      // Add items that are in pending selection but not currently selected
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

      // Update local state
      setSelectedItems(pendingSelection);
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
        description: "Failed to apply bulk selection. Please try again.",
        variant: "destructive"
      });
      // Reload preferences to sync with database
      await loadUserPreferences();
    } finally {
      setIsSaving(false);
    }
  };

  const clearAllPreferences = async () => {
    if (!session?.user || !type || isSaving) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', session.user.id)
        .eq('preference_type', type);

      if (error) throw error;
      
      // Update local state
      setSelectedItems([]);
      
      toast({
        title: "All preferences cleared",
        description: `All ${type} preferences have been removed`,
      });
    } catch (error) {
      console.error('Error clearing preferences:', error);
      toast({
        title: "Error",
        description: "Failed to clear preferences. Please try again.",
        variant: "destructive"
      });
      // Reload preferences to sync with database
      await loadUserPreferences();
    } finally {
      setIsSaving(false);
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
    <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className={`${isMobile ? 'px-4 py-4' : 'px-8 py-6 max-w-6xl mx-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/preferences" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-gradient-to-r ${config.gradient} rounded-xl`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{config.emoji}</span>
                    <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-gray-100`}>{config.title}</h1>
                  </div>
                  <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>{config.subtitle}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {selectedItems.length} selected
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {availableItems.length} available
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!bulkSelectMode ? (
                <>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={() => setBulkSelectMode(true)}
                    disabled={isSaving}
                    className="bg-white dark:bg-gray-800"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Select
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-9 h-9">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={refreshData} disabled={isRefreshing || isSaving}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </DropdownMenuItem>
                      {selectedItems.length > 0 && (
                        <DropdownMenuItem onClick={clearAllPreferences} disabled={isSaving} className="text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-600 dark:focus:text-red-500">
                          <X className="w-4 h-4 mr-2" />
                          Clear All
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkSelectMode(false);
                      setPendingSelection([]);
                    }}
                    disabled={isSaving}
                    className="bg-white dark:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={applyBulkSelection}
                    disabled={isSaving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Apply ({pendingSelection.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'max-w-6xl mx-auto px-8 py-8'}`}>
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder={config.placeholder}
              className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters and Sort */}
          <div className={`flex gap-4 items-center justify-between ${isMobile ? 'flex-col items-stretch' : ''}`}>
            <ToggleGroup 
              type="single" 
              value={showSelected}
              onValueChange={(value) => { if (value) setShowSelected(value as any) }} 
              className="bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700"
            >
              <ToggleGroupItem value="all" aria-label="Toggle all" className="rounded-full px-4 text-xs md:text-sm">
                All ({availableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length})
              </ToggleGroupItem>
              <ToggleGroupItem value="selected" aria-label="Toggle selected" className="rounded-full px-4 text-xs md:text-sm">
                Selected ({selectedItems.length})
              </ToggleGroupItem>
              <ToggleGroupItem value="unselected" aria-label="Toggle unselected" className="rounded-full px-4 text-xs md:text-sm">
                Available ({availableItems.length - selectedItems.length})
              </ToggleGroupItem>
            </ToggleGroup>

            <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                const [newSortBy, newSortDirection] = value.split('-');
                setSortBy(newSortBy as SortOption);
                setSortDirection(newSortDirection as SortDirection);
            }}>
                <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-gray-800 rounded-full">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="count-desc">Popularity: High to Low</SelectItem>
                    <SelectItem value="count-asc">Popularity: Low to High</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
            </Select>
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
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
                    {selectedFilteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={true}
                        isBulkMode={bulkSelectMode}
                        isPendingSelection={pendingSelection.includes(item.id)}
                        onClick={() => toggleItem(item.id)}
                        config={config}
                        disabled={isSaving}
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
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
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
                        disabled={isSaving}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && sortedAndFilteredItems.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
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
  disabled?: boolean;
}> = ({ item, isSelected, isBulkMode, isPendingSelection, onClick, config, disabled = false }) => {
  const displaySelected = isBulkMode ? isPendingSelection : isSelected;
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "bg-white dark:bg-gray-800 p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4 group",
        "hover:shadow-lg hover:-translate-y-1",
        displaySelected 
          ? "border-blue-500/50 dark:border-blue-500/70 shadow-sm" 
          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      {isBulkMode && (
        <Checkbox 
          checked={isPendingSelection}
          className="rounded-md w-5 h-5 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          disabled={disabled}
        />
      )}
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
        displaySelected ? `bg-blue-100 dark:bg-blue-900/50` : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
      )}>
        <config.icon className={cn(
          "w-6 h-6 transition-colors",
          displaySelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} offers</p>
      </div>
      <div className="flex items-center gap-2">
        {!isBulkMode && (
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform",
            displaySelected 
              ? 'bg-blue-600 dark:bg-blue-500 text-white scale-100' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 scale-0 group-hover:scale-100'
          )}>
            {displaySelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceScreen;
