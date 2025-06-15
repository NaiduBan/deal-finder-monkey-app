
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const fetchStats = async () => {
    const { count: userCount, error: userError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (userError) console.error("Error fetching user count", userError);

    const { count: dealCount, error: dealError } = await supabase.from('Offers_data').select('*', { count: 'exact', head: true });
    if (dealError) console.error("Error fetching deal count", dealError);

    const formatCount = (count: number | null) => {
        if (count === null) return '0+';
        if (count > 1000000) return `${(count / 1000000).toFixed(1)}M+`;
        if (count > 1000) return `${(count / 1000).toFixed(0)}K+`;
        return `${count}+`;
    }

    return [
        { number: formatCount(userCount), label: "Active Users" },
        { number: formatCount(dealCount), label: "Deals Found" },
        { number: "₹10Cr+", label: "Money Saved" }, // Stays hardcoded as requested
        { number: "500+", label: "Partner Brands" } // Stays hardcoded
    ];
};

const StatsSection = () => {
    const { data: stats, isLoading } = useQuery({ queryKey: ['landingPageStats'], queryFn: fetchStats });

    return (
        <div className="bg-white/80 backdrop-blur-sm py-12 lg:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {isLoading && Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="text-2xl lg:text-4xl font-bold text-monkeyGreen mb-2">
                                <Skeleton className="h-10 w-24 mx-auto" />
                            </div>
                            <div className="text-sm lg:text-base text-gray-600">
                                <Skeleton className="h-6 w-32 mx-auto" />
                            </div>
                        </div>
                    ))}
                    {!isLoading && stats?.map((stat, index) => (
                        <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="text-2xl lg:text-4xl font-bold text-monkeyGreen mb-2">
                                {stat.number}
                            </div>
                            <div className="text-sm lg:text-base text-gray-600">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StatsSection;
