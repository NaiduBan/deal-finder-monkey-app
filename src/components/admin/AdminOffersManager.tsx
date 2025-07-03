
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Download, 
  ExternalLink,
  Calendar,
  Store,
  Tag,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Offer {
  lmd_id: number;
  title: string;
  description: string;
  store: string;
  categories: string;
  code: string;
  offer_value: string;
  start_date: string;
  end_date: string;
  status: string;
  url: string;
  image_url: string;
  featured: string;
  sponsored: boolean;
  banner: boolean;
  terms_and_conditions: string;
}

const AdminOffersManager = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const filtered = offers.filter(offer =>
      offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.categories?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffers(filtered);
  }, [offers, searchTerm]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Offers_data')
        .select('*')
        .order('lmd_id', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching offers:', error);
        toast.error('Failed to fetch offers');
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching offers');
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (lmdId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Offers_data')
        .update({ status: newStatus })
        .eq('lmd_id', lmdId);

      if (error) {
        console.error('Error updating offer:', error);
        toast.error('Failed to update offer');
        return;
      }

      setOffers(offers.map(offer => 
        offer.lmd_id === lmdId ? { ...offer, status: newStatus } : offer
      ));
      toast.success('Offer status updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating the offer');
    }
  };

  const toggleSponsored = async (lmdId: number, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('Offers_data')
        .update({ sponsored: !currentValue })
        .eq('lmd_id', lmdId);

      if (error) {
        console.error('Error updating sponsored status:', error);
        toast.error('Failed to update sponsored status');
        return;
      }

      setOffers(offers.map(offer => 
        offer.lmd_id === lmdId ? { ...offer, sponsored: !currentValue } : offer
      ));
      toast.success('Sponsored status updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating sponsored status');
    }
  };

  const toggleBanner = async (lmdId: number, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('Offers_data')
        .update({ banner: !currentValue })
        .eq('lmd_id', lmdId);

      if (error) {
        console.error('Error updating banner status:', error);
        toast.error('Failed to update banner status');
        return;
      }

      setOffers(offers.map(offer => 
        offer.lmd_id === lmdId ? { ...offer, banner: !currentValue } : offer
      ));
      toast.success('Banner status updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating banner status');
    }
  };

  const deleteOffer = async (lmdId: number) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Offers_data')
        .delete()
        .eq('lmd_id', lmdId);

      if (error) {
        console.error('Error deleting offer:', error);
        toast.error('Failed to delete offer');
        return;
      }

      setOffers(offers.filter(offer => offer.lmd_id !== lmdId));
      toast.success('Offer deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting the offer');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'lmd_id', 'title', 'store', 'categories', 'code', 'offer_value', 
      'start_date', 'end_date', 'status', 'featured', 'sponsored'
    ];
    
    const csvContent = [
      headers.join(','),
      ...offers.map(offer => 
        headers.map(header => {
          const value = offer[header as keyof Offer];
          if (value === null || value === undefined) return '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `offers_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Offers...</CardTitle>
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
              <CardTitle>LMD Offers Management</CardTitle>
              <p className="text-gray-600">Manage all offers from LinkMyDeals</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {offers.length} Total Offers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offers by title, store, category, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Offer</span>
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer Details</TableHead>
                  <TableHead>Store & Category</TableHead>
                  <TableHead>Value & Code</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
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
                          <p className="font-medium text-sm">{offer.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{offer.description}</p>
                          <p className="text-xs text-gray-400">ID: {offer.lmd_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Store className="h-3 w-3" />
                          <span className="text-sm font-medium">{offer.store}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {offer.categories}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-sm font-medium">{offer.offer_value}</span>
                        </div>
                        {offer.code && (
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <code className="text-xs bg-gray-100 px-1 rounded">{offer.code}</code>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {offer.start_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Start: {new Date(offer.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {offer.end_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>End: {new Date(offer.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={offer.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => updateOfferStatus(
                          offer.lmd_id, 
                          offer.status === 'active' ? 'inactive' : 'active'
                        )}
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {offer.featured === 'true' && (
                          <Badge variant="default" className="text-xs">Featured</Badge>
                        )}
                        <Badge 
                          variant={offer.sponsored ? "secondary" : "outline"} 
                          className="text-xs cursor-pointer"
                          onClick={() => toggleSponsored(offer.lmd_id, offer.sponsored)}
                        >
                          {offer.sponsored ? 'Sponsored' : 'Not Sponsored'}
                        </Badge>
                        <Badge 
                          variant={offer.banner ? "default" : "outline"} 
                          className="text-xs cursor-pointer"
                          onClick={() => toggleBanner(offer.lmd_id, offer.banner)}
                        >
                          {offer.banner ? 'Banner' : 'Not Banner'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOffer(offer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Offer Details</DialogTitle>
                            </DialogHeader>
                            {selectedOffer && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">Title</label>
                                    <p>{selectedOffer.title}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Store</label>
                                    <p>{selectedOffer.store}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Value</label>
                                    <p>{selectedOffer.offer_value}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Code</label>
                                    <p>{selectedOffer.code || 'No code'}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Description</label>
                                  <p>{selectedOffer.description}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Terms & Conditions</label>
                                  <p className="text-sm text-gray-600">{selectedOffer.terms_and_conditions}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {offer.url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(offer.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteOffer(offer.lmd_id)}
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
              {searchTerm ? 'No offers found matching your search.' : 'No offers found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOffersManager;
