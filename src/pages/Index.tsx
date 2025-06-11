
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <span className="text-4xl">🐵</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 animate-fade-in">
            Welcome to <span className="text-green-600">MonkeyOffers</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 animate-fade-in">
            Discover amazing deals and save money with the smartest offer aggregator
          </p>
        </div>
        
        <div className="space-y-4 animate-fade-up">
          <Link to="/splash">
            <Button size="lg" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Already have an account? Sign In
              </Button>
            </Link>
            
            <Link to="/admin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50">
                <Shield className="mr-2 h-4 w-4" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">🎯 Smart Deals</h3>
            <p className="text-gray-600">AI-powered deal discovery tailored to your preferences</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">💰 Save Money</h3>
            <p className="text-gray-600">Compare prices and find the best offers across platforms</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">⚡ Real-time</h3>
            <p className="text-gray-600">Get instant notifications for flash deals and limited offers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
