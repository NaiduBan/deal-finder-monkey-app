
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gift, 
  Search, 
  Filter, 
  Download, 
  Edit,
  Trash2,
  Plus,
  Eye,
  ExternalLink,
  Calendar,
  Tag,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

interface Offer {
  lmd_id: number;
  store: string;
  sponsored: boolean;
  image_url: string;
  smartlink: string;
  url: string;
  publisher_exclusive: string;
  featured: string;
  categories: string;
  terms_and_conditions: string;
  code: string;
  description: string;
  title: string;
  long_offer: string;
  merchant_homepage: string;
  end_date: string;
  start_date: string;
  status: string;
  offer_value: string;
  offer: string;
  type: string;
}

const AdminOffersAdvanced = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(20);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, statusFilter, typeFilter]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Offers_data')
        .select('*')
        .order('lmd_id', { ascending: false });

      if (error) {
        toast.error('Failed to fetch offers');
        console.error('Error fetching offers:', error);
        return;
      }

      setOffers(data || []);
    } catch (error) {
      toast.error('An error occurred while fetching offers');
      console.error('Error:', error);
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
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.categories?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(offer => offer.type === typeFilter);
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

  const exportOffers = () => {
    const csv = [
      ['LMD ID', 'Title', 'Store', 'Type', 'Status', 'Offer Value', 'Categories', 'Start Date', 'End Date', 'Code', 'Featured', 'Sponsored'],
      ...filteredOffers.map(offer => [
        offer.lmd_id,
        offer.title || '',
        offer.store || '',
        offer.type || '',
        offer.status || '',
        offer.offer_value || '',
        offer.categories || '',
        offer.start_date || '',
        offer.end_date || '',
        offer.code || '',
        offer.featured || '',
        offer.sponsored ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'offers_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
          <p className="text-gray-600 mt-1">Manage all offers from LinkMyDeals platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={exportOffers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
            <p className="text-xs text-muted-foreground">All offers in database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Offers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o.featured === 'true').length}
            </div>
            <p className="text-xs text-muted-foreground">Featured offers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsored</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o.sponsored).length}
            </div>
            <p className="text-xs text-muted-foreground">Sponsored offers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Offers Database ({filteredOffers.length} offers)</span>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Offers Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer Details</TableHead>
                  <TableHead>Store & Category</TableHead>
                  <TableHead>Value & Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageOffers().map((offer) => (
                  <TableRow key={offer.lmd_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {offer.image_url && (
                          <img 
                            src={offer.image_url} 
                            alt={offer.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium line-clamp-2">{offer.title || 'No Title'}</p>
                          <p className="text-xs text-gray-500">ID: {offer.lmd_id}</p>
                          {offer.code && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Code: {offer.code}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.store || 'No Store'}</p>
                        <p className="text-sm text-gray-600">{offer.categories || 'No Category'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.offer_value || 'No Value'}</p>
                        <p className="text-sm text-gray-600">{offer.type || 'No Type'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">Start: {offer.start_date || 'Not set'}</p>
                        <p className="text-sm">End: {offer.end_date || 'Not set'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          offer.status === 'active' ? 'default' : 
                          offer.status === 'expired' ? 'destructive' : 'outline'
                        }
                      >
                        {offer.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {offer.featured === 'true' && (
                          <Badge variant="default" className="text-xs w-fit">Featured</Badge>
                        )}
                        {offer.sponsored && (
                          <Badge variant="secondary" className="text-xs w-fit">Sponsored</Badge>
                        )}
                        {offer.publisher_exclusive === 'true' && (
                          <Badge variant="outline" className="text-xs w-fit">Exclusive</Badge>
                        )}
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
                        {offer.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={offer.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
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
    </div>
  );
};

export default AdminOffersAdvanced;
