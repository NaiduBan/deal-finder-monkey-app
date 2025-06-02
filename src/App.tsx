
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider } from "./contexts/AuthContext";
import ThemeProvider from "./components/ThemeProvider";

// Components
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import CategoryScreen from "./components/CategoryScreen";
import OfferDetailScreen from "./components/OfferDetailScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
import PreferenceScreen from "./components/PreferenceScreen";
import PreferencesScreen from "./components/PreferencesScreen";
import SavedOffersScreen from "./components/SavedOffersScreen";
import PointsHistoryScreen from "./components/PointsHistoryScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import BottomNavigation from "./components/BottomNavigation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Layout component to conditionally render bottom navigation
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavigation = ['/splash', '/login'].includes(location.pathname);
  
  return (
    <>
      {children}
      {!hideNavigation && <BottomNavigation />}
    </>
  );
};

// Providers wrapper component
const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      <UserProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
);

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ProvidersWrapper>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="*" 
                element={
                  <AppLayout>
                    <Routes>
                      <Route path="/splash" element={<SplashScreen />} />
                      <Route path="/login" element={<LoginScreen />} />
                      <Route 
                        path="/home" 
                        element={
                          <ProtectedRoute>
                            <HomeScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/saved" 
                        element={
                          <ProtectedRoute>
                            <SavedOffersScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/preferences" 
                        element={
                          <ProtectedRoute>
                            <PreferencesScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/preferences/:type" 
                        element={
                          <ProtectedRoute>
                            <PreferenceScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/category/:categoryId" 
                        element={
                          <ProtectedRoute>
                            <CategoryScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/offer/:offerId" 
                        element={
                          <ProtectedRoute>
                            <OfferDetailScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/chatbot" 
                        element={
                          <ProtectedRoute>
                            <ChatbotScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <ProfileScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/edit-profile" 
                        element={
                          <ProtectedRoute>
                            <EditProfileScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <SettingsScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/points" 
                        element={
                          <ProtectedRoute>
                            <PointsHistoryScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/notifications" 
                        element={
                          <ProtectedRoute>
                            <NotificationsScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                } 
              />
            </Routes>
          </ProvidersWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
