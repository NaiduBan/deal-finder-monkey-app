
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, Tag, CreditCard, Check, Search, Star, Users, BarChart3, TrendingUp, Settings, Heart, ArrowRight, Sparkles, Target, Shield, FolderOpen } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

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
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200/60',
      description: 'Select stores where you love to shop for personalized offers and exclusive deals',
      route: '/preferences/stores',
      emoji: '🏪',
      stats: 'Most popular choice'
    },
    {
      id: 'brands',
      title: 'Favorite Brands',
      subtitle: 'Brands you trust and love',
      icon: Star,
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200/60',
      description: 'Choose your favorite brands to get targeted offers and exclusive brand deals',
      route: '/preferences/brands',
      emoji: '⭐',
      stats: 'Brand exclusive'
    },
    {
      id: 'categories',
      title: 'Preferred Categories',
      subtitle: 'Categories that interest you most',
      icon: FolderOpen,
      gradient: 'from-purple-400 via-pink-500 to-rose-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200/60',
      description: 'Choose your favorite categories to discover relevant offers and new products',
      route: '/preferences/categories',
      emoji: '📂',
      stats: 'Premium selection'
    },
    {
      id: 'banks',
      title: 'Banking Partners',
      subtitle: 'Your trusted financial institutions',
      icon: CreditCard,
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200/60',
      description: 'Add your banks to unlock exclusive credit card offers and cashback deals',
      route: '/preferences/banks',
      emoji: '🏦',
      stats: 'Exclusive rewards'
    }
  ];

  const filteredTypes = preferenceTypes.filter(type =>
    type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPreferences = Object.values(userPreferenceCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 ${isMobile ? 'pb-16 pt-4' : 'pt-24'}`}>
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 ${isMobile ? 'fixed top-0 left-0 right-0 z-10' : 'sticky top-20 z-10'}`}>
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>My Preferences</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Personalize your shopping experience • {totalPreferences} preferences set
                  </p>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Smart Matching</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Protected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6 mt-24' : 'p-8 space-y-8'}`}>
        {/* Stats Overview */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'} mb-6`}>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{totalPreferences}</p>
                <p className="text-xs text-gray-500">Total Set</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userPreferenceCounts.stores}</p>
                <p className="text-xs text-gray-500">Stores</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userPreferenceCounts.brands}</p>
                <p className="text-xs text-gray-500">Brands</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userPreferenceCounts.banks}</p>
                <p className="text-xs text-gray-500">Banks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search preference categories..."
            className={`pl-12 pr-4 ${isMobile ? 'py-4 text-base' : 'py-5 text-lg'} w-full border-gray-200/80 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Preference Type Cards */}
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6'}`}>
          {isLoading ? (
            <div className="flex justify-center py-12 col-span-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            filteredTypes.map((type) => {
              const IconComponent = type.icon;
              const selectedCount = userPreferenceCounts[type.id as keyof typeof userPreferenceCounts] || 0;

              return (
                <div
                  key={type.id}
                  className={`group bg-gradient-to-br ${type.bgGradient} rounded-3xl ${isMobile ? 'p-6' : 'p-8'} border-2 ${type.borderColor} hover:border-opacity-100 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2 shadow-lg hover:shadow-2xl backdrop-blur-sm bg-white/40`}
                  onClick={() => navigate(type.route)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`${isMobile ? 'text-3xl' : 'text-4xl'}`}>{type.emoji}</div>
                      <div>
                        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors`}>
                          {type.title}
                        </h3>
                        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} mb-2`}>{type.subtitle}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-700 border border-gray-200/50">
                          {type.stats}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl bg-gradient-to-r ${type.gradient} flex items-center justify-center text-white font-bold ${isMobile ? 'text-lg' : 'text-xl'} shadow-lg group-hover:shadow-xl transition-all`}>
                        {selectedCount}
                      </div>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>Selected</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
                      {type.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">{selectedCount} preferences</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                      <span className="text-sm font-medium">Manage</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredTypes.length === 0 && (
          <div className={`bg-white/70 backdrop-blur-sm ${isMobile ? 'p-8' : 'p-12'} rounded-3xl text-center shadow-sm border border-gray-100/80 max-w-2xl mx-auto`}>
            <div className={`p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} mx-auto mb-6 flex items-center justify-center`}>
              <Search className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-gray-600`} />
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-gray-900 mb-3`}>
              No preference categories found
            </h3>
            <p className={`text-gray-500 ${isMobile ? 'text-base' : 'text-lg'}`}>
              No categories match your search "{searchTerm}"
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-3xl ${isMobile ? 'p-6' : 'p-8'} border border-blue-100/60 max-w-5xl mx-auto`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Settings className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600`} />
            </div>
            <div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-blue-900`}>Quick Actions</h3>
              <p className="text-sm text-blue-700">Manage your preferences efficiently</p>
            </div>
          </div>
          <div className={`${isMobile ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}`}>
            <Button 
              variant="outline" 
              className={`${isMobile ? 'h-14' : 'h-16'} bg-white/80 hover:bg-white border-emerald-200/60 text-emerald-700 hover:text-emerald-800 ${isMobile ? 'text-base' : 'text-lg'} rounded-2xl shadow-sm hover:shadow-md transition-all group`}
              onClick={() => navigate('/preferences/stores')}
            >
              <Store className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-3 group-hover:scale-110 transition-transform`} />
              <div className="text-left">
                <div className="font-semibold">Stores</div>
                <div className="text-xs opacity-70">{userPreferenceCounts.stores} selected</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? 'h-14' : 'h-16'} bg-white/80 hover:bg-white border-blue-200/60 text-blue-700 hover:text-blue-800 ${isMobile ? 'text-base' : 'text-lg'} rounded-2xl shadow-sm hover:shadow-md transition-all group`}
              onClick={() => navigate('/preferences/brands')}
            >
              <Star className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-3 group-hover:scale-110 transition-transform`} />
              <div className="text-left">
                <div className="font-semibold">Brands</div>
                <div className="text-xs opacity-70">{userPreferenceCounts.brands} selected</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? 'h-14' : 'h-16'} bg-white/80 hover:bg-white border-purple-200/60 text-purple-700 hover:text-purple-800 ${isMobile ? 'text-base' : 'text-lg'} rounded-2xl shadow-sm hover:shadow-md transition-all group`}
              onClick={() => navigate('/preferences/categories')}
            >
              <FolderOpen className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-3 group-hover:scale-110 transition-transform`} />
              <div className="text-left">
                <div className="font-semibold">Categories</div>
                <div className="text-xs opacity-70">{userPreferenceCounts.categories} selected</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? 'h-14' : 'h-16'} bg-white/80 hover:bg-white border-orange-200/60 text-orange-700 hover:text-orange-800 ${isMobile ? 'text-base' : 'text-lg'} rounded-2xl shadow-sm hover:shadow-md transition-all group`}
              onClick={() => navigate('/preferences/banks')}
            >
              <CreditCard className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-3 group-hover:scale-110 transition-transform`} />
              <div className="text-left">
                <div className="font-semibold">Banks</div>
                <div className="text-xs opacity-70">{userPreferenceCounts.banks} selected</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesScreen;
