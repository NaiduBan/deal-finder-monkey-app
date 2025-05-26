
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BannerItem } from '@/types';

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sample banner data - in a real app this would come from an API
  const banners: BannerItem[] = [
    {
      id: '1',
      title: 'Special Offers for You',
      imageUrl: '/placeholder.svg',
      link: '/home'
    },
    {
      id: '2', 
      title: 'Exclusive Deals',
      imageUrl: '/placeholder.svg',
      link: '/home'
    },
    {
      id: '3',
      title: 'Limited Time Offers',
      imageUrl: '/placeholder.svg', 
      link: '/home'
    }
  ];

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden rounded-xl mx-4">
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
                className="w-full h-40 object-cover bg-gradient-to-r from-emerald-400 to-green-500"
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
