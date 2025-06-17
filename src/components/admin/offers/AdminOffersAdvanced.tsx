
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';

interface Offer {
  lmd_id: number;
  title: string;
  description: string;
  store: string;
  categories: string;
  offer_value: string;
  status: string;
  start_date: string;
  end_date: string;
  featured: string;
  sponsored: boolean;
}

const AdminOffersAdvanced = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(10);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, filterStatus]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Offers_data')
        .select('*')
        .order('lmd_id', { ascending: false });

      if (error) {
        toast.error('Failed to fetch offers');
        return;
      }

      setOffers(data || []);
    } catch (error) {
      toast.error('An error occurred while fetching offers');
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.categories?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(offer => offer.status === filterStatus);
    }

    setFilteredOffers(filtered);
    setCurrentPage(1);
  };

  const getCurrentPageOffers = () => {
    const startIndex = (currentPage - 1) * offersPerPage;
    const endIndex = startIndex + offersPerPage;
    return filteredOffers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Offers Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive offer analytics and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offers.length}</div>
                <p className="text-xs text-muted-foreground">Active offers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Offers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {offers.filter(o => o.featured === 'true').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((offers.filter(o => o.featured === 'true').length / offers.length) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sponsored Offers</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {offers.filter(o => o.sponsored).length}
                </div>
                <p className="text-xs text-muted-foreground">Revenue generating</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25.4%</div>
                <p className="text-xs text-muted-foreground">Across all offers</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Offers Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search offers by title, store, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>

              {/* Offers Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer Details</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageOffers().map((offer) => (
                      <TableRow key={offer.lmd_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{offer.title || 'Untitled Offer'}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {offer.description || 'No description'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {offer.featured === 'true' && (
                                <Badge variant="default" className="text-xs">Featured</Badge>
                              )}
                              {offer.sponsored && (
                                <Badge variant="outline" className="text-xs">Sponsored</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{offer.store || 'Unknown'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{offer.categories || 'Uncategorized'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{offer.offer_value || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={offer.status === 'active' ? 'default' : 'outline'}
                            className="capitalize"
                          >
                            {offer.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>Start: {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : 'N/A'}</p>
                            <p>End: {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * offersPerPage) + 1} to {Math.min(currentPage * offersPerPage, filteredOffers.length)} of {filteredOffers.length} offers
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Offer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced offer analytics and performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detailed performance tracking and conversion metrics will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOffersAdvanced;
