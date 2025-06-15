
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
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
    <div className="bg-white/80 backdrop-blur-sm py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of happy savers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow bg-white animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
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
  );
};
export default TestimonialsSection;
