
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { applyPreferencesToOffers } from '@/services/supabaseService';
import { Offer } from '@/types';

export const useUserPreferences = (offers: Offer[]) => {
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string[]}>({
    brands: [],
    stores: [],
    banks: []
  });
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [localFilteredOffers, setLocalFilteredOffers] = useState<Offer[]>([]);

  // Fetch user preferences when component mounts and apply them immediately
  useEffect(() => {
    const fetchAndApplyUserPreferences = async () => {
      try {
        console.log("Fetching user preferences...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (error) {
            console.error('Error fetching user preferences:', error);
          } else if (data) {
            const preferences: {[key: string]: string[]} = {
              brands: data.filter(p => p.preference_type === 'brands').map(p => p.preference_id),
              stores: data.filter(p => p.preference_type === 'stores').map(p => p.preference_id),
              banks: data.filter(p => p.preference_type === 'banks').map(p => p.preference_id)
            };
            
            setUserPreferences(preferences);
            console.log('Loaded preferences:', preferences);

            // Apply preferences immediately if we have offers
            if (offers && offers.length > 0) {
              const hasPreferences = preferences.brands.length > 0 || 
                                   preferences.stores.length > 0 || 
                                   preferences.banks.length > 0;
              
              if (hasPreferences) {
                console.log('Applying preferences immediately to offers');
                const filtered = applyPreferencesToOffers(offers, preferences);
                const finalOffers = filtered.length > 0 ? filtered : offers;
                setLocalFilteredOffers(finalOffers);
                console.log('Applied preferences - showing', finalOffers.length, 'offers');
              } else {
                setLocalFilteredOffers(offers);
              }
            }

            if (preferences.brands.length > 0 || preferences.stores.length > 0 || preferences.banks.length > 0) {
              console.log('User has personalization preferences applied');
            }
          }
          
          setHasLoadedPreferences(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setHasLoadedPreferences(true);
      }
    };
    
    fetchAndApplyUserPreferences();
  }, [offers]);

  // Listen for real-time preference changes and update immediately
  useEffect(() => {
    const setupRealtimeListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      console.log('Setting up real-time preference listener for home screen');

      const channel = supabase
        .channel('home-preference-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_preferences',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            console.log('Home screen detected preference change:', payload);
            
            // Refetch all preferences immediately
            try {
              const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', session.user.id);
                
              if (!error && data) {
                const newPreferences: {[key: string]: string[]} = {
                  brands: data.filter(p => p.preference_type === 'brands').map(p => p.preference_id),
                  stores: data.filter(p => p.preference_type === 'stores').map(p => p.preference_id),
                  banks: data.filter(p => p.preference_type === 'banks').map(p => p.preference_id)
                };
                
                setUserPreferences(newPreferences);
                console.log('Updated preferences in home screen:', newPreferences);
                
                // Apply new preferences immediately
                if (offers && offers.length > 0) {
                  const hasPreferences = newPreferences.brands.length > 0 || 
                                       newPreferences.stores.length > 0 || 
                                       newPreferences.banks.length > 0;
                  
                  if (hasPreferences) {
                    console.log('Applying new preferences to offers');
                    const filtered = applyPreferencesToOffers(offers, newPreferences);
                    const finalOffers = filtered.length > 0 ? filtered : offers;
                    setLocalFilteredOffers(finalOffers);
                    console.log('Applied new preferences - showing', finalOffers.length, 'offers');
                  } else {
                    console.log('No preferences, showing all offers');
                    setLocalFilteredOffers(offers);
                  }
                }
              }
            } catch (error) {
              console.error('Error refetching preferences:', error);
            }
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up home screen preference listener');
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeListener();
  }, [offers]);

  // Update local filtered offers when offers change
  useEffect(() => {
    if (offers && offers.length > 0) {
      const hasPreferences = userPreferences.brands.length > 0 || 
                           userPreferences.stores.length > 0 || 
                           userPreferences.banks.length > 0;
      
      if (hasPreferences) {
        const filtered = applyPreferencesToOffers(offers, userPreferences);
        const finalOffers = filtered.length > 0 ? filtered : offers;
        setLocalFilteredOffers(finalOffers);
      } else {
        setLocalFilteredOffers(offers);
      }
    } else {
      setLocalFilteredOffers([]);
    }
  }, [offers, userPreferences]);

  return {
    userPreferences,
    hasLoadedPreferences,
    localFilteredOffers
  };
};
