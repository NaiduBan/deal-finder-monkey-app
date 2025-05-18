
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { ShoppingCart, Laptop, ShoppingBag, Home, Globe, Heart, Sparkles, Plane } from 'lucide-react';

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
      default:
        return <ShoppingBag className="w-6 h-6 text-monkeyGreen" />;
    }
  };

  return (
    <Link to={`/category/${category.id}`} className="flex-shrink-0">
      <div className="category-card w-16 min-w-16">
        {getIcon()}
        <span className="text-xs text-center">{category.name}</span>
      </div>
    </Link>
  );
};

export default CategoryItem;
