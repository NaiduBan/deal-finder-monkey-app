import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OfferCard from '@/components/OfferCard';

interface OfferMasonryGridProps {
  offers: any[];
}

export const OfferMasonryGrid = ({ offers }: OfferMasonryGridProps) => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 1024) setColumns(2);
      else if (width < 1280) setColumns(3);
      else if (width < 1536) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Create columns array
  const columnsArray = Array.from({ length: columns }, () => [] as any[]);

  // Distribute offers across columns
  offers.forEach((offer, index) => {
    columnsArray[index % columns].push(offer);
  });

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {columnsArray.map((columnOffers, columnIndex) => (
        <div key={columnIndex} className="space-y-6">
          {columnOffers.map((offer) => (
            <Link key={offer.id} to={`/offer/${offer.id}`} className="group block">
              <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:rotate-1">
                <OfferCard 
                  offer={offer} 
                  isMobile={false} 
                />
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};