
import { useState, useEffect } from 'react';
import { applyPreferencesToOffers, fetchUserPreferences } from '@/services/mockApiService';
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
        const mockSession = localStorage.getItem('mock_session');
        
        if (mockSession) {
          const session = JSON.parse(mockSession);
          if (session.user) {
            const data = await fetchUserPreferences(session.user.id);
            
            const preferences: {[key: string]: string[]} = {
              brands: data.filter(p => p.preferenceType === 'brands').map(p => p.preferenceId),
              stores: data.filter(p => p.preferenceType === 'stores').map(p => p.preferenceId),
              banks: data.filter(p => p.preferenceType === 'banks').map(p => p.preferenceId)
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

  // Mock real-time preference changes listener
  useEffect(() => {
    const setupMockListener = () => {
      const mockSession = localStorage.getItem('mock_session');
      
      if (!mockSession) return;

      console.log('Setting up mock preference listener for home screen');

      // Mock real-time updates by polling preferences every 30 seconds
      const interval = setInterval(async () => {
        try {
          const session = JSON.parse(mockSession);
          if (session.user) {
            const data = await fetchUserPreferences(session.user.id);
            
            const newPreferences: {[key: string]: string[]} = {
              brands: data.filter(p => p.preferenceType === 'brands').map(p => p.preferenceId),
              stores: data.filter(p => p.preferenceType === 'stores').map(p => p.preferenceId),
              banks: data.filter(p => p.preferenceType === 'banks').map(p => p.preferenceId)
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
      }, 30000);

      return () => {
        console.log('Cleaning up home screen preference listener');
        clearInterval(interval);
      };
    };

    const cleanup = setupMockListener();
    return cleanup;
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
