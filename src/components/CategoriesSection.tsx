
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryItem from './CategoryItem';
import { Category } from '@/types';

interface CategoriesSectionProps {
  isDataLoading: boolean;
  dynamicCategories: Category[];
  selectedCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
}

const CategoriesSection = ({ 
  isDataLoading, 
  dynamicCategories, 
  selectedCategory, 
  onCategoryClick 
}: CategoriesSectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Categories For You</h2>
        <Link to="/preferences/brands" className="text-spring-green-600 text-sm">
          Set preferences
        </Link>
      </div>
      
      {isDataLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spring-green-600"></div>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {dynamicCategories.length > 0 ? (
            dynamicCategories.map((category) => (
              <div 
                key={category.id} 
                onClick={() => onCategoryClick(category.id)}
                className={`cursor-pointer transition-transform duration-200 ${selectedCategory === category.id ? 'scale-110' : 'hover:scale-105'}`}
              >
                <CategoryItem category={category} />
                {selectedCategory === category.id && (
                  <div className="h-1 w-full bg-spring-green-600 rounded-full mt-1"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 py-2">No categories with sufficient offers available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;
