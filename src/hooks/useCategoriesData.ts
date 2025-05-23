
import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { fetchCategories } from '@/services/supabaseService';
import { mockCategories } from '@/mockData';
import { getCachedData, saveToCache } from '@/utils/cacheUtils';

/**
 * Hook for managing categories data
 */
export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const cachedCategories = getCachedData('categories');
    return cachedCategories || [];
  });

  // Function to fetch categories data
  const fetchData = async () => {
    try {
      const categoriesData = await fetchCategories();
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        saveToCache('categories', categoriesData);
      } else {
        setCategories(mockCategories);
        saveToCache('categories', mockCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(mockCategories);
      saveToCache('categories', mockCategories);
    }
  };

  // Initialize by fetching data
  useEffect(() => {
    const cachedCategories = getCachedData('categories');
    
    if (cachedCategories) {
      setCategories(cachedCategories);
      
      // Still fetch fresh data in the background
      fetchData();
    } else {
      // No valid cached data, fetch from API
      fetchData();
    }
  }, []);

  return { categories };
};
