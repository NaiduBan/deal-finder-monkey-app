
// Utility functions for caching data to localStorage

/**
 * Try to get cached data from localStorage
 * @param key Cache key
 * @returns The cached data or null if the cache is invalid or expired
 */
export const getCachedData = (key: string) => {
  try {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Check if cache is less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving ${key} from cache:`, error);
    return null;
  }
};

/**
 * Save data to localStorage with a timestamp
 * @param key Cache key
 * @param data Data to cache
 */
export const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error(`Error saving ${key} to cache:`, error);
  }
};
