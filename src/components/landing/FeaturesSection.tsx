
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Bell, Gift, Users, Zap, Target, Smartphone, Brain } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Discovery",
      description: "Smart algorithms find deals tailored to your preferences and shopping history",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Flash Deals",
      description: "Lightning-fast deals updated every hour with exclusive time-limited offers",
      color: "from-monkeyYellow to-yellow-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get instant alerts when your favorite brands or items go on sale",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Advanced filters to find exactly what you need at the best prices",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Gift,
      title: "Exclusive Rewards",
      description: "Earn points with every deal and unlock premium member-only discounts",
      color: "from-spring-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Share discoveries and get recommendations from fellow deal hunters",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: ShoppingBag,
      title: "Multi-Store Search",
      description: "Compare prices across thousands of retailers in one convenient place",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices with offline deal browsing",
      color: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-spring-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-monkeyYellow/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block bg-spring-green-100 text-spring-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            ✨ Powerful Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need to
            <span className="block bg-gradient-to-r from-spring-green-600 to-emerald-600 bg-clip-text text-transparent">
              Save More Money
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform combines cutting-edge technology with community insights 
            to deliver the ultimate money-saving experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-2 animate-fade-in overflow-hidden" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center relative">
                {/* Icon background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-lg`}></div>
                
                <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
                
                {/* Subtle hover effect line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-lg`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience all these features?
          </p>
          <button 
            onClick={() => window.location.href = '/splash'}
            className="bg-gradient-to-r from-spring-green-600 to-emerald-600 hover:from-spring-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
