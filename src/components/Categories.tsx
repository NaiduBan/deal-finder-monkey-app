
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Categories = () => {
  const { categories, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 text-xl">🏷️</span>
          </div>
          <h3 className="text-sm font-medium text-gray-800">{category.name}</h3>
        </Link>
      ))}
    </div>
  );
};

export default Categories;
