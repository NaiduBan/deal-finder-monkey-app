// Script to help identify files that need auth import updates
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/AIShoppingAssistant.tsx',
  'src/components/BrandDetailScreen.tsx', 
  'src/components/CategoriesScreen.tsx',
  'src/components/CategoryDetailScreen.tsx',
  'src/components/CategoryScreen.tsx',
  'src/components/ChatbotScreen.tsx',
  'src/components/EditProfile.tsx',
  'src/components/LoginScreen.tsx',
  'src/components/NotificationsScreen.tsx',
  'src/components/OfferCard.tsx',
  'src/components/OfferDetail/OfferActions.tsx',
  'src/components/PreferenceScreen.tsx',
  'src/components/PreferencesScreen.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/ProtectedRoute.tsx',
  'src/components/SavedOffersScreen.tsx',
  'src/components/StoreDetailScreen.tsx'
];

filesToUpdate.forEach(file => {
  console.log(`File to update: ${file}`);
});