import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBag, Bell, Gift, Users, TrendingUp, Smartphone, Laptop } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

const Index = () => {
  const isMobile = useIsMobile();

  // Check if trying to access admin
  if (window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect mobile users directly to the app
  useEffect(() => {
    if (isMobile) {
      window.location.href = '/splash';
    }
  }, [isMobile]);

  // Don't render anything for mobile users (they'll be redirected)
  if (isMobile) {
    return null;
  }
  
  const features = [
    {
      icon: ShoppingBag,
      title: "Curated Deals",
      description: "Hand-picked offers from top brands and retailers"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified when your favorite items go on sale"
    },
    {
      icon: Gift,
      title: "Exclusive Offers",
      description: "Access to member-only deals and discounts"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Share and discover deals with fellow bargain hunters"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "1M+", label: "Deals Found" },
    { number: "₹10Cr+", label: "Money Saved" },
    { number: "500+", label: "Partner Brands" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      text: "Found amazing deals on electronics. Saved over ₹5000 last month!",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      text: "The AI assistant helps me find exactly what I'm looking for.",
      rating: 5
    },
    {
      name: "Anita Patel",
      text: "Love the daily notifications. Never miss a good deal now!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="text-center space-y-6 lg:space-y-8">
          {/* Logo and Main Heading */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-monkeyGreen rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl lg:text-4xl">🐵</span>
            </div>
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2">OffersMonkey</h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing deals and offers from top brands. Save money while shopping smart!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/splash'}
              className="w-full sm:w-auto bg-monkeyGreen hover:bg-monkeyGreen/90 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Enter App
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto border-monkeyGreen text-monkeyGreen hover:bg-monkeyGreen hover:text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Laptop className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="bg-white/80">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              4.8/5 Rating
            </Badge>
            <Badge variant="secondary" className="bg-white/80">
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
              Trending #1
            </Badge>
            <Badge variant="secondary" className="bg-white/80">
              Free to Use
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/80 backdrop-blur-sm py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-4xl font-bold text-monkeyGreen mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose MonkeyOffers?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make finding and saving on deals easier than ever with our intelligent platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-monkeyGreen/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-monkeyGreen" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white/80 backdrop-blur-sm py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of happy savers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="bg-gradient-to-r from-monkeyGreen to-green-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90">
            Join MonkeyOffers today and never pay full price again!
          </p>
          <Button 
            onClick={() => window.location.href = '/splash'}
            className="bg-monkeyYellow text-black hover:bg-monkeyYellow/90 px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            Get Started Now - It's Free!
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🐵</span>
            <span className="text-xl font-bold">MonkeyOffers</span>
          </div>
          <p className="text-gray-400 mb-4">
            Your smart shopping companion for the best deals
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
            © 2024 MonkeyOffers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
