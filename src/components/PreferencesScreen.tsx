
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Tag, CreditCard, Check, Plus, X, Search, Star, Users, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/use-mobile';

const PreferencesScreen = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { offers } = useData();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [userPreferenceCounts, setUserPreferenceCounts] = useState<{[key: string]: number}>({
    stores: 0,
    categories: 0,
    brands: 0,
    banks: 0
  });
  const [availableCounts, setAvailableCounts] = useState<{[key: string]: number}>({
    stores: 0,
    categories: 0,
    brands: 0,
    banks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Extract available options from offers data
  useEffect(() => {
    const extractCounts = () => {
      const storesSet = new Set<string>();
      const categoriesSet = new Set<string>();
      const brandsSet = new Set<string>();
      const banksSet = new Set<string>();

      offers.forEach(offer => {
        // Extract stores
        if (offer.store) {
          storesSet.add(offer.store.trim());
        }

        // Extract categories and brands from categories field
        if (offer.categories) {
          const cats = offer.categories.split(',');
          cats.forEach(cat => {
            const category = cat.trim();
            if (category) {
              categoriesSet.add(category);
              brandsSet.add(category); // Treating categories as brands for now
            }
          });
        }

        // Extract banks from text content with better detection
        const fullText = `${offer.title || ''} ${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
        
        // Enhanced bank detection
        const bankPatterns = [
          'hdfc', 'icici', 'sbi', 'state bank', 'axis', 'kotak', 'paytm', 'citi', 'citibank',
          'american express', 'amex', 'standard chartered', 'yes bank', 'indusind', 
          'bank of baroda', 'bob', 'canara', 'union bank', 'pnb', 'punjab national',
          'bank of india', 'central bank', 'indian bank', 'rbl', 'federal bank',
          'idfc', 'bandhan', 'dbs', 'hsbc', 'uco bank', 'indian overseas bank'
        ];
        
        bankPatterns.forEach(pattern => {
          if (fullText.includes(pattern)) {
            let bankName = pattern;
            // Normalize bank names
            if (pattern === 'hdfc') bankName = 'HDFC Bank';
            else if (pattern === 'icici') bankName = 'ICICI Bank';
            else if (pattern === 'sbi' || pattern === 'state bank') bankName = 'State Bank of India';
            else if (pattern === 'axis') bankName = 'Axis Bank';
            else if (pattern === 'kotak') bankName = 'Kotak Mahindra Bank';
            else if (pattern === 'paytm') bankName = 'Paytm Payments Bank';
            else if (pattern === 'citi' || pattern === 'citibank') bankName = 'Citi Bank';
            else if (pattern === 'american express' || pattern === 'amex') bankName = 'American Express';
            else if (pattern === 'standard chartered') bankName = 'Standard Chartered';
            else if (pattern === 'yes bank') bankName = 'YES Bank';
            else if (pattern === 'indusind') bankName = 'IndusInd Bank';
            else if (pattern === 'bank of baroda' || pattern === 'bob') bankName = 'Bank of Baroda';
            else if (pattern === 'canara') bankName = 'Canara Bank';
            else if (pattern === 'union bank') bankName = 'Union Bank of India';
            else if (pattern === 'pnb' || pattern === 'punjab national') bankName = 'Punjab National Bank';
            else if (pattern === 'bank of india') bankName = 'Bank of India';
            else if (pattern === 'central bank') bankName = 'Central Bank of India';
            else if (pattern === 'indian bank') bankName = 'Indian Bank';
            else if (pattern === 'rbl') bankName = 'RBL Bank';
            else if (pattern === 'federal bank') bankName = 'Federal Bank';
            else if (pattern === 'idfc') bankName = 'IDFC First Bank';
            else if (pattern === 'bandhan') bankName = 'Bandhan Bank';
            else if (pattern === 'dbs') bankName = 'DBS Bank';
            else if (pattern === 'hsbc') bankName = 'HSBC Bank';
            else if (pattern === 'uco bank') bankName = 'UCO Bank';
            else if (pattern === 'indian overseas bank') bankName = 'Indian Overseas Bank';
            
            banksSet.add(bankName);
          }
        });
      });

      setAvailableCounts({
        stores: storesSet.size,
        categories: categoriesSet.size,
        brands: brandsSet.size,
        banks: banksSet.size
      });
    };

    extractCounts();
  }, [offers]);

  // Load user preference counts
  useEffect(() => {
    const loadPreferenceCounts = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_type')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const counts = { stores: 0, categories: 0, brands: 0, banks: 0 };
        data?.forEach(pref => {
          if (counts[pref.preference_type as keyof typeof counts] !== undefined) {
            counts[pref.preference_type as keyof typeof counts]++;
          }
        });

        setUserPreferenceCounts(counts);
      } catch (error) {
        console.error('Error loading preference counts:', error);
        toast({
          title: "Error",
          description: "Failed to load preference counts",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferenceCounts();
  }, [session, toast]);

  // Real-time subscription for preference changes
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('user-preferences-overview')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          // Reload counts when preferences change
          const loadPreferenceCounts = async () => {
            try {
              const { data, error } = await supabase
                .from('user_preferences')
                .select('preference_type')
                .eq('user_id', session.user.id);

              if (error) throw error;

              const counts = { stores: 0, categories: 0, brands: 0, banks: 0 };
              data?.forEach(pref => {
                if (counts[pref.preference_type as keyof typeof counts] !== undefined) {
                  counts[pref.preference_type as keyof typeof counts]++;
                }
              });

              setUserPreferenceCounts(counts);
            } catch (error) {
              console.error('Error reloading preference counts:', error);
            }
          };

          loadPreferenceCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const preferenceTypes = [
    {
      id: 'stores',
      title: 'Stores',
      subtitle: 'Your favorite stores',
      icon: Store,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Select stores to get personalized offers',
      route: '/preferences/stores'
    },
    {
      id: 'brands',
      title: 'Brands',
      subtitle: 'Preferred brands',
      icon: Star,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Choose brands you love',
      route: '/preferences/brands'
    },
    {
      id: 'categories',
      title: 'Categories',
      subtitle: 'Favorite categories',
      icon: Tag,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Select your interest categories',
      route: '/preferences/categories'
    },
    {
      id: 'banks',
      title: 'Banks',
      subtitle: 'Your banks',
      icon: CreditCard,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Add your banks for credit card offers',
      route: '/preferences/banks'
    }
  ];

  const filteredTypes = preferenceTypes.filter(type =>
    type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelected = Object.values(userPreferenceCounts).reduce((sum, count) => sum + count, 0);
  const totalAvailable = Object.values(availableCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white sticky top-0 z-10 shadow-lg">
        <div className={`${isMobile ? 'py-6 px-4' : 'py-8 px-6 max-w-7xl mx-auto'}`}>
          <div className={`flex items-center space-x-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ChevronLeft className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className={`p-3 bg-white/20 rounded-full ${isMobile ? 'p-3' : 'p-4'}`}>
                <Users className={isMobile ? 'w-6 h-6' : 'w-7 h-7'} />
              </div>
              <div>
                <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Preferences</h1>
                <p className={`text-white/90 ${isMobile ? 'text-sm' : 'text-base'}`}>Customize your offer experience</p>
              </div>
            </div>
          </div>
          
          {/* Overall Stats */}
          <div className={`grid grid-cols-3 gap-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="text-center">
              <div className={`flex items-center justify-center space-x-1 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <Check className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                <p className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{totalSelected}</p>
              </div>
              <p className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Selected</p>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center space-x-1 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <BarChart3 className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                <p className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>{totalAvailable}</p>
              </div>
              <p className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>Available</p>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center space-x-1 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <TrendingUp className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                <p className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>{Math.round((totalSelected / Math.max(totalAvailable, 1)) * 100)}%</p>
              </div>
              <p className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6 max-w-7xl mx-auto'}`}>
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          <Input
            type="search"
            placeholder="Search preference types..."
            className={`border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${isMobile ? 'pl-11 pr-4 py-3' : 'pl-12 pr-5 py-4 text-base'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Preference Type Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {isLoading ? (
            <div className="flex justify-center py-12 col-span-full">
              <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`}></div>
            </div>
          ) : (
            filteredTypes.map((type) => {
              const IconComponent = type.icon;
              const selectedCount = userPreferenceCounts[type.id as keyof typeof userPreferenceCounts] || 0;
              const availableCount = availableCounts[type.id as keyof typeof availableCounts] || 0;
              const coverage = availableCount > 0 ? Math.round((selectedCount / availableCount) * 100) : 0;

              return (
                <div
                  key={type.id}
                  className={`bg-white rounded-xl shadow-md border-2 ${type.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${isMobile ? 'p-6' : 'p-8'}`}
                  onClick={() => navigate(type.route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`${type.bgColor} rounded-xl ${isMobile ? 'p-4' : 'p-5'}`}>
                        <IconComponent className={`text-gray-700 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-gray-900 mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>{type.title}</h3>
                        <p className={`text-gray-600 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>{type.description}</p>
                        <div className={`flex items-center space-x-4 text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                          <span className="flex items-center space-x-1">
                            <Check className={`text-green-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                            <span>{selectedCount} selected</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BarChart3 className={`text-blue-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                            <span>{availableCount} available</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className={`text-purple-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                            <span>{coverage}% coverage</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center text-white font-bold shadow-lg ${isMobile ? 'w-16 h-16 text-lg' : 'w-20 h-20 text-xl'}`}>
                        {selectedCount}
                      </div>
                      <div className={`bg-gray-200 rounded-full h-2 ${isMobile ? 'w-16' : 'w-20'}`}>
                        <div 
                          className={`bg-gradient-to-r ${type.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${coverage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredTypes.length === 0 && (
          <div className={`bg-white rounded-xl text-center shadow-sm border border-gray-100 ${isMobile ? 'p-8' : 'p-12'}`}>
            <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center ${isMobile ? 'w-16 h-16 p-4' : 'w-20 h-20 p-5'}`}>
              <Search className={`text-gray-600 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} />
            </div>
            <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              No preference types found
            </h3>
            <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
              No preference types match your search "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesScreen;
