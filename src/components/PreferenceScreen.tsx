
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search, Star, Store, Tag, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PreferenceScreen = () => {
  const { type } = useParams<{ type: string }>();
  const { toast } = useToast();
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<{ id: string; name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration based on preference type
  const getConfig = () => {
    switch (type) {
      case 'stores':
        return {
          title: 'Store Preferences',
          subtitle: 'Choose your favorite stores',
          color: 'from-blue-500 to-blue-600',
          placeholder: 'Search stores...',
          emptyMessage: 'No stores found',
          icon: Store
        };
      case 'brands':
        return {
          title: 'Brand Preferences',
          subtitle: 'Select your preferred brands',
          color: 'from-purple-500 to-purple-600',
          placeholder: 'Search brands...',
          emptyMessage: 'No brands found',
          icon: Star
        };
      case 'categories':
        return {
          title: 'Category Preferences',
          subtitle: 'Pick your favorite categories',
          color: 'from-green-500 to-green-600',
          placeholder: 'Search categories...',
          emptyMessage: 'No categories found',
          icon: Tag
        };
      default:
        return {
          title: 'Preferences',
          subtitle: 'Manage your preferences',
          color: 'from-gray-500 to-gray-600',
          placeholder: 'Search...',
          emptyMessage: 'No items found',
          icon: Tag
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  // Fetch available items with counts from Offers_data table
  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        setIsLoading(true);
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

    fetchAvailableItems();
  }, [type, toast]);

  // Load user's current preferences
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

  // Enhanced real-time subscription for preference changes
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

  const toggleItem = async (item: string) => {
    if (!session?.user || !type) return;

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

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate selected and unselected items
  const selectedFilteredItems = filteredItems.filter(item => selectedItems.includes(item.id));
  const unselectedFilteredItems = filteredItems.filter(item => !selectedItems.includes(item.id));

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} text-white py-6 px-4 sticky top-0 z-10 shadow-lg`}>
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-full">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-white/90 text-sm">{config.subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between bg-white/10 rounded-lg p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{selectedItems.length}</p>
            <p className="text-xs text-white/80">Selected</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{availableItems.length}</p>
            <p className="text-xs text-white/80">Available</p>
          </div>
          {selectedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllPreferences}
              className="text-white border-white/30 hover:bg-white/20 bg-transparent"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder={config.placeholder}
            className="pl-11 pr-4 py-3 w-full border-green-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selected Items Section */}
        {selectedFilteredItems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-600" />
              Selected ({selectedFilteredItems.length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {selectedFilteredItems.map((item) => (
                <PreferenceItem
                  key={item.id}
                  item={item}
                  isSelected={true}
                  onClick={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Items Section */}
        {unselectedFilteredItems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-600" />
              Available ({unselectedFilteredItems.length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                </div>
              ) : (
                unselectedFilteredItems.map((item) => (
                  <PreferenceItem
                    key={item.id}
                    item={item}
                    isSelected={false}
                    onClick={() => toggleItem(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-green-100">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-green-600" />
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
  );
};

// Individual Preference Item Component
const PreferenceItem: React.FC<{
  item: { id: string; name: string; count: number };
  isSelected: boolean;
  onClick: () => void;
}> = ({ item, isSelected, onClick }) => (
  <div
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg transform scale-[1.02]' 
        : 'bg-white border-green-200 hover:border-green-400 hover:shadow-md hover:bg-green-50'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {item.name}
        </h4>
        <p className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
          {item.count} offer{item.count !== 1 ? 's' : ''} available
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          isSelected 
            ? 'bg-white/20 text-white' 
            : 'bg-green-100 text-green-700'
        }`}>
          {item.count}
        </span>
        <div className={`p-2 rounded-full transition-all ${
          isSelected 
            ? 'bg-white/20' 
            : 'bg-green-100'
        }`}>
          {isSelected ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Plus className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default PreferenceScreen;
