
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Tag, CreditCard, Check, Search, Star, Users, BarChart3, TrendingUp, Settings, Heart } from 'lucide-react';
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
      title: 'Favorite Stores',
      subtitle: 'Your go-to shopping destinations',
      icon: Store,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Select stores where you love to shop',
      route: '/preferences/stores',
      emoji: '🏪'
    },
    {
      id: 'brands',
      title: 'Preferred Brands',
      subtitle: 'Brands you trust and love',
      icon: Star,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'Choose your favorite brands',
      route: '/preferences/brands',
      emoji: '⭐'
    },
    {
      id: 'categories',
      title: 'Interest Categories',
      subtitle: 'What you love to explore',
      icon: Tag,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Select categories that interest you',
      route: '/preferences/categories',
      emoji: '🏷️'
    },
    {
      id: 'banks',
      title: 'Banking Partners',
      subtitle: 'Your financial institutions',
      icon: CreditCard,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Add your banks for exclusive offers',
      route: '/preferences/banks',
      emoji: '🏦'
    }
  ];

  const filteredTypes = preferenceTypes.filter(type =>
    type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelected = Object.values(userPreferenceCounts).reduce((sum, count) => sum + count, 0);
  const totalAvailable = Object.values(availableCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Modern Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Preferences</h1>
                <p className="text-gray-600 text-sm">Personalize your shopping experience</p>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{totalSelected}</span>
              </div>
              <p className="text-xs text-green-600 text-center font-medium">Selected</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold text-blue-700">{totalAvailable}</span>
              </div>
              <p className="text-xs text-blue-600 text-center font-medium">Available</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-bold text-purple-700">{Math.round((totalSelected / Math.max(totalAvailable, 1)) * 100)}%</span>
              </div>
              <p className="text-xs text-purple-600 text-center font-medium">Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search preference types..."
            className="pl-12 pr-4 py-4 w-full border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Preference Type Cards */}
        <div className="space-y-4">
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
                  className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1"
                  onClick={() => navigate(type.route)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-4 ${type.bgColor} rounded-2xl border ${type.borderColor}`}>
                        <IconComponent className={`w-8 h-8 ${type.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">{type.emoji}</span>
                          <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{type.subtitle}</p>
                        <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="font-medium">{selectedCount} selected</span>
                          </span>
                          <span className="flex items-center space-x-1 text-blue-600">
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-medium">{availableCount} available</span>
                          </span>
                          <span className="flex items-center space-x-1 text-purple-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">{coverage}% coverage</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${type.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                        {selectedCount}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${type.gradient} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${coverage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{coverage}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredTypes.length === 0 && (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
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

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
              onClick={() => navigate('/preferences/stores')}
            >
              <Store className="w-4 h-4 mr-2" />
              Manage Stores
            </Button>
            <Button 
              variant="outline" 
              className="h-12 bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
              onClick={() => navigate('/preferences/brands')}
            >
              <Star className="w-4 h-4 mr-2" />
              Manage Brands
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesScreen;
