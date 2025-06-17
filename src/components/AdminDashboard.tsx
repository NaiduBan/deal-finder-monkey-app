
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  FolderOpen, 
  Heart, 
  TrendingUp,
  Activity,
  Eye,
  MousePointer,
  Share2,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardStats {
  total_users: number;
  total_offers: number;
  total_cuelink_offers: number;
  total_categories: number;
  total_saved_offers: number;
  active_users_today: number;
}

interface AnalyticsData {
  date: string;
  users: number;
  offers: number;
  saves: number;
  views: number;
}

interface PopularOffer {
  title: string;
  store: string;
  views: number;
  saves: number;
  clicks: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [popularOffers, setPopularOffers] = useState<PopularOffer[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchAnalytics(),
      fetchPopularOffers()
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      
      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Generate mock analytics data for the past 7 days
      const mockData: AnalyticsData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 100) + 50,
          offers: Math.floor(Math.random() * 20) + 10,
          saves: Math.floor(Math.random() * 200) + 100,
          views: Math.floor(Math.random() * 1000) + 500
        });
      }
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPopularOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Offers_data')
        .select('title, store')
        .limit(5);

      if (error) {
        console.error('Error fetching popular offers:', error);
        return;
      }

      // Generate mock popularity data
      const mockPopular: PopularOffer[] = (data || []).map((offer, index) => ({
        title: offer.title || 'Untitled Offer',
        store: offer.store || 'Unknown Store',
        views: Math.floor(Math.random() * 5000) + 1000,
        saves: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 300) + 50
      }));

      setPopularOffers(mockPopular);
    } catch (error) {
      console.error('Error fetching popular offers:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'LMD Offers',
      value: stats?.total_offers || 0,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Cuelink Offers',
      value: stats?.total_cuelink_offers || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Categories',
      value: stats?.total_categories || 0,
      icon: FolderOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Saved Offers',
      value: stats?.total_saved_offers || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+25%',
      changeType: 'positive'
    },
    {
      title: 'Active Users Today',
      value: stats?.active_users_today || 0,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Total Views',
      value: 45623,
      icon: Eye,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Total Clicks',
      value: 12847,
      icon: MousePointer,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      change: '+22%',
      changeType: 'positive'
    }
  ];

  const categoryData = [
    { name: 'Fashion', value: 35, color: '#8884d8' },
    { name: 'Electronics', value: 28, color: '#82ca9d' },
    { name: 'Food', value: 20, color: '#ffc658' },
    { name: 'Travel', value: 10, color: '#ff7c7c' },
    { name: 'Others', value: 7, color: '#8dd1e1' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Real-time insights and system analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </div>
                  <Badge 
                    variant={card.changeType === 'positive' ? 'default' : 'secondary'}
                    className={`${
                      card.changeType === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {card.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="offers">Popular Offers</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saves" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Offers by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="offers" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="saves" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="views" stroke="#ff7c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularOffers.map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{offer.title}</h4>
                      <p className="text-sm text-gray-600">{offer.store}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>{offer.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{offer.saves.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="h-4 w-4 text-green-500" />
                        <span>{offer.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">User Growth</p>
                    <p className="text-sm text-gray-600">25% increase in new user registrations this week</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Engagement Rate</p>
                    <p className="text-sm text-gray-600">Fashion category shows highest user engagement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Peak Hours</p>
                    <p className="text-sm text-gray-600">Most activity between 6-9 PM daily</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Optimize Mobile Experience</p>
                    <p className="text-sm text-gray-600">70% of users access via mobile devices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Expand Electronics Category</p>
                    <p className="text-sm text-gray-600">High demand but limited offer coverage</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Weekend Promotions</p>
                    <p className="text-sm text-gray-600">Consider special weekend offer campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
