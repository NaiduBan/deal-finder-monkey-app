
import { Button } from '@/components/ui/button';
import { Smartphone, Star, Gift, Users } from 'lucide-react';

const FinalCtaSection = () => {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-spring-green-600 via-emerald-600 to-teal-600"></div>
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-monkeyYellow/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-8">
            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                Ready to Start Your
                <span className="block text-monkeyYellow">Savings Journey?</span>
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join over 1 million smart shoppers who never pay full price again. 
                Start discovering amazing deals today!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Star className="w-8 h-8 text-monkeyYellow mx-auto mb-2" />
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm text-white/80">App Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Users className="w-8 h-8 text-monkeyYellow mx-auto mb-2" />
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-sm text-white/80">Happy Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Gift className="w-8 h-8 text-monkeyYellow mx-auto mb-2" />
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-white/80">Active Deals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-monkeyYellow mx-auto mb-2">$</div>
                <div className="text-2xl font-bold">2M+</div>
                <div className="text-sm text-white/80">Total Saved</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/splash'}
                className="group bg-monkeyYellow hover:bg-monkeyYellow/90 text-black font-bold px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Smartphone className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Get Started - It's Free!
              </Button>
              <p className="text-sm text-white/70">
                No credit card required • Available on all devices • Instant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCtaSection;
