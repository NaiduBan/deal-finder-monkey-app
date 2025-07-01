
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Smartphone, Laptop, Zap, Gift, Users, Target } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spring-green-500 to-spring-green-600 flex items-center justify-center shadow-lg">
              <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey" className="w-6 h-6 rounded-md" />
            </div>
            <span className="text-xl font-bold text-gray-900">OffersMonkey</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/splash'}
            className="bg-spring-green-600 hover:bg-spring-green-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Launch App
          </Button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="container mx-auto px-6 pt-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="animate-fade-in">
            <Badge className="bg-spring-green-100 text-spring-green-800 border-spring-green-200 px-4 py-2 text-sm font-medium">
              🎉 Now with AI-Powered Deal Discovery
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-spring-green-800 to-gray-900 bg-clip-text text-transparent leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-spring-green-600 to-emerald-600 bg-clip-text text-transparent">
                Deals & Offers
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join millions of smart shoppers who save money every day with our curated deals, 
              exclusive offers, and AI-powered recommendations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={() => window.location.href = '/splash'}
              className="group bg-gradient-to-r from-spring-green-600 to-emerald-600 hover:from-spring-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Smartphone className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Start Saving Now
              <Zap className="ml-2 h-5 w-5 text-monkeyYellow" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-spring-green-600 text-spring-green-700 hover:bg-spring-green-50 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Laptop className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">4.9/5 Rating</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-spring-green-600" />
                <span className="font-semibold text-gray-900">1M+ Users</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-monkeyYellow" />
                <span className="font-semibold text-gray-900">50K+ Deals</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-gray-900">$2M+ Saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-200/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature Preview Cards */}
                <div className="bg-gradient-to-br from-spring-green-50 to-emerald-50 rounded-2xl p-6 border border-spring-green-200/50">
                  <div className="w-12 h-12 bg-spring-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Flash Deals</h3>
                  <p className="text-sm text-gray-600">Lightning-fast deals updated hourly</p>
                </div>
                
                <div className="bg-gradient-to-br from-monkeyYellow/10 to-yellow-50 rounded-2xl p-6 border border-yellow-200/50">
                  <div className="w-12 h-12 bg-monkeyYellow rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Alerts</h3>
                  <p className="text-sm text-gray-600">AI-powered deal notifications</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-sm text-gray-600">Share and discover with others</p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-monkeyYellow rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-spring-green-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
