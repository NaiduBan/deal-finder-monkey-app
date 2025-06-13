
import React, { useState, useEffect } from 'react';
import { Crown, Zap, Star, Gift, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const PremiumSubscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lightningDeals, setLightningDeals] = useState([]);
  const isMobile = useIsMobile();
  const { session } = useAuth();
  const { offers } = useData();

  // Subscription plans
  const plans = [
    {
      id: 'basic',
      name: 'Basic Premium',
      price: '₹99',
      period: '/month',
      features: [
        'Early access to lightning deals (30 minutes)',
        '2% exclusive cashback',
        'Priority customer support',
        'Ad-free experience'
      ],
      color: 'bg-blue-500',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Plus',
      price: '₹199',
      period: '/month',
      features: [
        'Early access to lightning deals (1 hour)',
        '5% exclusive cashback',
        'Personal deal concierge service',
        'Ad-free experience',
        'Custom deal alerts',
        'VIP customer support'
      ],
      color: 'bg-monkeyGreen',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '₹399',
      period: '/month',
      features: [
        'Early access to lightning deals (2 hours)',
        '10% exclusive cashback',
        'Dedicated deal concierge',
        'Ad-free experience',
        'Custom deal alerts',
        'VIP customer support',
        'Exclusive brand partnerships',
        'Personal shopping assistant'
      ],
      color: 'bg-purple-600',
      popular: false
    }
  ];

  // Mock lightning deals for premium users
  useEffect(() => {
    const mockLightningDeals = [
      {
        id: 'lightning-1',
        title: 'iPhone 15 Pro Max',
        originalPrice: 159900,
        salePrice: 134900,
        discount: 15,
        timeLeft: '2h 45m',
        store: 'Apple Store',
        image: '/placeholder.svg',
        premiumOnly: true
      },
      {
        id: 'lightning-2',
        title: 'Samsung Galaxy Watch Ultra',
        originalPrice: 59900,
        salePrice: 44900,
        discount: 25,
        timeLeft: '1h 20m',
        store: 'Samsung',
        image: '/placeholder.svg',
        premiumOnly: true
      }
    ];
    setLightningDeals(mockLightningDeals);
  }, []);

  const handleSubscribe = (planId: string) => {
    console.log('Subscribing to plan:', planId);
    // Here you would integrate with payment gateway
    setIsSubscribed(true);
    setSelectedPlan(planId);
  };

  const PlanCard = ({ plan }: { plan: any }) => (
    <Card className={`relative ${plan.popular ? 'ring-2 ring-monkeyGreen' : ''} hover:shadow-lg transition-shadow`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-monkeyGreen text-white px-3 py-1">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <div className={`w-12 h-12 mx-auto rounded-full ${plan.color} flex items-center justify-center mb-3`}>
          <Crown className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-gray-600 ml-1">{plan.period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={() => handleSubscribe(plan.id)}
          className={`w-full ${plan.popular ? 'bg-monkeyGreen hover:bg-monkeyGreen/90' : ''}`}
          variant={plan.popular ? 'default' : 'outline'}
        >
          {isSubscribed && selectedPlan === plan.id ? 'Current Plan' : 'Subscribe Now'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'max-w-6xl mx-auto p-6'}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-monkeyGreen rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Premium Subscription</h1>
            <p className="text-gray-600">Unlock exclusive deals and premium features</p>
          </div>
        </div>
      </div>

      {/* Premium Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Why Go Premium?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Deal Access</h3>
              <p className="text-sm text-gray-600">Get early access to flash sales before they go public</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Cashback</h3>
              <p className="text-sm text-gray-600">Higher cashback rates on all your purchases</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Personal Concierge</h3>
              <p className="text-sm text-gray-600">Dedicated support for finding the best deals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lightning Deals Preview */}
      {isSubscribed && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Premium Lightning Deals</span>
              <Badge variant="secondary">Early Access</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {lightningDeals.map((deal: any) => (
                <div key={deal.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{deal.title}</h3>
                    <Badge className="bg-red-500 text-white">{deal.discount}% OFF</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deal.store}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-lg font-bold text-monkeyGreen">₹{deal.salePrice.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹{deal.originalPrice.toLocaleString()}</span>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      ⏰ {deal.timeLeft}
                    </Badge>
                  </div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    Grab Deal Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h2>
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How does the personal concierge work?</h4>
              <p className="text-sm text-gray-600">Our deal experts will personally find and curate deals based on your preferences and shopping history.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What's the difference between plans?</h4>
              <p className="text-sm text-gray-600">Higher tier plans offer longer early access periods, higher cashback rates, and more personalized services.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumSubscription;
