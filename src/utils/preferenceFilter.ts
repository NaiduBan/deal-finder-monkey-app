
import { Offer } from '@/types';

export interface UserPreferences {
  stores: string[];
  categories: string[];
  banks: string[];
}

export const convertToUserPreferences = (preferences: {[key: string]: string[]}): UserPreferences => {
  return {
    stores: preferences.stores || [],
    categories: preferences.categories || [],
    banks: preferences.banks || []
  };
};

export const filterOffersByPreferences = (
  offers: Offer[],
  preferences: {[key: string]: string[]}
): Offer[] => {
  const userPrefs = convertToUserPreferences(preferences);
  
  // If no preferences are set, return all offers
  const hasAnyPreferences = Object.values(userPrefs).some(arr => arr.length > 0);
  if (!hasAnyPreferences) {
    console.log('No preferences set, returning all offers');
    return offers;
  }

  console.log('Filtering offers with preferences:', {
    stores: userPrefs.stores.length,
    categories: userPrefs.categories.length,
    banks: userPrefs.banks.length,
    totalOffers: offers.length
  });

  const filteredOffers = offers.filter(offer => {
    let matchesPreference = false;

    // Check store preferences
    if (userPrefs.stores.length > 0 && offer.store) {
      const storeMatches = userPrefs.stores.some(prefStore => 
        offer.store.toLowerCase().includes(prefStore.toLowerCase()) ||
        prefStore.toLowerCase().includes(offer.store.toLowerCase())
      );
      if (storeMatches) {
        matchesPreference = true;
      }
    }

    // Check category preferences
    if (userPrefs.categories.length > 0 && offer.categories) {
      const offerCategories = offer.categories.split(',').map(cat => cat.trim().toLowerCase());
      const categoryMatches = userPrefs.categories.some(prefCategory => 
        offerCategories.some(offerCat => 
          offerCat.includes(prefCategory.toLowerCase()) ||
          prefCategory.toLowerCase().includes(offerCat)
        )
      );
      if (categoryMatches) {
        matchesPreference = true;
      }
    }

    // Check bank preferences in offer content
    if (userPrefs.banks.length > 0) {
      const offerText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      const bankMatches = userPrefs.banks.some(prefBank => 
        offerText.includes(prefBank.toLowerCase())
      );
      if (bankMatches) {
        matchesPreference = true;
      }
    }

    return matchesPreference;
  });

  console.log(`Filtered ${offers.length} offers down to ${filteredOffers.length} based on preferences`);
  return filteredOffers;
};

export const getPreferenceStats = (
  allOffers: Offer[],
  filteredOffers: Offer[],
  preferences: {[key: string]: string[]}
) => {
  const userPrefs = convertToUserPreferences(preferences);
  const hasPreferences = Object.values(userPrefs).some(arr => arr.length > 0);
  
  return {
    totalOffers: allOffers.length,
    filteredOffers: filteredOffers.length,
    filteringActive: hasPreferences,
    filterPercentage: hasPreferences ? Math.round((filteredOffers.length / allOffers.length) * 100) : 100,
    preferencesCount: {
      stores: userPrefs.stores.length,
      categories: userPrefs.categories.length,
      banks: userPrefs.banks.length
    }
  };
};
