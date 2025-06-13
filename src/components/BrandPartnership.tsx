
import React, { useState, useEffect } from 'react';
import { Building2, Target, TrendingUp, Users, Calendar, DollarSign, BarChart3, Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

const BrandPartnership = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [partnerBrands, setPartnerBrands] = useState([]);
  const isMobile = useIsMobile();

  // Mock data for brand partnerships
  useEffect(() => {
    const mockCampaigns = [
      {
        id: 1,
        brand: 'Samsung',
        campaign: 'Galaxy S24 Launch',
        status: 'active',
        budget: '₹50,00,000',
        clicks: 125000,
        conversions: 2500,
        revenue: '₹1,25,00,000',
        startDate: '2024-01-15',
        endDate: '2024-02-15'
      },
      {
        id: 2,
        brand: 'Nike',
        campaign: 'Air Max Collection',
        status: 'completed',
        budget: '₹30,00,000',
        clicks: 85000,
        conversions: 1800,
        revenue: '₹90,00,000',
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      },
      {
        id: 3,
        brand: 'OnePlus',
        campaign: 'OnePlus 12 Series',
        status: 'scheduled',
        budget: '₹40,00,000',
        clicks: 0,
        conversions: 0,
        revenue: '₹0',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }
    ];

    const mockPartnerBrands = [
      { id: 1, name: 'Samsung', logo: '/placeholder.svg', category: 'Electronics', tier: 'Premium' },
      { id: 2, name: 'Nike', logo: '/placeholder.svg', category: 'Fashion', tier: 'Premium' },
      { id: 3, name: 'OnePlus', logo: '/placeholder.svg', category: 'Electronics', tier: 'Gold' },
      { id: 4, name: 'Adidas', logo: '/placeholder.svg', category: 'Fashion', tier: 'Gold' },
      { id: 5, name: 'Apple', logo: '/placeholder.svg', category: 'Electronics', tier: 'Premium' }
    ];

    setCampaigns(mockCampaigns);
    setPartnerBrands(mockPartnerBrands);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹2.1Cr</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold">1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.slice(0, 3).map((campaign: any) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{campaign.campaign}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{campaign.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-monkeyGreen">{campaign.revenue}</p>
                  <p className="text-sm text-gray-600">{campaign.conversions} conversions</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BrandDirectory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Partner Brands</h2>
        <Button className="bg-monkeyGreen hover:bg-monkeyGreen/90">
          <Handshake className="w-4 h-4 mr-2" />
          Add New Partner
        </Button>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {partnerBrands.map((brand: any) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{brand.name}</h3>
                  <p className="text-sm text-gray-600">{brand.category}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Badge className={getTierColor(brand.tier)}>
                  {brand.tier} Partner
                </Badge>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CampaignManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaign Management</h2>
        <Button className="bg-monkeyGreen hover:bg-monkeyGreen/90">
          <Target className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardContent className="p-4">
              <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{campaign.campaign}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{campaign.brand}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {campaign.startDate} - {campaign.endDate}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {campaign.budget}
                    </span>
                  </div>
                </div>
                <div className={`${isMobile ? 'w-full' : 'text-right'}`}>
                  <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-semibold text-monkeyGreen">{campaign.revenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clicks</p>
                      <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversions</p>
                      <p className="font-semibold">{campaign.conversions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const PartnershipForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Become a Brand Partner</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <Input placeholder="Enter your company name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Input placeholder="e.g., Electronics, Fashion, etc." />
            </div>
          </div>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <Input type="email" placeholder="partnership@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input placeholder="+91 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Budget (Monthly)</label>
            <Input placeholder="₹1,00,000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Partnership Goals</label>
            <Textarea 
              placeholder="Describe your marketing objectives and what you hope to achieve through this partnership..."
              rows={4}
            />
          </div>
          <Button className="w-full bg-monkeyGreen hover:bg-monkeyGreen/90">
            Submit Partnership Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'max-w-6xl mx-auto p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-monkeyGreen rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brand Partnership Platform</h1>
            <p className="text-gray-600">Manage collaborations and sponsored campaigns</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'brands', label: 'Brands', icon: Building2 },
            { id: 'campaigns', label: 'Campaigns', icon: Target },
            { id: 'partnership', label: 'Partnership', icon: Handshake }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md flex-1 text-center ${
                  activeTab === tab.id
                    ? 'bg-monkeyGreen text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {!isMobile && <span className="text-sm">{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'brands' && <BrandDirectory />}
        {activeTab === 'campaigns' && <CampaignManager />}
        {activeTab === 'partnership' && <PartnershipForm />}
      </div>
    </div>
  );
};

export default BrandPartnership;
