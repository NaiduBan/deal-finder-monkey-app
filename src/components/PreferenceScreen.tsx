
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Search } from 'lucide-react';
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
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTitle = () => {
    switch (type) {
      case 'brands': return 'Select Brands';
      case 'stores': return 'Select Stores';
      case 'banks': return 'Select Banks';
      default: return 'Select Preferences';
    }
  };

  // Fetch available items from Offers_data table
  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        setIsLoading(true);
        const { data: offers, error } = await supabase
          .from('Offers_data')
          .select('store, categories, terms_and_conditions, description, long_offer');
        
        if (error) throw error;

        const items = new Set<string>();
        
        if (type === 'stores') {
          offers?.forEach(offer => {
            if (offer.store) {
              items.add(offer.store.trim());
            }
          });
        } else if (type === 'brands') {
          offers?.forEach(offer => {
            if (offer.categories) {
              const categories = offer.categories.split(',');
              categories.forEach(cat => {
                const trimmed = cat.trim();
                if (trimmed) items.add(trimmed);
              });
            }
          });
        } else if (type === 'banks') {
          offers?.forEach(offer => {
            const fullText = `${offer.terms_and_conditions || ''} ${offer.description || ''} ${offer.long_offer || ''}`.toLowerCase();
            
            // Extract bank names from text
            const bankKeywords = [
              'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'paytm', 'citi', 'american express',
              'standard chartered', 'yes bank', 'indusind', 'bob', 'canara bank',
              'union bank', 'pnb', 'bank of india', 'central bank', 'indian bank'
            ];
            
            bankKeywords.forEach(bank => {
              if (fullText.includes(bank)) {
                items.add(bank.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '));
              }
            });
          });
        }

        setAvailableItems(Array.from(items).sort());
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
          // Refresh preferences when changes occur
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
        // Remove preference
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', type)
          .eq('preference_id', item);

        if (error) throw error;
        
        setSelectedItems(prev => prev.filter(id => id !== item));
      } else {
        // Add preference
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preference_type: type,
            preference_id: item
          });

        if (error) throw error;
        
        setSelectedItems(prev => [...prev, item]);
      }

      toast({
        title: isSelected ? "Preference removed" : "Preference added",
        description: `${item} ${isSelected ? 'removed from' : 'added to'} your ${type}`,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive"
      });
    }
  };

  const filteredItems = availableItems.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Link to="/home">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-medium">{getTitle()}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            placeholder={`Search ${type}...`}
            className="pl-10 pr-4 py-2 w-full border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selected count */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            {selectedItems.length} {type} selected
          </p>
        </div>

        {/* Items list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item);
                return (
                  <Button
                    key={item}
                    variant="outline"
                    className={`w-full justify-between h-auto p-4 ${
                      isSelected 
                        ? 'bg-monkeyGreen/10 border-monkeyGreen text-monkeyGreen' 
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={() => toggleItem(item)}
                  >
                    <span className="text-left">{item}</span>
                    {isSelected && <Check className="w-5 h-5" />}
                  </Button>
                );
              })
            ) : (
              <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                <p className="text-gray-500">
                  {searchTerm ? `No ${type} found matching "${searchTerm}"` : `No ${type} available`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceScreen;
