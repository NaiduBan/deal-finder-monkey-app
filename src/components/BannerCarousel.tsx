
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BannerItem } from '@/types';

interface BannerCarouselProps {
  banners?: BannerItem[];
}

const BannerCarousel = ({ banners = [] }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default banners if none provided
  const defaultBanners: BannerItem[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
      title: 'Summer Sale - Up to 70% Off',
      link: '/deals'
    },
    {
      id: '2', 
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
      title: 'Electronics Mega Sale',
      link: '/category/electronics'
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
      title: 'Fashion Week Special',
      link: '/category/fashion'
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    if (displayBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === displayBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  if (!displayBanners.length) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((banner) => (
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
      {displayBanners.length > 1 && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {displayBanners.map((_, index) => (
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
