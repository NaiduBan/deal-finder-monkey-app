
import { useState, useEffect } from 'react';
import { getLinkMyDealsSyncStatus, triggerLinkMyDealsSync } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for managing LinkMyDeals sync status and operations
 */
export const useSyncStatus = () => {
  const [lastSyncStatus, setLastSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get the sync status
  const getSyncStatus = async () => {
    const status = await getLinkMyDealsSyncStatus();
    setLastSyncStatus(status);
    return status;
  };

  // Function to manually trigger LinkMyDeals sync
  const syncFromLinkMyDeals = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      toast({
        title: "Syncing offers",
        description: "Fetching latest offers from LinkMyDeals...",
        variant: "default",
      });
      
      const success = await triggerLinkMyDealsSync();
      
      if (success) {
        toast({
          title: "Sync initiated",
          description: "LinkMyDeals sync job has been started. This may take a few minutes.",
          variant: "default",
        });
        
        // Start polling for status changes
        const maxPolls = 20; // Maximum number of polls (10 minutes)
        let polls = 0;
        
        const pollInterval = setInterval(async () => {
          polls++;
          const status = await getSyncStatus();
          
          if (status && status.last_sync_status === "success" && polls > 1) {
            clearInterval(pollInterval);
            toast({
              title: "Sync completed",
              description: "Successfully synchronized offers from LinkMyDeals",
              variant: "default",
            });
            setIsSyncing(false);
          } else if (status && status.last_sync_status === "error") {
            clearInterval(pollInterval);
            toast({
              title: "Sync failed",
              description: status.last_sync_message || "Failed to synchronize offers from LinkMyDeals",
              variant: "destructive",
            });
            setIsSyncing(false);
          } else if (polls >= maxPolls) {
            clearInterval(pollInterval);
            toast({
              title: "Sync timeout",
              description: "Sync is taking longer than expected. Check status later.",
              variant: "default",
            });
            setIsSyncing(false);
          }
        }, 30000); // Poll every 30 seconds

        return true;
      } else {
        toast({
          title: "Sync failed",
          description: "Failed to start LinkMyDeals sync",
          variant: "destructive",
        });
        setIsSyncing(false);
        return false;
      }
    } catch (err) {
      console.error('Error syncing from LinkMyDeals:', err);
      toast({
        title: "Error syncing",
        description: "An error occurred while syncing offers",
        variant: "destructive",
      });
      setIsSyncing(false);
      return false;
    }
  };

  // Initialize by getting the sync status
  useEffect(() => {
    getSyncStatus();
    
    // Set up interval to check for sync status changes
    const statusInterval = setInterval(() => {
      getSyncStatus();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  return {
    lastSyncStatus,
    syncFromLinkMyDeals,
    isSyncing
  };
};
