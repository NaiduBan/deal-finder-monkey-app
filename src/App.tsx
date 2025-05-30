import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DataProvider } from '@/contexts/DataContext';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import LoginScreen from '@/components/LoginScreen';
import SplashScreen from '@/components/SplashScreen';
import CategoryScreen from '@/components/CategoryScreen';
import OfferDetailScreen from '@/components/OfferDetailScreen';
import SavedOffersScreen from '@/components/SavedOffersScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import PreferencesOverview from '@/components/PreferencesOverview';
import PreferenceDetailScreen from '@/components/PreferenceDetailScreen';
import ChatbotScreen from '@/components/ChatbotScreen';
import NotificationsScreen from '@/components/NotificationsScreen';
import PointsHistoryScreen from '@/components/PointsHistoryScreen';
import NotFoundScreen from '@/components/NotFoundScreen';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <DataProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/splash" element={<SplashScreen />} />
                  <Route path="/category/:categoryId" element={<CategoryScreen />} />
                  <Route path="/offer/:offerId" element={<OfferDetailScreen />} />
                  <Route path="/saved" element={<ProtectedRoute><SavedOffersScreen /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
                  <Route path="/preferences" element={<ProtectedRoute><PreferencesOverview /></ProtectedRoute>} />
                  <Route path="/preferences/:type" element={<ProtectedRoute><PreferenceDetailScreen /></ProtectedRoute>} />
                  <Route path="/chatbot" element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
                  <Route path="/points-history" element={<ProtectedRoute><PointsHistoryScreen /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundScreen />} />
                </Routes>
              </Router>
              <Toaster />
            </DataProvider>
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
