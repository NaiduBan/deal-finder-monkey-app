
import { Offer } from '@/types';

export interface UserPreferences {
  stores: string[];
  categories: string[];
  banks: string[];
}

export const filterOffersByPreferences = (
  offers: Offer[],
  preferences: UserPreferences
): Offer[] => {
  // If no preferences are set, return all offers
  const hasAnyPreferences = Object.values(preferences).some(arr => arr.length > 0);
  if (!hasAnyPreferences) {
    console.log('No preferences set, returning all offers');
    return offers;
  }

  console.log('Filtering offers with preferences:', {
    stores: preferences.stores.length,
    categories: preferences.categories.length,
    banks: preferences.banks.length,
    totalOffers: offers.length
  });

  const filteredOffers = offers.filter(offer => {
    let matchesPreference = false;

    // Check store preferences
    if (preferences.stores.length > 0 && offer.store) {
      const storeMatches = preferences.stores.some(prefStore => 
        offer.store.toLowerCase().includes(prefStore.toLowerCase()) ||
        prefStore.toLowerCase().includes(offer.store.toLowerCase())
      );
      if (storeMatches) {
        matchesPreference = true;
      }
    }

    // Check category preferences
    if (preferences.categories.length > 0 && offer.categories) {
      const offerCategories = offer.categories.split(',').map(cat => cat.trim().toLowerCase());
      const categoryMatches = preferences.categories.some(prefCategory => 
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
    if (preferences.banks.length > 0) {
      const offerText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
      const bankMatches = preferences.banks.some(prefBank => 
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
  preferences: UserPreferences
) => {
  const hasPreferences = Object.values(preferences).some(arr => arr.length > 0);
  
  return {
    totalOffers: allOffers.length,
    filteredOffers: filteredOffers.length,
    filteringActive: hasPreferences,
    filterPercentage: hasPreferences ? Math.round((filteredOffers.length / allOffers.length) * 100) : 100,
    preferencesCount: {
      stores: preferences.stores.length,
      categories: preferences.categories.length,
      banks: preferences.banks.length
    }
  };
};
