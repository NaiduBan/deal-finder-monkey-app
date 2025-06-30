import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ShoppingBag, Bolt, Sparkles, ChevronRight, Star, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Skeleton } from "@/components/ui/skeleton"

interface Offer {
  id: string;
  title: string;
  store: string;
  category: string;
  image_url: string;
  discount: string;
  description: string;
  link: string;
  end_date: string;
}

const HomeScreen = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching offers from an API
      const mockOffers: Offer[] = [
        {
          id: '1',
          title: '50% off on all winter wear',
          store: 'FashionHub',
          category: 'Fashion',
          image_url: 'https://source.unsplash.com/400x300/?winterwear',
          discount: '50%',
          description: 'Get 50% off on all winter wear at FashionHub. Limited time offer!',
          link: '#',
          end_date: '2024-03-15',
        },
        {
          id: '2',
          title: 'Buy One Get One Free on Pizzas',
          store: 'PizzaDelight',
          category: 'Food',
          image_url: 'https://source.unsplash.com/400x300/?pizza',
          discount: 'BOGO',
          description: 'Buy one pizza and get one free at PizzaDelight. Offer valid on all pizzas.',
          link: '#',
          end_date: '2024-03-10',
        },
        {
          id: '3',
          title: 'Up to 70% off on Electronics',
          store: 'TechZone',
          category: 'Electronics',
          image_url: 'https://source.unsplash.com/400x300/?electronics',
          discount: '70%',
          description: 'Up to 70% off on a wide range of electronics at TechZone. Shop now!',
          link: '#',
          end_date: '2024-03-20',
        },
      ];
      setOffers(mockOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load offers.",
        variant: "destructive"
      });
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Simulate fetching categories from an API
      const mockCategories = ['Fashion', 'Food', 'Electronics', 'Home Decor', 'Travel'];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive"
      });
      setCategories([]);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      toast({
        title: "Search",
        description: `Searching for "${searchTerm}"...`,
      });
    } else {
      toast({
        title: "Search",
        description: "Please enter a search term.",
        variant: "warning"
      });
    }
  };

  const bannerImages = [
    'https://source.unsplash.com/800x200/?sale',
    'https://source.unsplash.com/800x200/?discount',
    'https://source.unsplash.com/800x200/?deals',
  ];

  const quickAccessItems = [
    { icon: MapPin, label: 'Nearby Deals', link: '/local-deals' },
    { icon: ShoppingBag, label: 'Shopping Assistant', link: '/ai-assistant' },
    { icon: Bolt, label: 'Today\'s Deals', link: '/home' },
    { icon: Sparkles, label: 'Trending Now', link: '/home' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 ${isMobile ? 'pt-16 pb-16' : 'pt-20'}`}>
      {/* Desktop Header */}
      {!isMobile && (
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/80 sticky top-0 z-10" style={{ top: isMobile ? '0' : '80px' }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">OffersMonkey</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isMobile ? 'p-4 space-y-6' : 'p-8 max-w-7xl mx-auto space-y-8'}`}>
        {/* Search Section */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search for offers, stores, and categories..."
              className={`pl-12 pr-4 ${isMobile ? 'py-3' : 'py-4'} w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white ${isMobile ? 'text-base' : 'text-lg'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
        </div>

        {/* Banner Carousel */}
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          {bannerImages.map((image, index) => (
            <SwiperSlide key={index}>
              <img src={image} alt={`Banner ${index + 1}`} className="w-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccessItems.map((item) => (
            <Link key={item.label} to={item.link}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-3 flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Today's Offers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Today's Offers</h2>
            <Link to="/home" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <Link key={offer.id} to={`/offer/${offer.id}`}>
                  <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
                    <img src={offer.image_url} alt={offer.title} className="w-full h-40 object-cover rounded-t-xl" />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{offer.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{offer.store} - {offer.category}</p>
                      <Badge className="bg-purple-100 text-purple-800 mt-2">{offer.discount} OFF</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Categories</h2>
            <Link to="/categories" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category} to={`/category/${category}`}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-3 flex flex-col items-center space-y-2">
                    <Store className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
