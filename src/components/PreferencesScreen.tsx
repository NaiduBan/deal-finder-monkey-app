
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Tag, CreditCard, Check, Plus, X, Search, Star, Users, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const PreferencesScreen = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { offers } = useData();
  const navigate = useNavigate();
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
      const banksSet = new Set<string>();

      offers.forEach(offer => {
        // Extract stores
        if (offer.store) {
          storesSet.add(offer.store.trim());
        }

        // Extract categories (treating as brands)
        if (offer.categories) {
          const cats = offer.categories.split(',');
          cats.forEach(cat => {
            const category = cat.trim();
            if (category) {
              categoriesSet.add(category);
            }
          });
        }

        // Extract banks from text content
        const fullText = `${offer.description || ''} ${offer.termsAndConditions || ''} ${offer.longOffer || ''}`.toLowerCase();
        const bankKeywords = [
          'hdfc bank', 'icici bank', 'sbi', 'state bank of india', 'axis bank', 
          'kotak mahindra bank', 'paytm payments bank', 'citi bank', 'citibank',
          'american express', 'amex', 'standard chartered', 'yes bank', 
          'indusind bank', 'bank of baroda', 'bob', 'canara bank',
          'union bank', 'pnb', 'punjab national bank', 'bank of india', 
          'central bank', 'indian bank', 'rbl bank', 'federal bank'
        ];
        
        bankKeywords.forEach(bank => {
          if (fullText.includes(bank)) {
            const bankName = bank.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            banksSet.add(bankName);
          }
        });
      });

      setAvailableCounts({
        stores: storesSet.size,
        categories: categoriesSet.size,
        brands: categoriesSet.size, // Same as categories for now
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
    <div className="pb-16 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-6 px-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Preferences</h1>
              <p className="text-white/90 text-sm">Customize your offer experience</p>
            </div>
          </div>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Check className="w-4 h-4" />
              <p className="text-2xl font-bold">{totalSelected}</p>
            </div>
            <p className="text-xs text-white/80">Total Selected</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <BarChart3 className="w-4 h-4" />
              <p className="text-lg font-semibold">{totalAvailable}</p>
            </div>
            <p className="text-xs text-white/80">Available</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-lg font-semibold">{Math.round((totalSelected / Math.max(totalAvailable, 1)) * 100)}%</p>
            </div>
            <p className="text-xs text-white/80">Coverage</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search preference types..."
            className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Preference Type Cards */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
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
                  className={`bg-white rounded-xl p-6 shadow-md border-2 ${type.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]`}
                  onClick={() => navigate(type.route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 ${type.bgColor} rounded-xl`}>
                        <IconComponent className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{selectedCount} selected</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span>{availableCount} available</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span>{coverage}% coverage</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {selectedCount}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
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
          <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No preference types found
            </h3>
            <p className="text-gray-500">
              No preference types match your search "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesScreen;
