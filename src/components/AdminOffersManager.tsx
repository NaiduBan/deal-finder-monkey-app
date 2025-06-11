
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Plus, ExternalLink, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

interface LMDOffer {
  lmd_id: number;
  title: string;
  store: string;
  categories: string;
  status: string;
  start_date: string;
  end_date: string;
  offer_value: string;
  url: string;
  description: string;
  long_offer: string;
  code: string;
  image_url: string;
  type: string;
  smartlink: string;
  merchant_homepage: string;
  terms_and_conditions: string;
  featured: string;
  publisher_exclusive: string;
}

const AdminOffersManager = () => {
  const [offers, setOffers] = useState<LMDOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<LMDOffer[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const filtered = offers.filter(offer =>
      offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.categories?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffers(filtered);
  }, [offers, searchTerm]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Offers_data')
        .select('*')
        .order('lmd_id', { ascending: false });

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

  const deleteOffer = async (lmdId: number) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
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

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const offerData = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const offer: any = {};
          headers.forEach((header, index) => {
            offer[header] = values[index] || null;
          });
          offerData.push(offer);
        }
      }

      if (offerData.length === 0) {
        toast.error('No valid offer data found in CSV');
        return;
      }

      const { data, error } = await supabase
        .from('Offers_data')
        .upsert(offerData, { onConflict: 'lmd_id' });

      if (error) {
        console.error('Error uploading offers:', error);
        toast.error('Failed to upload offers');
        return;
      }

      toast.success(`Successfully uploaded ${offerData.length} offers`);
      fetchOffers();
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Error processing CSV file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['lmd_id', 'title', 'store', 'categories', 'status', 'offer_value', 'start_date', 'end_date', 'description', 'code', 'url'];
    const csvContent = [
      headers.join(','),
      ...filteredOffers.map(offer => 
        headers.map(header => `"${(offer[header as keyof LMDOffer] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lmd_offers.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading LMD Offers...</CardTitle>
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
              <p className="text-gray-600">Manage LinkMyDeals offers data</p>
            </div>
            <Badge variant="secondary">{offers.length} Total Offers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offers by title, store, category, description, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
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
                  <TableHead>Store</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.lmd_id}>
                    <TableCell className="font-medium">{offer.lmd_id}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer.title || 'N/A'}</TableCell>
                    <TableCell>{offer.store || 'N/A'}</TableCell>
                    <TableCell>{offer.categories || 'N/A'}</TableCell>
                    <TableCell>{offer.offer_value || 'N/A'}</TableCell>
                    <TableCell>
                      {offer.code ? (
                        <Badge variant="outline">{offer.code}</Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.featured === 'true' && (
                        <Badge variant="destructive">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell>{offer.type || 'N/A'}</TableCell>
                    <TableCell>
                      {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : 'N/A'}
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
