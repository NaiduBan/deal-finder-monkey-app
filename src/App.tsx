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
import { AdminProvider } from "./contexts/AdminContext";
import { ThemeProvider } from "./components/ThemeProvider";

// Components
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import CategoryScreen from "./components/CategoryScreen";
import OfferDetailScreen from "./components/OfferDetailScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import ProfileScreen from "./components/ProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
import PreferenceScreen from "./components/PreferenceScreen";
import PreferencesScreen from "./components/PreferencesScreen";
import SavedOffersScreen from "./components/SavedOffersScreen";
import PointsHistoryScreen from "./components/PointsHistoryScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import BottomNavigation from "./components/BottomNavigation";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPanel from "./components/AdminPanel";

// New feature components
import AIShoppingAssistant from "./components/AIShoppingAssistant";
import HyperLocalDeals from "./components/HyperLocalDeals";
import SocialShopping from "./components/SocialShopping";
import StoresScreen from "./components/StoresScreen";
import StoreDetailScreen from "./components/StoreDetailScreen";
import BrandsScreen from "./components/BrandsScreen";
import BrandDetailScreen from "./components/BrandDetailScreen";
import CategoriesScreen from "./components/CategoriesScreen";

const queryClient = new QueryClient();

// Layout component to conditionally render bottom navigation
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavigation = ['/splash', '/login', '/admin'].some(path => location.pathname.startsWith(path));
  
  return (
    <>
      {children}
      {!hideNavigation && <BottomNavigation />}
    </>
  );
};

// Providers wrapper component
const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light">
    <AdminProvider>
      <AuthProvider>
        <UserProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </UserProvider>
      </AuthProvider>
    </AdminProvider>
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
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              
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
                        path="/stores" 
                        element={
                          <ProtectedRoute>
                            <StoresScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/store/:storeName" 
                        element={
                          <ProtectedRoute>
                            <StoreDetailScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/brands" 
                        element={
                          <ProtectedRoute>
                            <BrandsScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/brand/:brandName" 
                        element={
                          <ProtectedRoute>
                            <BrandDetailScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/categories" 
                        element={
                          <ProtectedRoute>
                            <CategoriesScreen />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/ai-assistant" 
                        element={
                          <ProtectedRoute>
                            <AIShoppingAssistant />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/local-deals" 
                        element={
                          <ProtectedRoute>
                            <HyperLocalDeals />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/social-shopping" 
                        element={
                          <ProtectedRoute>
                            <SocialShopping />
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
