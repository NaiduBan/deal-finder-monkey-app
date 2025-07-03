
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BannerItem } from '@/types';
import { getBanners } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners, isLoading } = useQuery<BannerItem[]>({
    queryKey: ['banners'],
    queryFn: getBanners
  });

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === (banners?.length ?? 0) - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl h-40 bg-gray-200 animate-pulse"></div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full w-full relative">
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="w-full h-60 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-white text-2xl font-bold mb-2">{banner.title}</h2>
                <p className="text-white/90 text-sm mb-4">Limited time offer - Don't miss out!</p>
                <div className="flex gap-3">
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to={banner.link}>
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Link to={banner.link}>
                      Grab Deal
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-2 right-2 flex space-x-1">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
