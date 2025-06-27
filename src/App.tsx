
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Import components
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import SavedOffersScreen from './components/SavedOffersScreen';
import PreferencesScreen from './components/PreferencesScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import NotificationsScreen from './components/NotificationsScreen';
import PointsHistoryScreen from './components/PointsHistoryScreen';
import OfferDetailScreen from './components/OfferDetailScreen';
import StoreDetailScreen from './components/StoreDetailScreen';
import BrandDetailScreen from './components/BrandDetailScreen';
import CategoryScreen from './components/CategoryScreen';
import ChatbotScreen from './components/ChatbotScreen';
import NotFoundScreen from './components/NotFoundScreen';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import SearchPreferencesScreen from './components/SearchPreferencesScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import BottomNavigation from './components/BottomNavigation';
import StoresScreen from './components/StoresScreen';
import BrandsScreen from './components/BrandsScreen';
import CategoriesScreen from './components/CategoriesScreen';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="relative min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute><></></ProtectedRoute>}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/saved" element={<SavedOffersScreen />} />
            <Route path="/stores" element={<StoresScreen />} />
            <Route path="/brands" element={<BrandsScreen />} />
            <Route path="/categories" element={<CategoriesScreen />} />
            <Route path="/preferences" element={<PreferencesScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/points-history" element={<PointsHistoryScreen />} />
            <Route path="/offer/:id" element={<OfferDetailScreen />} />
            <Route path="/store/:storeName" element={<StoreDetailScreen />} />
            <Route path="/brand/:brandName" element={<BrandDetailScreen />} />
            <Route path="/category/:categoryName" element={<CategoryScreen />} />
            <Route path="/chatbot" element={<ChatbotScreen />} />
            <Route path="/search-preferences" element={<SearchPreferencesScreen />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<AdminRoute><></></AdminRoute>}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>

        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
