
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import HomeScreen from '@/components/HomeScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import SavedOffersScreen from '@/components/SavedOffersScreen';
import NotificationsScreen from '@/components/NotificationsScreen';
import PointsHistoryScreen from '@/components/PointsHistoryScreen';
import CategoryScreen from '@/components/CategoryScreen';
import OfferDetailScreen from '@/components/OfferDetailScreen';
import ChatbotScreen from '@/components/ChatbotScreen';
import NotFoundScreen from '@/components/NotFoundScreen';
import BottomNavigation from '@/components/BottomNavigation';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <DataProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <HomeScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <SavedOffersScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/points"
                    element={
                      <ProtectedRoute>
                        <PointsHistoryScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/category/:categoryName"
                    element={
                      <ProtectedRoute>
                        <CategoryScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/offer/:id"
                    element={
                      <ProtectedRoute>
                        <OfferDetailScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatbotScreen />
                        <BottomNavigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundScreen />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </DataProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
