
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Offer } from '@/types';
import OfferCard from '@/components/OfferCard';
import { Toaster, toast } from 'sonner';
import { fetchOffers } from '@/services/mysqlService';
import { Skeleton } from '../ui/skeleton';

const fetchLatestOffers = async (): Promise<Offer[]> => {
    const offers = await fetchOffers();
    return offers.slice(0, 4); // Get latest 4 offers
};

const LiveDealsSection = () => {
    const { data: initialOffers, isLoading } = useQuery({
        queryKey: ['latest-mysql-offers'],
        queryFn: fetchLatestOffers,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    const [latestOffers, setLatestOffers] = useState<Offer[]>([]);

    useEffect(() => {
        if (initialOffers) {
            setLatestOffers(initialOffers);
            console.log('📊 Loaded latest offers from MySQL:', initialOffers.length);
        }
    }, [initialOffers]);

    // Note: Real-time updates would need to be implemented separately for MySQL
    // For now, we'll refresh every 5 minutes via React Query

    return (
        <div className="container mx-auto px-4 py-12 lg:py-16">
            <Toaster richColors position="top-center" />
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
                    🔥 Live Deals from MySQL
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Fresh deals from your MySQL database!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {isLoading && Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                      <Skeleton className="aspect-video w-full rounded-t-xl" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                ))}
                {!isLoading && latestOffers.map((offer) => (
                    <div className="animate-scale-in" key={offer.id}>
                      <OfferCard offer={offer} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveDealsSection;
