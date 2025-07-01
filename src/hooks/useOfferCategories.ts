
import { useState, useEffect } from 'react';
import { Category, Offer } from '@/types';

export const useOfferCategories = (offers: Offer[], allCategories: Category[]) => {
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);

  // Extract categories from today's offers and filter out categories with no offers
  useEffect(() => {
    if (offers && offers.length > 0) {
      const categoryCount = new Map<string, number>();
      
      // Count offers per category
      offers.forEach(offer => {
        if (offer.category) {
          const categories = offer.category.split(',').map(cat => cat.trim());
          categories.forEach(cat => {
            if (cat) {
              categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            }
          });
        }
      });

      // Get top categories by offer count, filter out those with few offers
      const topCategoryTuples = Array.from(categoryCount.entries())
        .filter(([, count]) => count >= 3) // Only include categories that have at least 3 offers
        .sort(([, countA], [, countB]) => countB - countA) // Sort by offer count descending
        .slice(0, 8); // Limit to 8 most "used" categories

      // Map to Category objects
      const categoryObjects: Category[] = topCategoryTuples.map(([categoryName]) => {
          const matchingCategory = allCategories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase() ||
            c.id.toLowerCase() === categoryName.toLowerCase().replace(/\s+/g, '-')
          );

          if (matchingCategory) {
            return matchingCategory;
          }

          return {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            icon: getCategoryIcon(categoryName),
          };
        });

      console.log('Generated dynamic categories (top 8 by usage):', categoryObjects);
      setDynamicCategories(categoryObjects);
    } else {
      setDynamicCategories([]);
    }
  }, [offers, allCategories]);

  // Helper function to determine an appropriate icon based on the category name
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('electronics') || name.includes('tech')) return 'laptop';
    if (name.includes('fashion') || name.includes('clothing') || name.includes('apparel')) return 'shirt';
    if (name.includes('food') || name.includes('drink') || name.includes('restaurant')) return 'utensils';
    if (name.includes('home') || name.includes('furniture')) return 'home';
    if (name.includes('travel') || name.includes('flight')) return 'plane';
    if (name.includes('beauty') || name.includes('cosmetic')) return 'sparkles';
    if (name.includes('health') || name.includes('fitness')) return 'heart';
    if (name.includes('toy') || name.includes('kid')) return 'gift';
    
    return 'shopping-bag';
  };

  return {
    dynamicCategories
  };
};
