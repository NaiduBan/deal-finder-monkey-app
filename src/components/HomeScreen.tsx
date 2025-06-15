import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Store, Clock, Phone, Star, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';

// --- TypeScript interfaces ---
interface DealType {
  id: number;
  title: string;
  store: string;
  address: string;
  distance: string;
  rating: number;
  phone: string;
  validUntil: string;
  category: string;
  isGeoFenced: boolean;
}

interface BusinessType {
  id: number;
  name: string;
  category: string;
  address: string;
  distance: string;
  rating: number;
  phone: string;
  offers: string[];
}

interface DealCardProps {
  deal: DealType;
  callBusiness: (phone: string) => void;
  getDirections: (address: string) => void;
}

interface BusinessCardProps {
  business: BusinessType;
  callBusiness: (phone: string) => void;
  getDirections: (address: string) => void;
}

// --- Modern Deal Card
const DealCard: React.FC<DealCardProps> = React.memo(({ deal, callBusiness, getDirections }) => (
  <div className="rounded-2xl shadow-lg bg-white border border-gray-100 p-5 hover:shadow-xl transition-all flex flex-col gap-3">
    <div className="flex items-start justify-between mb-1">
      <div>
        <h3 className="font-bold text-base">{deal.title}</h3>
        <span className="text-monkeyGreen font-medium text-sm">{deal.store}</span>
      </div>
      {deal.isGeoFenced && (
        <Badge className="bg-orange-50 text-orange-700 text-xs">Geo-Alert</Badge>
      )}
    </div>
    <div className="flex items-center text-gray-500 gap-2 text-sm">
      <MapPin className="w-4 h-4" />
      <span className="truncate">{deal.address}</span>
      <Badge variant="outline" className="text-xs whitespace-nowrap">{deal.distance}</Badge>
    </div>
    <div className="flex items-center justify-between text-xs gap-6">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{deal.rating}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4 text-gray-400" />
        <span>{deal.validUntil}</span>
      </div>
    </div>
    <div className="flex flex-col gap-2 mt-1 sm:flex-row">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => callBusiness(deal.phone)}
        className="flex-1"
      >
        <Phone className="w-3 h-3 mr-1" />
        Call
      </Button>
      <Button 
        size="sm"
        onClick={() => getDirections(deal.address)}
        className="flex-1 bg-monkeyGreen hover:bg-monkeyGreen/90 text-white"
      >
        <Navigation className="w-3 h-3 mr-1" />
        Directions
      </Button>
    </div>
  </div>
));

// --- Modern Business Card
const BusinessCard: React.FC<BusinessCardProps> = React.memo(({ business, callBusiness, getDirections }) => (
  <div className="rounded-2xl shadow-lg bg-white border border-gray-100 p-5 hover:shadow-xl transition-all flex flex-col gap-3">
    <div className="flex items-start justify-between mb-1">
      <div>
        <h3 className="font-bold text-base">{business.name}</h3>
        <span className="text-gray-500 text-sm">{business.category}</span>
      </div>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{business.rating}</span>
      </div>
    </div>
    <div className="flex items-center text-gray-500 gap-2 text-sm truncate">
      <MapPin className="w-4 h-4" />
      <span>{business.address}</span>
      <Badge variant="outline" className="text-xs whitespace-nowrap">{business.distance}</Badge>
    </div>
    <div>
      <span className="text-xs font-semibold text-monkeyGreen">Current Offers:</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {business.offers.map((offer, i) => (
          <div key={i} className="px-2 py-1 rounded bg-green-50 text-monkeyGreen text-xs">{offer}</div>
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-2 mt-1 sm:flex-row">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => callBusiness(business.phone)}
        className="flex-1"
      >
        <Phone className="w-3 h-3 mr-1" />
        Call
      </Button>
      <Button 
        size="sm"
        onClick={() => getDirections(business.address)}
        className="flex-1 bg-monkeyGreen hover:bg-monkeyGreen/90 text-white"
      >
        <Navigation className="w-3 h-3 mr-1" />
        Visit
      </Button>
    </div>
  </div>
));

const HyperLocalDeals = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDeals, setNearbyDeals] = useState<DealType[]>([]);
  const [localBusinesses, setLocalBusinesses] = useState<BusinessType[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  // Tab state for mobile
  const [activeMobileTab, setActiveMobileTab] = useState<'deals' | 'business'>('deals');
  const isMobile = useIsMobile();
  const { user } = useUser();

  // --- mock data ---
  const mockLocalDeals: DealType[] = [
    {
      id: 1,
      title: "Flat 30% off on Pizza",
      store: "Pizza Hut",
      address: "MG Road, Near City Mall",
      distance: "0.5 km",
      rating: 4.2,
      phone: "+91 98765 43210",
      validUntil: "Today 11:59 PM",
      category: "Food & Dining",
      isGeoFenced: true
    },
    {
      id: 2,
      title: "Buy 1 Get 1 Free Coffee",
      store: "Cafe Coffee Day",
      address: "Brigade Road",
      distance: "1.2 km",
      rating: 4.0,
      phone: "+91 98765 43211",
      validUntil: "Tomorrow 6:00 PM",
      category: "Food & Dining",
      isGeoFenced: true
    },
    {
      id: 3,
      title: "20% off on Electronics",
      store: "Reliance Digital",
      address: "Forum Mall, Koramangala",
      distance: "2.1 km",
      rating: 4.5,
      phone: "+91 98765 43212",
      validUntil: "Week End",
      category: "Electronics",
      isGeoFenced: false
    }
  ];

  const mockLocalBusinesses: BusinessType[] = [
    {
      id: 1,
      name: "Rajesh Electronics",
      category: "Electronics",
      address: "Commercial Street",
      distance: "0.8 km",
      rating: 4.3,
      phone: "+91 98765 43213",
      offers: ["10% off on Mobile Accessories", "Free home delivery"]
    },
    {
      id: 2,
      name: "Anand Sweets",
      category: "Food",
      address: "Gandhi Bazaar",
      distance: "1.5 km",
      rating: 4.7,
      phone: "+91 98765 43214",
      offers: ["Special festival discount", "Bulk order discounts"]
    }
  ];

  useEffect(() => {
    setNearbyDeals(mockLocalDeals);
    setLocalBusinesses(mockLocalBusinesses);
    return () => {}; // Clean up if any
  }, []);

  // Memoized callbacks
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          console.log('Location updated, finding nearby deals...');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  const callBusiness = useCallback((phone) => {
    window.open(`tel:${phone}`);
  }, []);

  const getDirections = useCallback((address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }, []);

  const DealList = useMemo(() => (
    <div className={`${isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-6'}`}>
      {nearbyDeals.map((deal) => (
        <DealCard key={deal.id} deal={deal} callBusiness={callBusiness} getDirections={getDirections} />
      ))}
    </div>
  ), [nearbyDeals, callBusiness, getDirections, isMobile]);

  const BusinessList = useMemo(() => (
    <div className={`${isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-6'}`}>
      {localBusinesses.map((business) => (
        <BusinessCard key={business.id} business={business} callBusiness={callBusiness} getDirections={getDirections} />
      ))}
    </div>
  ), [localBusinesses, callBusiness, getDirections, isMobile]);

  // --- Layout ---
  return (
    <div className="bg-gradient-to-b from-monkeyBackground to-gray-50 min-h-screen w-full pt-20 pb-4 px-0 sm:px-0">
      {/* Header */}
      <section className="max-w-2xl mx-auto mt-0 mb-6 px-4 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full h-14 w-14 bg-monkeyGreen">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-1 tracking-tight">
              Discover Local Deals Near You
            </h1>
            <p className="text-gray-500 text-base">Curated just for your area</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button 
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="bg-monkeyGreen hover:bg-monkeyGreen/90 py-2 px-5 text-white rounded-xl shadow"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoadingLocation ? 'Locating...' : 'Use My Location'}
          </Button>
          <span className="flex items-center text-gray-600 text-sm gap-1 truncate">
            <MapPin className="w-4 h-4" />
            {user.location}
            {userLocation && (
              <Badge className="bg-green-100 text-green-700 ml-2">Live Location</Badge>
            )}
          </span>
        </div>
      </section>

      {/* Main Section - Responsive */}
      <main className="max-w-4xl w-full mx-auto px-2 sm:px-4">
        {isMobile ? (
          // --- Tabs on mobile ---
          <Tabs value={activeMobileTab} onValueChange={v => setActiveMobileTab(v as 'deals' | 'business')}>
            <TabsList className="flex w-full mb-4">
              <TabsTrigger value="deals" className="flex-1">
                <Store className="w-4 h-4 mr-2" /> Deals
              </TabsTrigger>
              <TabsTrigger value="business" className="flex-1">
                <Building2 className="w-4 h-4 mr-2" /> Partners
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deals">
              <Card className="p-0 bg-gray-50 border-none shadow-none">
                <CardHeader className="bg-white rounded-t-2xl border-b px-6 pt-6 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Store className="w-5 h-5" /> Nearby Deals
                    <Badge variant="secondary">{nearbyDeals.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-4 pb-6">
                  {DealList}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="business">
              <Card className="p-0 bg-gray-50 border-none shadow-none">
                <CardHeader className="bg-white rounded-t-2xl border-b px-6 pt-6 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Building2 className="w-5 h-5" /> Local Business Partners
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-4 pb-6">
                  {BusinessList}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // --- 2-column for desktop/tablet ---
          <div className="w-full flex flex-row gap-8">
            <section className="flex-1">
              <Card className="bg-gray-50">
                <CardHeader className="bg-white rounded-t-2xl border-b px-7 pt-7 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Store className="w-5 h-5" /> Nearby Deals
                    <Badge variant="secondary">{nearbyDeals.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-7 pt-5 pb-7">
                  {DealList}
                </CardContent>
              </Card>
            </section>
            <section className="flex-1">
              <Card className="bg-gray-50">
                <CardHeader className="bg-white rounded-t-2xl border-b px-7 pt-7 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Building2 className="w-5 h-5" /> Local Business Partners
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-7 pt-5 pb-7">
                  {BusinessList}
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default HyperLocalDeals;
