
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { 
  ShoppingCart, Laptop, ShoppingBag, Home, 
  Globe, Heart, Sparkles, Plane, Coffee, 
  Shirt, Utensils, Tv, Gift
} from 'lucide-react';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  // Map category icons
  const getIcon = () => {
    switch (category.icon) {
      case 'shopping-cart':
        return <ShoppingCart className="w-6 h-6 text-monkeyGreen" />;
      case 'laptop':
        return <Laptop className="w-6 h-6 text-monkeyGreen" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-6 h-6 text-monkeyGreen" />;
      case 'home':
        return <Home className="w-6 h-6 text-monkeyGreen" />;
      case 'globe':
        return <Globe className="w-6 h-6 text-monkeyGreen" />;
      case 'heart':
        return <Heart className="w-6 h-6 text-monkeyGreen" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-monkeyGreen" />;
      case 'plane':
        return <Plane className="w-6 h-6 text-monkeyGreen" />;
      case 'coffee':
        return <Coffee className="w-6 h-6 text-monkeyGreen" />;
      case 'shirt':
        return <Shirt className="w-6 h-6 text-monkeyGreen" />;
      case 'utensils':
        return <Utensils className="w-6 h-6 text-monkeyGreen" />;
      case 'tv':
        return <Tv className="w-6 h-6 text-monkeyGreen" />;
      case 'gift':
        return <Gift className="w-6 h-6 text-monkeyGreen" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-monkeyGreen" />;
    }
  };

  // Generate a background color based on category id for visual appeal
  const getBgColor = () => {
    const colors = [
      'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 
      'bg-pink-50', 'bg-purple-50', 'bg-indigo-50',
      'bg-red-50', 'bg-orange-50', 'bg-teal-50'
    ];
    
    // Use a simple hash of the category id to pick a color
    const index = category.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-shrink-0">
      <div 
        className={`category-card w-20 h-20 flex flex-col items-center justify-center ${getBgColor()} rounded-lg p-2 border border-gray-100 shadow-sm`}
      >
        {getIcon()}
        <span className="text-xs text-center mt-1 font-medium line-clamp-1">{category.name}</span>
      </div>
    </div>
  );
};

export default CategoryItem;
