
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Store, Tag, CreditCard, Check, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const PreferencesScreen = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { offers } = useData();
  const [activeTab, setActiveTab] = useState<'stores' | 'categories' | 'banks'>('stores');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<{[key: string]: string[]}>({
    stores: [],
    categories: [],
    banks: []
  });
  const [availableOptions, setAvailableOptions] = useState<{[key: string]: {name: string, count: number}[]}>({
    stores: [],
    categories: [],
    banks: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Extract available options from offers data
  useEffect(() => {
    const extractOptions = () => {
      const storesMap = new Map<string, number>();
      const categoriesMap = new Map<string, number>();
      const banksMap = new Map<string, number>();

      offers.forEach(offer => {
        // Extract stores
        if (offer.store) {
          const store = offer.store.trim();
          storesMap.set(store, (storesMap.get(store) || 0) + 1);
        }

        // Extract categories
        if (offer.categories) {
          const cats = offer.categories.split(',');
          cats.forEach(cat => {
            const category = cat.trim();
            if (category) {
              categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
            }
          });
        }

        // Extract banks from text content
        const fullText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
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
            banksMap.set(bankName, (banksMap.get(bankName) || 0) + 1);
          }
        });
      });

      setAvailableOptions({
        stores: Array.from(storesMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        categories: Array.from(categoriesMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        banks: Array.from(banksMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
      });
    };

    extractOptions();
  }, [offers]);

  // Load user preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_type, preference_value')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const preferences = { stores: [], categories: [], banks: [] };
        data?.forEach(pref => {
          if (preferences[pref.preference_type as keyof typeof preferences]) {
            preferences[pref.preference_type as keyof typeof preferences].push(pref.preference_value);
          }
        });

        setSelectedPreferences(preferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load preferences",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session, toast]);

  // Real-time subscription for preference changes
  useEffect(() => {
    if (!session?.user) return;

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
          if (payload.eventType === 'INSERT') {
            setSelectedPreferences(prev => ({
              ...prev,
              [payload.new.preference_type]: [...prev[payload.new.preference_type as keyof typeof prev], payload.new.preference_value]
            }));
          } else if (payload.eventType === 'DELETE') {
            setSelectedPreferences(prev => ({
              ...prev,
              [payload.old.preference_type]: prev[payload.old.preference_type as keyof typeof prev].filter(val => val !== payload.old.preference_value)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const togglePreference = async (type: 'stores' | 'categories' | 'banks', value: string) => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save preferences",
        variant: "destructive"
      });
      return;
    }

    try {
      const isSelected = selectedPreferences[type].includes(value);
      
      if (isSelected) {
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', session.user.id)
          .eq('preference_type', type)
          .eq('preference_value', value);

        if (error) throw error;
        
        toast({
          title: "Preference removed",
          description: `${value} removed from your ${type}`,
        });
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preference_type: type,
            preference_value: value
          });

        if (error) throw error;
        
        toast({
          title: "Preference added",
          description: `${value} added to your ${type}`,
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

  const clearAllPreferences = async (type: 'stores' | 'categories' | 'banks') => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', session.user.id)
        .eq('preference_type', type);

      if (error) throw error;
      
      toast({
        title: "Preferences cleared",
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

  const getTabConfig = (tab: 'stores' | 'categories' | 'banks') => {
    switch (tab) {
      case 'stores':
        return {
          title: 'Preferred Stores',
          icon: Store,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          hoverColor: 'hover:border-green-400'
        };
      case 'categories':
        return {
          title: 'Favorite Categories',
          icon: Tag,
          color: 'from-green-600 to-green-700',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          hoverColor: 'hover:border-green-400'
        };
      case 'banks':
        return {
          title: 'Your Banks',
          icon: CreditCard,
          color: 'from-emerald-500 to-green-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          hoverColor: 'hover:border-green-400'
        };
    }
  };

  const currentConfig = getTabConfig(activeTab);
  const IconComponent = currentConfig.icon;
  const filteredOptions = availableOptions[activeTab].filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedItems = selectedPreferences[activeTab];
  const selectedFilteredItems = filteredOptions.filter(option => selectedItems.includes(option.name));
  const unselectedFilteredItems = filteredOptions.filter(option => !selectedItems.includes(option.name));

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentConfig.color} text-white py-6 px-4 sticky top-0 z-10 shadow-lg`}>
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/home" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-full">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{currentConfig.title}</h1>
              <p className="text-white/90 text-sm">Select your preferences for personalized offers</p>
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
            <p className="text-lg font-semibold">{availableOptions[activeTab].length}</p>
            <p className="text-xs text-white/80">Available</p>
          </div>
          {selectedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAllPreferences(activeTab)}
              className="text-white border-white/30 hover:bg-white/20 bg-transparent"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="flex space-x-2 mb-4 bg-white rounded-lg p-1 shadow-sm">
          {(['stores', 'categories', 'banks'] as const).map((tab) => {
            const config = getTabConfig(tab);
            const TabIcon = config.icon;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="text-sm capitalize">{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder={`Search ${activeTab}...`}
            className="pl-11 pr-4 py-3 w-full border-green-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selected Items */}
        {selectedFilteredItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-600" />
              Selected ({selectedFilteredItems.length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {selectedFilteredItems.map((item) => (
                <PreferenceItem
                  key={item.name}
                  item={item}
                  isSelected={true}
                  onClick={() => togglePreference(activeTab, item.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Items */}
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
                    key={item.name}
                    item={item}
                    isSelected={false}
                    onClick={() => togglePreference(activeTab, item.name)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOptions.length === 0 && (
          <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-green-100">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? `No ${activeTab} found matching "${searchTerm}"` : `No ${activeTab} available at the moment`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Preference Item Component
const PreferenceItem: React.FC<{
  item: { name: string; count: number };
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

export default PreferencesScreen;
