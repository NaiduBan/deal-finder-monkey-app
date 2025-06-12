import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Plus, ExternalLink, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CuelinkOffer {
  Id: number;
  Title: string;
  Description: string;
  Terms: string;
  Merchant: string;
  Categories: string;
  'Campaign ID': number;
  'Campaign Name': string;
  'Image URL': string;
  'Offer Added At': string;
  'End Date': string;
  'Start Date': string;
  Status: string;
  URL: string;
  'Coupon Code': string;
}

const AdminCuelinkManager = () => {
  const [offers, setOffers] = useState<CuelinkOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<CuelinkOffer[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const filtered = offers.filter(offer =>
      offer.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Categories?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer['Coupon Code']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer['Campaign Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.Terms?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffers(filtered);
  }, [offers, searchTerm]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('Cuelink_data')
        .select('*')
        .order('Id', { ascending: false });

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
        .from('Cuelink_data')
        .upsert(offerData, { onConflict: 'Id' });

      if (error) {
        console.error('Error uploading Cuelink offers:', error);
        toast.error('Failed to upload Cuelink offers');
        return;
      }

      toast.success(`Successfully uploaded ${offerData.length} Cuelink offers`);
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
    const headers = [
      'Id', 'Title', 'Description', 'Terms', 'Merchant', 'Categories', 
      'Campaign ID', 'Campaign Name', 'Image URL', 'Offer Added At', 
      'End Date', 'Start Date', 'Status', 'URL', 'Coupon Code'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredOffers.map(offer => 
        headers.map(header => `"${(offer[header as keyof CuelinkOffer] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cuelink_offers_complete.csv';
    link.click();
    window.URL.revokeObjectURL(url);
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
              <CardTitle>Cuelink Offers Management - Complete Data</CardTitle>
              <p className="text-gray-600">Manage Cuelink affiliate offers with all available fields</p>
            </div>
            <Badge variant="secondary">{offers.length} Total Offers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Cuelink offers by any field..."
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

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[200px]">Terms</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Image URL</TableHead>
                  <TableHead>Offer Added At</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.Id}>
                    <TableCell className="font-medium">{offer.Id}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer.Title || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer.Description || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer.Terms || 'N/A'}</TableCell>
                    <TableCell>{offer.Merchant || 'N/A'}</TableCell>
                    <TableCell>{offer.Categories || 'N/A'}</TableCell>
                    <TableCell>{offer['Campaign ID'] || 'N/A'}</TableCell>
                    <TableCell>{offer['Campaign Name'] || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{offer['Image URL'] || 'N/A'}</TableCell>
                    <TableCell>{offer['Offer Added At'] || 'N/A'}</TableCell>
                    <TableCell>{offer['Start Date'] ? new Date(offer['Start Date']).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{offer['End Date'] ? new Date(offer['End Date']).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={offer.Status === 'active' ? 'default' : 'secondary'}>
                        {offer.Status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{offer.URL || 'N/A'}</TableCell>
                    <TableCell>
                      {offer['Coupon Code'] ? (
                        <Badge variant="outline">{offer['Coupon Code']}</Badge>
                      ) : (
                        'N/A'
                      )}
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
