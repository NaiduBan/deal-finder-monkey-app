
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search, Star, Store, CreditCard, Grid, X } from 'lucide-react';
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

  const getPreferenceConfig = () => {
    switch (type) {
      case 'brands':
        return {
          title: 'Favorite Brands',
          subtitle: 'Select brands you love to see personalized offers',
          icon: Star,
          placeholder: 'Search brands...',
          emptyMessage: 'No brands found'
        };
      case 'stores':
        return {
          title: 'Preferred Stores',
          subtitle: 'Choose stores where you shop most often',
          icon: Store,
          placeholder: 'Search stores...',
          emptyMessage: 'No stores found'
        };
      case 'banks':
        return {
          title: 'Your Banks',
          subtitle: 'Select your banks to see relevant card offers',
          icon: CreditCard,
          placeholder: 'Search banks...',
          emptyMessage: 'No banks found'
        };
      default:
        return {
          title: 'Preferences',
          subtitle: 'Select your preferences',
          icon: Grid,
          placeholder: 'Search...',
          emptyMessage: 'No items found'
        };
    }
  };

  const config = getPreferenceConfig();
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
        } else if (type === 'brands') {
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
            const fullText = `${offer.terms_and_conditions || ''} ${offer.description || ''} ${offer.long_offer || ''}`.toLowerCase();
            
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
          .sort((a, b) => b.count - a.count); // Sort by count descending

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
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_id')
          .eq('user_id', session.user.id)
          .eq('preference_type', type);

        if (error) throw error;

        setSelectedItems(data?.map(item => item.preference_id) || []);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadUserPreferences();
  }, [session, type]);

  // Real-time subscription for preference changes
  useEffect(() => {
    if (!session?.user || !type) return;

    const channel = supabase
      .channel('user-preferences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Preference change detected:', payload);
          if (payload.eventType === 'INSERT' && payload.new.preference_type === type) {
            setSelectedItems(prev => [...prev, payload.new.preference_id]);
          } else if (payload.eventType === 'DELETE' && payload.old.preference_type === type) {
            setSelectedItems(prev => prev.filter(id => id !== payload.old.preference_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, type]);

  const toggleItem = async (item: string) => {
    if (!session?.user || !type) return;

    try {
      const isSelected = selectedItems.includes(item);
      
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

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-monkeyGreen to-green-600 text-white py-6 px-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Link to="/home" className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-green-100 text-sm">{config.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Search and Stats */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder={config.placeholder}
              className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-monkeyGreen/20 focus:border-monkeyGreen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-monkeyGreen">{selectedItems.length}</p>
                <p className="text-sm text-gray-600">{type} selected</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700">{availableItems.length}</p>
                <p className="text-sm text-gray-600">available</p>
              </div>
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllPreferences}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-monkeyGreen"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              <>
                {/* Selected Items First */}
                {filteredItems.filter(item => selectedItems.includes(item.id)).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                      Selected ({filteredItems.filter(item => selectedItems.includes(item.id)).length})
                    </h3>
                    {filteredItems
                      .filter(item => selectedItems.includes(item.id))
                      .map((item) => (
                        <PreferenceItem
                          key={item.id}
                          item={item}
                          isSelected={true}
                          onClick={() => toggleItem(item.id)}
                        />
                      ))}
                  </div>
                )}

                {/* Available Items */}
                {filteredItems.filter(item => !selectedItems.includes(item.id)).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                      Available ({filteredItems.filter(item => !selectedItems.includes(item.id)).length})
                    </h3>
                    {filteredItems
                      .filter(item => !selectedItems.includes(item.id))
                      .map((item) => (
                        <PreferenceItem
                          key={item.id}
                          item={item}
                          isSelected={false}
                          onClick={() => toggleItem(item.id)}
                        />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-gray-400" />
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
        ? 'bg-monkeyGreen/10 border-monkeyGreen shadow-md' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className={`font-medium ${isSelected ? 'text-monkeyGreen' : 'text-gray-900'}`}>
          {item.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {item.count} offer{item.count !== 1 ? 's' : ''} available
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isSelected 
            ? 'bg-monkeyGreen/20 text-monkeyGreen' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {item.count}
        </span>
        {isSelected && (
          <div className="p-1 bg-monkeyGreen rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default PreferenceScreen;
