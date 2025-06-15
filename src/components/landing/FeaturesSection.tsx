
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Bell, Gift, Users } from 'lucide-react';

const FeaturesSection = () => {
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

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
          Why Choose OffersMonkey?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We make finding and saving on deals easier than ever with our intelligent platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
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
  );
};
export default FeaturesSection;
