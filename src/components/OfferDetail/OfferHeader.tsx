
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const OfferHeader = () => {
  return (
    <div className="bg-spring-green-600 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
      <Link to="/home" className="hover:bg-white/10 p-2 rounded-full transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </Link>
      <h1 className="text-lg font-semibold">Offer Details</h1>
      <div className="w-10 h-10"></div> {/* Spacer */}
    </div>
  );
};

export default OfferHeader;
