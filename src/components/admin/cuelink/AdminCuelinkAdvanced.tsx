
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Search, 
  Download, 
  Edit,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface CuelinkOffer {
  Id: number;
  Title: string;
  Description: string;
  'Image URL': string;
  Merchant: string;
  Categories: string;
  'Campaign Name': string;
  'End Date': string;
  Status: string;
  URL: string;
  'Coupon Code': string;
}

const AdminCuelinkAdvanced = () => {
  const [offers, setOffers] = useState<CuelinkOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<CuelinkOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(10);

  useEffect(() => {
    fetchCuelinkOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm]);

  const fetchCuelinkOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Cuelink_data')
        .select('*')
        .order('Id', { ascending: false });

      if (error) {
        toast.error('Failed to fetch Cuelink offers');
        return;
      }

      setOffers(data || []);
    } catch (error) {
      toast.error('An error occurred while fetching Cuelink offers');
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.Merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.Categories?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          <h1 className="text-3xl font-bold text-gray-900">Cuelink Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive Cuelink offers management and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Add Cuelink
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuelink Offers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(offers.filter(o => o.Merchant).map(o => o.Merchant)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Coupon Codes</CardTitle>
            <Badge className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.filter(o => o['Coupon Code']).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((offers.filter(o => o['Coupon Code']).length / offers.length) * 100).toFixed(1)}% have codes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(offers.filter(o => o.Categories).map(o => o.Categories)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Cuelink Offers Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offers by title, merchant, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Offers Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer Details</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageOffers().map((offer) => (
                  <TableRow key={offer.Id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        {offer['Image URL'] && (
                          <img 
                            src={offer['Image URL']} 
                            alt={offer.Title} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{offer.Title || 'Untitled Offer'}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {offer.Description || 'No description'}
                          </p>
                          {offer['Coupon Code'] && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Code: {offer['Coupon Code']}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{offer.Merchant || 'Unknown'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{offer.Categories || 'Uncategorized'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{offer['Campaign Name'] || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={offer.Status === 'active' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {offer.Status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {offer['End Date'] ? new Date(offer['End Date']).toLocaleDateString() : 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {offer.URL && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
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

export default AdminCuelinkAdvanced;
