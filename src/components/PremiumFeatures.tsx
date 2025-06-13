
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Zap, 
  Bell, 
  Clock, 
  Star, 
  Shield, 
  Headphones,
  TrendingUp,
  Gift,
  CreditCard,
  Target,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'alerts' | 'deals' | 'support' | 'analytics';
  isEnabled: boolean;
  premiumOnly: boolean;
}

interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  highlighted: boolean;
  savings: string;
}

const PremiumFeatures = () => {
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([
    {
      id: 'lightning-alerts',
      name: 'Lightning Deal Alerts',
      description: 'Get notified 30 seconds before lightning deals go live',
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      category: 'alerts',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'price-tracking',
      name: 'Advanced Price Tracking',
      description: 'Track unlimited products with historical price charts',
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      category: 'deals',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'concierge',
      name: 'Personal Deal Concierge',
      description: '1-on-1 deal finding service for specific items',
      icon: <Headphones className="w-5 h-5 text-purple-500" />,
      category: 'support',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'exclusive-access',
      name: 'Exclusive Brand Partnerships',
      description: 'Access to deals not available to regular users',
      icon: <Crown className="w-5 h-5 text-amber-500" />,
      category: 'deals',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'smart-notifications',
      name: 'Smart Notifications',
      description: 'AI-powered notifications based on your behavior',
      icon: <Bell className="w-5 h-5 text-green-500" />,
      category: 'alerts',
      isEnabled: true,
      premiumOnly: false
    },
    {
      id: 'priority-support',
      name: 'Priority Customer Support',
      description: '24/7 priority support with faster response times',
      icon: <Shield className="w-5 h-5 text-red-500" />,
      category: 'support',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'analytics',
      name: 'Savings Analytics',
      description: 'Detailed reports on your savings and shopping patterns',
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      category: 'analytics',
      isEnabled: false,
      premiumOnly: true
    },
    {
      id: 'early-access',
      name: 'Early Access to Sales',
      description: 'Get access to sales 1-2 hours before general public',
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      category: 'deals',
      isEnabled: false,
      premiumOnly: true
    }
  ]);

  const [premiumPlans] = useState<PremiumPlan[]>([
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: '₹199',
      duration: '/month',
      features: [
        'Lightning deal alerts',
        'Unlimited price tracking',
        'Personal deal concierge',
        'Exclusive brand partnerships',
        'Priority support',
        'Savings analytics dashboard',
        'Early access to sales',
        'Ad-free experience'
      ],
      highlighted: false,
      savings: ''
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: '₹1,999',
      duration: '/year',
      features: [
        'All monthly features',
        '50% higher cashback rates',
        'Free premium gift wrapping',
        'Exclusive member events',
        'Advanced AI recommendations',
        'Custom deal categories',
        'Priority customer service',
        'Money-back guarantee'
      ],
      highlighted: true,
      savings: 'Save ₹390'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Premium',
      price: '₹9,999',
      duration: 'one-time',
      features: [
        'All premium features forever',
        'Unlimited everything',
        'VIP customer status',
        'Beta feature access',
        'Exclusive community access',
        'Personal shopping assistant',
        'Custom deal alerts',
        'Lifetime updates'
      ],
      highlighted: false,
      savings: 'Best Value'
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const { session } = useAuth();

  const toggleFeature = (featureId: string) => {
    const feature = premiumFeatures.find(f => f.id === featureId);
    
    if (feature?.premiumOnly && currentPlan === 'free') {
      toast({
        title: "Premium Feature",
        description: "This feature requires a Premium subscription. Upgrade now to unlock!",
        variant: "destructive"
      });
      return;
    }

    setPremiumFeatures(prev => 
      prev.map(f => 
        f.id === featureId ? { ...f, isEnabled: !f.isEnabled } : f
      )
    );

    toast({
      title: feature?.isEnabled ? "Feature Disabled" : "Feature Enabled",
      description: `${feature?.name} has been ${feature?.isEnabled ? 'disabled' : 'enabled'}`,
    });
  };

  const handleUpgrade = (planId: string) => {
    // In a real app, this would integrate with payment gateway
    toast({
      title: "Redirecting to Payment",
      description: "You'll be redirected to complete your Premium upgrade...",
    });
    
    // Simulate upgrade
    setTimeout(() => {
      setCurrentPlan(planId);
      toast({
        title: "Welcome to Premium! 🎉",
        description: "All premium features are now unlocked for you!",
      });
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alerts': return <Bell className="w-4 h-4" />;
      case 'deals': return <Star className="w-4 h-4" />;
      case 'support': return <Headphones className="w-4 h-4" />;
      case 'analytics': return <Target className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const groupedFeatures = premiumFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PremiumFeature[]>);

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <Card className={`${currentPlan !== 'free' ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentPlan !== 'free' ? (
                <Crown className="w-6 h-6 text-amber-500" />
              ) : (
                <Users className="w-6 h-6 text-gray-500" />
              )}
              <div>
                <CardTitle className="text-lg">
                  {currentPlan === 'free' ? 'Free Plan' : 'Premium Plan'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {currentPlan === 'free' 
                    ? 'Upgrade to unlock premium features'
                    : 'Enjoying all premium benefits'
                  }
                </p>
              </div>
            </div>
            {currentPlan === 'free' && (
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Feature Categories */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Star className="w-6 h-6 text-monkeyGreen" />
          <span>Premium Features</span>
        </h2>

        {Object.entries(groupedFeatures).map(([category, features]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <CardTitle className="text-base capitalize">
                  {category.replace('-', ' ')} Features
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{feature.name}</span>
                        {feature.premiumOnly && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={feature.isEnabled}
                    onCheckedChange={() => toggleFeature(feature.id)}
                    disabled={feature.premiumOnly && currentPlan === 'free'}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Plans */}
      {currentPlan === 'free' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <span>Upgrade Plans</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.highlighted ? 'border-amber-500 scale-105' : ''}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-monkeyGreen">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">{plan.duration}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Star className="w-4 h-4 text-monkeyGreen fill-current" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.highlighted 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700' 
                      : 'bg-monkeyGreen hover:bg-green-700'
                    } text-white`}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plan.id === 'lifetime' ? 'Get Lifetime Access' : 'Start Free Trial'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    {plan.id !== 'lifetime' && '7-day free trial • Cancel anytime'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Premium Benefits Summary */}
      <Card className="bg-gradient-to-r from-monkeyGreen to-green-600 text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Crown className="w-12 h-12 mx-auto text-yellow-300" />
            <h3 className="text-xl font-bold">Why Go Premium?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm font-medium">Lightning Fast</p>
                <p className="text-xs opacity-90">Get deals before others</p>
              </div>
              <div className="text-center">
                <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm font-medium">Exclusive Offers</p>
                <p className="text-xs opacity-90">Members-only deals</p>
              </div>
              <div className="text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm font-medium">Higher Cashback</p>
                <p className="text-xs opacity-90">Up to 50% more cashback</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm font-medium">Priority Support</p>
                <p className="text-xs opacity-90">24/7 dedicated help</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumFeatures;
