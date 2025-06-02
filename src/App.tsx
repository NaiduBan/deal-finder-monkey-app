import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import HomeScreen from '@/components/HomeScreen';
import CategoryScreen from '@/components/CategoryScreen';
import OfferScreen from '@/components/OfferScreen';
import SearchScreen from '@/components/SearchScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import NotificationScreen from '@/components/NotificationScreen';
import PreferenceScreen from '@/components/PreferenceScreen';
import TermsScreen from '@/components/TermsScreen';
import PrivacyScreen from '@/components/PrivacyScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthProvider from '@/contexts/AuthContext';
import UserProvider from '@/contexts/UserContext';
import DataProvider from '@/contexts/DataContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import EditProfileScreen from '@/components/EditProfileScreen';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UserProvider>
              <DataProvider>
                <div className="App">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/home" element={<HomeScreen />} />
                    <Route path="/category/:categoryId" element={<CategoryScreen />} />
                    <Route path="/offer/:offerId" element={<OfferScreen />} />
                    <Route path="/search" element={<SearchScreen />} />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfileScreen />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsScreen />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <NotificationScreen />
                      </ProtectedRoute>
                    } />
                    <Route path="/preferences/:type" element={
                      <ProtectedRoute>
                        <PreferenceScreen />
                      </ProtectedRoute>
                    } />
                    <Route path="/preferences" element={
                      <ProtectedRoute>
                        <div>
                          <h1>Preferences</h1>
                          <p>Select a preference type:</p>
                          <ul>
                            <li><a href="/preferences/stores">Stores</a></li>
                            <li><a href="/preferences/brands">Brands</a></li>
                             <li><a href="/preferences/categories">Categories</a></li>
                             <li><a href="/preferences/banks">Banks</a></li>
                          </ul>
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/terms" element={<TermsScreen />} />
                    <Route path="/privacy" element={<PrivacyScreen />} />
                    <Route path="/edit-profile" element={
                      <ProtectedRoute>
                        <EditProfileScreen />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </div>
              </DataProvider>
            </UserProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
