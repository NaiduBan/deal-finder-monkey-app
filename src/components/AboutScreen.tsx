
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Gift, Users, TrendingUp, Shield, Smartphone, Clock, Award, Zap } from "lucide-react";

const AboutScreen = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: "Location-Based Offers",
      description: "Discover amazing deals and exclusive offers based on your current location and nearby stores"
    },
    {
      icon: <Gift className="w-6 h-6 text-green-600" />,
      title: "Exclusive Deals",
      description: "Access premium offers from top brands, restaurants, and local businesses you won't find anywhere else"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "Personalized Experience",
      description: "Smart recommendations tailored to your preferences, shopping habits, and favorite categories"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Trending Offers",
      description: "Stay ahead with the latest trending deals, flash sales, and limited-time promotions"
    },
    {
      icon: <Star className="w-6 h-6 text-green-600" />,
      title: "Save & Organize",
      description: "Bookmark your favorite offers and organize them into custom lists for easy access later"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Secure & Trusted",
      description: "Your personal data and privacy are protected with bank-level security and encryption"
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "Real-Time Updates",
      description: "Get instant notifications about new deals, price drops, and expiring offers"
    },
    {
      icon: <Award className="w-6 h-6 text-green-600" />,
      title: "Rewards Program",
      description: "Earn points for every purchase and redeem them for exclusive discounts and prizes"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Users", description: "Active monthly users" },
    { number: "1,200+", label: "Partner Stores", description: "Verified merchants" },
    { number: "5M+", label: "Deals Saved", description: "Money saved by users" },
    { number: "4.8★", label: "User Rating", description: "App store rating" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular User",
      comment: "I've saved over $500 this month using OffersMonkey! The personalized recommendations are spot-on.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Food Enthusiast", 
      comment: "Best app for finding restaurant deals. The location-based offers are incredibly accurate.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Shopping Expert",
      comment: "Finally, an app that actually understands what I'm looking for. The interface is beautiful too!",
      rating: 5
    }
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6 animate-bounce">
          <img 
            src="/lovable-uploads/7af3a309-4731-4f26-b6d0-72b4fc7c953f.png" 
            alt="OffersMonkey Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
          Welcome to <span className="text-green-600">OffersMonkey</span>
        </h1>
        <p className="text-gray-600 text-xl px-4 mb-6 leading-relaxed">
          Your intelligent companion for discovering the best deals, offers, and savings opportunities near you
        </p>
        <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Smart • Fast • Personalized</span>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-8">
        {/* Stats Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800">Trusted by Thousands</CardTitle>
            <CardDescription>Join our growing community of smart shoppers</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stat.number}</div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Why Choose OffersMonkey?</CardTitle>
            <CardDescription>Discover what makes us the ultimate deals platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-md">
                <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-lg shadow-sm">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Testimonials Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">What Our Users Say</CardTitle>
            <CardDescription>Real stories from real users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <div className="flex items-center mb-2">
                  <div className="flex space-x-1 mr-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission Statement */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-50 leading-relaxed mb-4">
              At OffersMonkey, we believe everyone deserves access to the best deals and savings opportunities. 
              Our AI-powered platform learns your preferences to deliver personalized offers that truly matter to you. 
              We're not just about saving money – we're about enhancing your lifestyle through smart, curated deals.
            </p>
            <div className="flex items-center justify-center space-x-6 text-green-100">
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Mobile First</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Privacy Focused</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Community Driven</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 pt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start Saving?</h3>
            <p className="text-gray-600 mb-6">Join thousands of smart shoppers and unlock exclusive deals today!</p>
            
            <Button 
              onClick={handleLoginClick}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Get Started - Sign In Now
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              🎉 Special welcome offer: Get 500 bonus points on your first purchase!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
