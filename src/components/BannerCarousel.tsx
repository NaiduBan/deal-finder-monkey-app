
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BannerItem } from '@/types';

interface BannerCarouselProps {
  banners?: BannerItem[];
}

const BannerCarousel = ({ banners = [] }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-monkeyGreen to-green-600 h-40 flex items-center justify-center">
        <div className="text-white text-center">
          <h3 className="text-xl font-bold mb-2">Welcome to OffersMonkey!</h3>
          <p className="text-white/90">Discover amazing deals and offers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <Link 
            key={banner.id} 
            to={banner.link}
            className="min-w-full w-full"
          >
            <div className="relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <h3 className="text-white font-semibold">{banner.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Indicators */}
      {banners.length > 1 && (
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
      )}
    </div>
  );
};

export default BannerCarousel;
