
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { UserProvider } from "@/contexts/UserContext";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import ProfileScreen from "./components/ProfileScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import SavedOffersScreen from "./components/SavedOffersScreen";
import PreferencesScreen from "./components/PreferencesScreen";
import PreferenceScreen from "./components/PreferenceScreen";
import SearchPreferencesScreen from "./components/SearchPreferencesScreen";
import OfferDetailScreen from "./components/OfferDetailScreen";
import CategoryScreen from "./components/CategoryScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import SettingsScreen from "./components/SettingsScreen";
import PointsHistoryScreen from "./components/PointsHistoryScreen";
import AdminPanel from "./components/AdminPanel";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <UserProvider>
              <DataProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/splash" element={<SplashScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminPanel />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/home"
                      element={
                        <ProtectedRoute>
                          <HomeScreen />
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
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <NotificationsScreen />
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
                      path="/preference/:type"
                      element={
                        <ProtectedRoute>
                          <PreferenceScreen />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/search-preferences"
                      element={
                        <ProtectedRoute>
                          <SearchPreferencesScreen />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/offer/:id"
                      element={
                        <ProtectedRoute>
                          <OfferDetailScreen />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/category/:categoryName"
                      element={
                        <ProtectedRoute>
                          <CategoryScreen />
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
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <SettingsScreen />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/points-history"
                      element={
                        <ProtectedRoute>
                          <PointsHistoryScreen />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* 404 page */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </BrowserRouter>
              </DataProvider>
            </UserProvider>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
