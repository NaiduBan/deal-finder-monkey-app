
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BannerItem } from '@/types';
import { getBanners } from '@/services/api';

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
