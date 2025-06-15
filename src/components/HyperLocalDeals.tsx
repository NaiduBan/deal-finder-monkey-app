import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Store, Clock, Phone, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Child component for deal cards
const DealCard: React.FC<DealCardProps> = React.memo(({ deal, callBusiness, getDirections }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="font-semibold">{deal.title}</h3>
        <p className="text-monkeyGreen font-medium">{deal.store}</p>
      </div>
      {deal.isGeoFenced && (
        <Badge className="bg-orange-100 text-orange-800 text-xs">
          Geo-Alert
        </Badge>
      )}
    </div>
    <div className="space-y-2 mb-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{deal.address}</span>
        <Badge variant="outline" className="text-xs">{deal.distance}</Badge>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{deal.rating}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">{deal.validUntil}</span>
        </div>
      </div>
    </div>
    <div className="flex space-x-2">
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
        className="flex-1 bg-monkeyGreen hover:bg-monkeyGreen/90"
      >
        <Navigation className="w-3 h-3 mr-1" />
        Directions
      </Button>
    </div>
  </div>
));

// Child component for business cards
const BusinessCard: React.FC<BusinessCardProps> = React.memo(({ business, callBusiness, getDirections }) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold">{business.name}</h3>
        <p className="text-sm text-gray-600">{business.category}</p>
      </div>
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{business.rating}</span>
      </div>
    </div>
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
      <MapPin className="w-4 h-4" />
      <span>{business.address}</span>
      <Badge variant="outline" className="text-xs">{business.distance}</Badge>
    </div>
    <div className="mb-3">
      <p className="text-sm font-medium mb-1">Current Offers:</p>
      <div className="space-y-1">
        {business.offers.map((offer, index) => (
          <div key={index} className="text-xs bg-monkeyGreen/10 text-monkeyGreen px-2 py-1 rounded">
            {offer}
          </div>
        ))}
      </div>
    </div>
    <div className="flex space-x-2">
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
        className="flex-1 bg-monkeyGreen hover:bg-monkeyGreen/90"
      >
        <Navigation className="w-3 h-3 mr-1" />
        Visit
      </Button>
    </div>
  </div>
));

const HyperLocalDeals = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDeals, setNearbyDeals] = useState([]);
  const [localBusinesses, setLocalBusinesses] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useUser();

  // Mock local deals data
  const mockLocalDeals = [
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

  const mockLocalBusinesses = [
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

  // Memoize deal and business card lists, passing correct typing
  const DealList = useMemo(() => (
    nearbyDeals.map((deal: DealType) => (
      <DealCard 
        key={deal.id} 
        deal={deal} 
        callBusiness={callBusiness} 
        getDirections={getDirections} 
      />
    ))
  ), [nearbyDeals, callBusiness, getDirections]);

  const BusinessList = useMemo(() => (
    localBusinesses.map((business: BusinessType) => (
      <BusinessCard 
        key={business.id} 
        business={business}
        callBusiness={callBusiness}
        getDirections={getDirections}
      />
    ))
  ), [localBusinesses, callBusiness, getDirections]);

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'flex justify-center px-8 py-10 pt-20'}`}>
      <div className={`${isMobile ? '' : 'w-full max-w-6xl flex flex-col gap-8'}`}>
        {/* Header */}
        <div className={`${isMobile ? 'mb-6' : 'mb-8 flex items-center justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-monkeyGreen rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
                Local Deals
              </h1>
              <p className="text-gray-600">Discover deals near you</p>
            </div>
          </div>
          <Button 
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="bg-monkeyGreen hover:bg-monkeyGreen/90 mt-4 sm:mt-0"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoadingLocation ? 'Locating...' : 'Find Me'}
          </Button>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">{user.location}</span>
          {userLocation && (
            <Badge className="bg-green-100 text-green-800">Live Location</Badge>
          )}
        </div>
        {/* Main Grid for Desktop */}
        <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-8'}`}>
          {/* Nearby Deals */}
          <Card className={`${isMobile ? 'mb-6' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5" />
                <span>Nearby Deals</span>
                <Badge variant="secondary">{nearbyDeals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {DealList}
              </div>
            </CardContent>
          </Card>
          {/* Local Business Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5" />
                <span>Local Business Partners</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {BusinessList}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HyperLocalDeals;
