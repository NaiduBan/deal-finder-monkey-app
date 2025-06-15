
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllBanners, createBanner, updateBanner, deleteBanner, uploadImage } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const AdminBannersManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['admin_banners'],
    queryFn: fetchAllBanners,
  });

  const createMutation = useMutation({
    mutationFn: (newData: any) => createBanner(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      toast({ title: "Success", description: "Banner created successfully." });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create banner: ${error.message}`, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Banner> }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      toast({ title: "Success", description: "Banner updated successfully." });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update banner: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_banners'] });
      toast({ title: "Success", description: "Banner deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete banner: ${error.message}`, variant: "destructive" });
    },
  });

  const handleOpenDialog = (banner: Banner | null = null) => {
    setSelectedBanner(banner);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading banners...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Banners</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Image URL</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners?.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell className="font-mono text-xs truncate max-w-[150px]" title={banner.id}>
                  {banner.id}
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell>
                  <a href={banner.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px] block" title={banner.image_url}>
                    {banner.image_url}
                  </a>
                </TableCell>
                <TableCell>
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px] block" title={banner.link}>
                    {banner.link}
                  </a>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(checked) => updateMutation.mutate({ id: banner.id, data: { is_active: checked } })}
                  />
                </TableCell>
                <TableCell>{new Date(banner.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(banner.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BannerFormDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        banner={selectedBanner} 
        onSave={(data) => {
          if (selectedBanner) {
            updateMutation.mutate({ id: selectedBanner.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />
    </div>
  );
};

const BannerFormDialog = ({ isOpen, setIsOpen, banner, onSave }: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  banner: Banner | null;
  onSave: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({ title: '', image_url: '', link: '', is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      if (banner) {
        setFormData({
          title: banner.title,
          image_url: banner.image_url,
          link: banner.link,
          is_active: banner.is_active,
        });
      } else {
        setFormData({ title: '', image_url: '', link: '', is_active: true });
      }
      setImageFile(null);
    }
  }, [banner, isOpen]);
  
  const handleImageUpload = async () => {
    if (!imageFile) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(imageFile);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      toast({ title: "Success", description: "Image uploaded successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Image upload failed.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, image_url, link, is_active } = formData;
    onSave({ title, image_url, link, is_active });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="link">Link URL</Label>
            <Input id="link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} required />
          </div>
          <div>
            <Label>Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Enter image URL or upload"
              />
            </div>
            <div className="text-sm text-gray-500 text-center my-2">OR</div>
            <div className="flex items-center space-x-2">
              <Input
                id="image-upload"
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
              <Button type="button" onClick={handleImageUpload} disabled={!imageFile || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {formData.image_url && <img src={formData.image_url} alt="preview" className="mt-2 h-20 w-40 object-cover rounded-md" />}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBannersManager;
