
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Offer } from '@/types';
import { applyPreferencesToOffers } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { getCachedData, saveToCache } from '@/utils/cacheUtils';

/**
 * Hook for managing user preferences
 * @param userId The user ID
 * @param offers The offers array
 * @param setFilteredOffers Function to update filtered offers
 */
export const usePreferences = (
  userId: string | undefined,
  offers: Offer[],
  setFilteredOffers: (offers: Offer[]) => void
) => {
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>(() => {
    const cachedPreferences = getCachedData('userPreferences');
    return cachedPreferences || {
      brands: [],
      stores: [],
      banks: []
    };
  });

  // Function to get user preferences
  const getUserPreferences = async (userId: string) => {
    try {
      if (!userId) return;
      
      console.log('Fetching preferences for user:', userId);
      
      // Fetch preferences from Supabase
      const { data: preferencesData, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user preferences:', error);
        return;
      }
      
      console.log('Received preferences data:', preferencesData?.length || 0, 'items');
      
      // Organize preferences by type
      const preferences = {
        brands: [] as string[],
        stores: [] as string[],
        banks: [] as string[]
      };
      
      preferencesData?.forEach(pref => {
        if (preferences[pref.preference_type as keyof typeof preferences]) {
          preferences[pref.preference_type as keyof typeof preferences].push(pref.preference_id);
        }
      });
      
      console.log('Organized preferences:', preferences);
      
      // Only update if we actually have preferences (avoid overwriting with empty arrays)
      if (preferencesData && preferencesData.length > 0) {
        setUserPreferences(preferences);
        saveToCache('userPreferences', preferences);
        
        toast({
          title: "Preferences loaded",
          description: "Your offer preferences have been applied",
        });
      } else {
        console.log('No preferences found for user');
      }
      
      // Filter offers based on preferences if we have offers
      if (offers.length > 0) {
        const hasPreferences = preferences.brands.length > 0 || 
                               preferences.stores.length > 0 || 
                               preferences.banks.length > 0;
        
        if (hasPreferences) {
          console.log('Applying preferences to filter offers');
          const filtered = applyPreferencesToOffers(offers, preferences);
          setFilteredOffers(filtered.length > 0 ? filtered : offers);
          saveToCache('filteredOffers', filtered.length > 0 ? filtered : offers);
        } else {
          console.log('No preferences to apply, showing all offers');
          setFilteredOffers(offers);
          saveToCache('filteredOffers', offers);
        }
      }
    } catch (err) {
      console.error('Error getting user preferences:', err);
    }
  };

  // Apply preferences when offers or preferences change
  useEffect(() => {
    if (offers.length > 0) {
      const hasPreferences = userPreferences.brands.length > 0 || 
                             userPreferences.stores.length > 0 || 
                             userPreferences.banks.length > 0;
                             
      if (hasPreferences) {
        console.log('Preferences changed, refiltering offers');
        const filtered = applyPreferencesToOffers(offers, userPreferences);
        setFilteredOffers(filtered.length > 0 ? filtered : offers);
        saveToCache('filteredOffers', filtered.length > 0 ? filtered : offers);
      } else {
        console.log('No filtering preferences, showing all offers');
        setFilteredOffers(offers);
        saveToCache('filteredOffers', offers);
      }
    }
  }, [offers, userPreferences, setFilteredOffers]);

  // Fetch preferences when user changes
  useEffect(() => {
    if (userId) {
      console.log('User authenticated, fetching preferences');
      getUserPreferences(userId);
    } else {
      console.log('User not authenticated or missing ID, resetting preferences');
      // Reset preferences and filtered offers when user logs out
      setUserPreferences({
        brands: [],
        stores: [],
        banks: []
      });
      setFilteredOffers(offers);
      saveToCache('filteredOffers', offers);
    }
  }, [userId, offers, setFilteredOffers]);

  // Listen for preference changes in the user_preferences table
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime listener for preference changes');
    
    const channel = supabase
      .channel('public:user_preferences')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Preference change detected:', payload);
          // Refresh preferences when changes occur
          getUserPreferences(userId);
        }
      )
      .subscribe();

    return () => {
      console.log('Removing preference changes listener');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { userPreferences };
};
