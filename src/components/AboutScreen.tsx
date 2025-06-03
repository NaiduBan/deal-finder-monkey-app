
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Gift, Users, TrendingUp, Shield } from "lucide-react";

const AboutScreen = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: "Location-Based Offers",
      description: "Discover deals and offers near your location"
    },
    {
      icon: <Gift className="w-6 h-6 text-green-600" />,
      title: "Exclusive Deals",
      description: "Access exclusive offers from top brands and stores"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "Personalized Experience",
      description: "Get recommendations based on your preferences"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Trending Offers",
      description: "Stay updated with the latest and hottest deals"
    },
    {
      icon: <Star className="w-6 h-6 text-green-600" />,
      title: "Save Favorites",
      description: "Save and organize your favorite offers"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Secure & Safe",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Partner Stores" },
    { number: "1M+", label: "Deals Saved" },
    { number: "95%", label: "User Satisfaction" }
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 animate-bounce">
          <img 
            src="/lovable-uploads/7af3a309-4731-4f26-b6d0-72b4fc7c953f.png" 
            alt="OffersMonkey Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to OffersMonkey</h1>
        <p className="text-gray-600 text-lg px-4">Your ultimate destination for discovering amazing deals and offers</p>
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* Stats Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">Why Choose OffersMonkey?</CardTitle>
            <CardDescription className="text-center">Discover what makes us the best deals platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">About Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center leading-relaxed">
              OffersMonkey is dedicated to connecting you with the best deals from your favorite brands and local stores. 
              Our smart recommendation system learns your preferences to deliver personalized offers that matter to you. 
              Join thousands of satisfied users who are already saving money with OffersMonkey!
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 pt-4">
          <Button 
            onClick={handleLoginClick}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform transition-transform hover:scale-105"
          >
            Get Started - Login Now
          </Button>
          <p className="text-sm text-gray-500">
            Join our community and start saving today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
