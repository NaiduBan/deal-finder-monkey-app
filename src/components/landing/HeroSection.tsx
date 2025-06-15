
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Smartphone, Laptop } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      <div className="text-center space-y-6 lg:space-y-8">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center animate-scale-in">
            <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey Logo" className="w-full h-full rounded-full shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-2">OffersMonkey</h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing deals and offers from top brands. Save money while shopping smart!
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
  );
};
export default HeroSection;
