
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Components
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import CategoryScreen from "./components/CategoryScreen";
import OfferDetailScreen from "./components/OfferDetailScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import ProfileScreen from "./components/ProfileScreen";
import BottomNavigation from "./components/BottomNavigation";
import { useLocation } from "react-router-dom";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
                  <Route path="/category/:categoryId" element={<CategoryScreen />} />
                  <Route path="/offer/:offerId" element={<OfferDetailScreen />} />
                  <Route path="/chatbot" element={<ChatbotScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
