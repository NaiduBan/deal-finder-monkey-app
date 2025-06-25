
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Offer } from '@/types';
import OfferCard from '@/components/OfferCard';
import { Toaster, toast } from 'sonner';
import { fetchOffers } from '@/services/mysqlService';
import { testConnection } from '@/services/mysql/database';
import { Skeleton } from '../ui/skeleton';

const fetchLatestOffers = async (): Promise<Offer[]> => {
    console.log('🚀 LiveDealsSection: Fetching latest offers...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
        throw new Error('MySQL connection failed');
    }
    
    const offers = await fetchOffers();
    console.log(`📦 LiveDealsSection: Received ${offers.length} offers`);
    return offers.slice(0, 4); // Get latest 4 offers
};

const LiveDealsSection = () => {
    const { data: initialOffers, isLoading, error } = useQuery({
        queryKey: ['latest-mysql-offers'],
        queryFn: fetchLatestOffers,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
    
    const [latestOffers, setLatestOffers] = useState<Offer[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');

    useEffect(() => {
        // Test connection on component mount
        const checkConnection = async () => {
            try {
                const isConnected = await testConnection();
                setConnectionStatus(isConnected ? 'connected' : 'failed');
            } catch (error) {
                console.error('Connection test failed:', error);
                setConnectionStatus('failed');
            }
        };
        
        checkConnection();
    }, []);

    useEffect(() => {
        if (initialOffers) {
            setLatestOffers(initialOffers);
            console.log('📊 LiveDealsSection: Loaded latest offers from MySQL:', initialOffers.length);
            
            toast.success(`✅ Loaded ${initialOffers.length} offers from MySQL database!`);
        }
    }, [initialOffers]);

    useEffect(() => {
        if (error) {
            console.error('❌ LiveDealsSection error:', error);
            toast.error('Failed to load offers from MySQL database');
        }
    }, [error]);

    const getConnectionStatusDisplay = () => {
        switch (connectionStatus) {
            case 'testing':
                return '🔄 Testing MySQL connection...';
            case 'connected':
                return '✅ MySQL Connected';
            case 'failed':
                return '❌ MySQL Connection Failed';
            default:
                return '❓ Unknown Status';
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 lg:py-16">
            <Toaster richColors position="top-center" />
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
                    🔥 Live Deals from MySQL
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                    Fresh deals from your MySQL database!
                </p>
                <div className="text-sm font-medium p-2 rounded-lg bg-gray-100 inline-block">
                    {getConnectionStatusDisplay()}
                </div>
                {connectionStatus === 'connected' && latestOffers.length > 0 && (
                    <div className="text-sm text-green-600 mt-2">
                        📊 Showing {latestOffers.length} latest offers
                    </div>
                )}
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
                
                {!isLoading && error && (
                    <div className="col-span-full text-center py-8">
                        <div className="text-red-500 mb-4">❌ Failed to load offers</div>
                        <div className="text-sm text-gray-600">{error.message}</div>
                    </div>
                )}
                
                {!isLoading && !error && latestOffers.length === 0 && (
                    <div className="col-span-full text-center py-8">
                        <div className="text-gray-500 mb-2">📭 No offers found</div>
                        <div className="text-sm text-gray-400">Check your database connection and data</div>
                    </div>
                )}
                
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
