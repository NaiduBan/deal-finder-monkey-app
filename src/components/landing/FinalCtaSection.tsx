
import { Button } from '@/components/ui/button';

const FinalCtaSection = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="bg-gradient-to-r from-monkeyGreen to-green-600 rounded-2xl p-8 lg:p-12 text-center text-white animate-scale-in">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Ready to Start Saving?
        </h2>
        <p className="text-lg lg:text-xl mb-8 opacity-90">
          Join OffersMonkey today and never pay full price again!
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
  );
};
export default FinalCtaSection;
