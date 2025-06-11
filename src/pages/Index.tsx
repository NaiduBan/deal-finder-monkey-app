
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Check if trying to access admin
  if (window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  // Redirect to the splash screen by default
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to MonkeyOffers</h1>
        <p className="text-gray-600 max-w-md">Discover amazing deals and offers from top brands</p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/splash'}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Enter App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
