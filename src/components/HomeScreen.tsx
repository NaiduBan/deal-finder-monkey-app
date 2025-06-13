
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, AlertCircle, Bot, Users, Crown, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import OfferCard from './OfferCard';
import CategoryItem from './CategoryItem';
import BannerCarousel from './BannerCarousel';
import CuelinkOfferCard from './CuelinkOfferCard';
import { fetchCuelinkOffers } from '@/services/cuelinkService';
import { Category, Offer, CuelinkOffer } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import CuelinkPagination from './CuelinkPagination';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuelinkOffers, setCuelinkOffers] = useState<CuelinkOffer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isLoadingCuelink, setIsLoadingCuelink] = useState(false);
  const { user } = useUser();
  const { categories, offers, banners, isLoading: dataLoading } = useData();
  const isMobile = useIsMobile();

  // Load Cuelink offers
  useEffect(() => {
    const loadCuelinkOffers = async () => {
      setIsLoadingCuelink(true);
      try {
        const cuelinkData = await fetchCuelinkOffers();
        setCuelinkOffers(cuelinkData);
      } catch (error) {
        console.error('Error loading Cuelink offers:', error);
      } finally {
        setIsLoadingCuelink(false);
      }
    };

    loadCuelinkOffers();
  }, []);

  // Filter offers based on search query
  const filteredOffers = offers.filter((offer: Offer) =>
    offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.store?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCuelinkOffers = cuelinkOffers.filter((offer: CuelinkOffer) =>
    offer.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.Merchant?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for Cuelink offers
  const totalPages = Math.ceil(filteredCuelinkOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCuelinkOffers = filteredCuelinkOffers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-3 rounded mb-2"></div>
          <div className="bg-gray-200 h-3 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className={`bg-monkeyGreen text-white ${isMobile ? 'p-4 pt-6' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-monkeyYellow rounded-full flex items-center justify-center">
              <span className="text-2xl">🐵</span>
            </div>
            <h1 className="text-xl font-bold">OffersMonkey</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/notifications" className="relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Link>
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for deals, stores, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white text-gray-900"
          />
        </div>
      </div>

      {/* New Features Quick Access */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/assistant">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-gray-600">Voice deals & smart recommendations</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/local-deals">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MapPin className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Local Deals</h3>
                <p className="text-xs text-gray-600">Nearby stores & restaurants</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/social">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Social Shopping</h3>
                <p className="text-xs text-gray-600">Group buying & community</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/premium">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Premium</h3>
                <p className="text-xs text-gray-600">Exclusive deals & early access</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Brand Partnership Banner */}
        <Link to="/partnership">
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">Brand Partnership</h3>
                  <p className="text-sm text-purple-700">Collaborate with top brands & manage campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Banner Carousel */}
        {banners && banners.length > 0 && (
          <div className="mb-6">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {categories.map((category: Category) => (
                <Link key={category.id} to={`/category/${category.id}`}>
                  <CategoryItem category={category} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Offers Tabs */}
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local Offers</TabsTrigger>
            <TabsTrigger value="cuelink">
              Cuelink Offers
              {isLoadingCuelink && <span className="ml-2 text-xs">(Loading...)</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            {dataLoading ? (
              <LoadingSkeleton />
            ) : filteredOffers.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredOffers.map((offer: Offer) => (
                  <Link key={offer.id} to={`/offer/${offer.id}`}>
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No offers found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cuelink" className="space-y-4">
            {isLoadingCuelink ? (
              <LoadingSkeleton />
            ) : paginatedCuelinkOffers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCuelinkOffers.map((offer: CuelinkOffer) => (
                    <CuelinkOfferCard key={offer.Id} offer={offer} />
                  ))}
                </div>
                <CuelinkPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No Cuelink offers available</p>
                {searchQuery && (
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeScreen;
