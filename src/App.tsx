
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
import SavedOffersScreen from "./components/SavedOffersScreen";
import PointsHistoryScreen from "./components/PointsHistoryScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import BottomNavigation from "./components/BottomNavigation";

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
  <UserProvider>
    <DataProvider>
      {children}
    </DataProvider>
  </UserProvider>
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
                      <Route path="/home" element={<HomeScreen />} />
                      <Route path="/saved" element={<SavedOffersScreen />} />
                      <Route path="/preferences" element={<Navigate to="/preferences/brands" replace />} />
                      <Route path="/preferences/:preferenceType" element={<PreferenceScreen />} />
                      <Route path="/category/:categoryId" element={<CategoryScreen />} />
                      <Route path="/offer/:offerId" element={<OfferDetailScreen />} />
                      <Route path="/chatbot" element={<ChatbotScreen />} />
                      <Route path="/profile" element={<ProfileScreen />} />
                      <Route path="/settings" element={<SettingsScreen />} />
                      <Route path="/points" element={<PointsHistoryScreen />} />
                      <Route path="/notifications" element={<NotificationsScreen />} />
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
