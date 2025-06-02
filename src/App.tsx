
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import './index.css';
import HomeScreen from '@/components/HomeScreen';
import CategoryScreen from '@/components/CategoryScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import PreferenceScreen from '@/components/PreferenceScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DataProvider } from '@/contexts/DataContext';
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
                    <Route path="/preferences/:type" element={
                      <ProtectedRoute>
                        <PreferenceScreen />
                      </ProtectedRoute>
                    } />
                    <Route path="/preferences" element={
                      <ProtectedRoute>
                        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-4">
                          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">Preferences</h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">Select a preference type:</p>
                            <div className="space-y-3">
                              <a href="/preferences/stores" className="block w-full text-left p-3 bg-green-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                <span className="text-green-700 dark:text-green-400 font-medium">Stores</span>
                              </a>
                              <a href="/preferences/brands" className="block w-full text-left p-3 bg-green-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                <span className="text-green-700 dark:text-green-400 font-medium">Brands</span>
                              </a>
                              <a href="/preferences/categories" className="block w-full text-left p-3 bg-green-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                <span className="text-green-700 dark:text-green-400 font-medium">Categories</span>
                              </a>
                              <a href="/preferences/banks" className="block w-full text-left p-3 bg-green-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                <span className="text-green-700 dark:text-green-400 font-medium">Banks</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </ProtectedRoute>
                    } />
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
