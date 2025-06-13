
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { DataProvider } from "@/contexts/DataContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

// Import all pages and components
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import HomeScreen from "@/components/HomeScreen";
import CategoryScreen from "@/components/CategoryScreen";
import OfferDetailScreen from "@/components/OfferDetailScreen";
import SavedOffersScreen from "@/components/SavedOffersScreen";
import ProfileScreen from "@/components/ProfileScreen";
import SettingsScreen from "@/components/SettingsScreen";
import NotificationsScreen from "@/components/NotificationsScreen";
import PreferencesScreen from "@/components/PreferencesScreen";
import SearchPreferencesScreen from "@/components/SearchPreferencesScreen";
import PointsHistoryScreen from "@/components/PointsHistoryScreen";
import ChatbotScreen from "@/components/ChatbotScreen";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";
import AIShoppingAssistant from "@/components/AIShoppingAssistant";
import HyperLocalDeals from "@/components/HyperLocalDeals";
import SocialShopping from "@/components/SocialShopping";
import PremiumSubscription from "@/components/PremiumSubscription";
import BrandPartnership from "@/components/BrandPartnership";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <UserProvider>
              <DataProvider>
                <AdminProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/splash" element={<SplashScreen />} />
                      <Route path="/login" element={<LoginScreen />} />
                      
                      {/* Protected routes */}
                      <Route path="/home" element={
                        <ProtectedRoute>
                          <div>
                            <HomeScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/category/:categoryId" element={
                        <ProtectedRoute>
                          <div>
                            <CategoryScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/offer/:offerId" element={
                        <ProtectedRoute>
                          <div>
                            <OfferDetailScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/saved" element={
                        <ProtectedRoute>
                          <div>
                            <SavedOffersScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <div>
                            <ProfileScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <div>
                            <SettingsScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/notifications" element={
                        <ProtectedRoute>
                          <div>
                            <NotificationsScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/preferences" element={
                        <ProtectedRoute>
                          <div>
                            <PreferencesScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/search-preferences" element={
                        <ProtectedRoute>
                          <div>
                            <SearchPreferencesScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/points" element={
                        <ProtectedRoute>
                          <div>
                            <PointsHistoryScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/chatbot" element={
                        <ProtectedRoute>
                          <div>
                            <ChatbotScreen />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />

                      {/* New feature routes */}
                      <Route path="/assistant" element={
                        <ProtectedRoute>
                          <div>
                            <AIShoppingAssistant />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/local-deals" element={
                        <ProtectedRoute>
                          <div>
                            <HyperLocalDeals />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/social" element={
                        <ProtectedRoute>
                          <div>
                            <SocialShopping />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />

                      <Route path="/premium" element={
                        <ProtectedRoute>
                          <div>
                            <PremiumSubscription />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />

                      <Route path="/partnership" element={
                        <ProtectedRoute>
                          <div>
                            <BrandPartnership />
                            <BottomNavigation />
                          </div>
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      } />
                      
                      {/* Fallback routes */}
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </div>
                </AdminProvider>
              </DataProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
