
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CuelinkOffer {
  Id: number;
  Title: string;
  Merchant: string;
  Categories: string;
  Status: string;
  'Start Date': string;
  'End Date': string;
  'Coupon Code': string;
  URL: string;
}

const AdminCuelinkManager = () => {
  const [offers, setOffers] = useState<CuelinkOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<CuelinkOffer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const filtered = offers.filter(offer =>
      offer.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Categories?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffers(filtered);
  }, [offers, searchTerm]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Cuelink_data')
        .select('*')
        .order('Id', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching Cuelink offers:', error);
        toast.error('Failed to fetch Cuelink offers');
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching Cuelink offers');
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Cuelink offer?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Cuelink_data')
        .delete()
        .eq('Id', id);

      if (error) {
        console.error('Error deleting Cuelink offer:', error);
        toast.error('Failed to delete Cuelink offer');
        return;
      }

      setOffers(offers.filter(offer => offer.Id !== id));
      toast.success('Cuelink offer deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting the Cuelink offer');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Cuelink Offers...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cuelink Offers Management</CardTitle>
              <p className="text-gray-600">Manage Cuelink affiliate offers</p>
            </div>
            <Badge variant="secondary">{offers.length} Total Offers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Cuelink offers by title, merchant, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Offer</span>
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.Id}>
                    <TableCell className="font-medium">{offer.Id}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer.Title || 'N/A'}</TableCell>
                    <TableCell>{offer.Merchant || 'N/A'}</TableCell>
                    <TableCell>{offer.Categories || 'N/A'}</TableCell>
                    <TableCell>
                      {offer['Coupon Code'] ? (
                        <Badge variant="outline">{offer['Coupon Code']}</Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.Status === 'active' ? 'default' : 'secondary'}>
                        {offer.Status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer['End Date'] ? new Date(offer['End Date']).toLocaleDateString() : 'N/A'}
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
                          <Button variant="outline" size="sm" asChild>
                            <a href={offer.URL} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteOffer(offer.Id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No Cuelink offers found matching your search.' : 'No Cuelink offers found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCuelinkManager;
