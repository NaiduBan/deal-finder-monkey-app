import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Offer } from '@/types';
import OfferCard from '@/components/OfferCard';
import { Toaster, toast } from 'sonner';
import { transformSupabaseOffer } from '@/utils/offer-transformer';
import { Skeleton } from '../ui/skeleton';

const fetchLatestOffers = async (): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from('Offers_data')
      .select('*')
      .order('lmd_id', { ascending: false })
      .limit(4);

    if (error) throw new Error(error.message);
    
    return data.map(transformSupabaseOffer);
};

const LiveDealsSection = () => {
    const { data: initialOffers, isLoading } = useQuery({
        queryKey: ['latest-offers'],
        queryFn: fetchLatestOffers,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    const [latestOffers, setLatestOffers] = useState<Offer[]>([]);

    useEffect(() => {
        if (initialOffers) {
            setLatestOffers(initialOffers);
        }
    }, [initialOffers]);

    useEffect(() => {
        const channel = supabase
            .channel('realtime-offers')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'Offers_data'
            }, (payload) => {
                const newOffer = transformSupabaseOffer(payload.new);
                toast.success(`New Deal: ${newOffer.title}`);
                setLatestOffers(prevOffers => [newOffer, ...prevOffers].slice(0, 4));
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.log('Real-time deal updates are live!');
              }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="container mx-auto px-4 py-12 lg:py-16">
            <Toaster richColors position="top-center" />
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
                    🔥 Live Deals
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Freshly baked deals, coming in hot!
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
