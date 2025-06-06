
import { supabase } from '@/integrations/supabase/client';

export interface DealAlert {
  id?: string;
  user_id: string;
  alert_type: 'price' | 'keyword' | 'store' | 'category';
  alert_value: string;
  target_price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const createAlert = async (alert: Omit<DealAlert, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('deal_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const getUserAlerts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('deal_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return [];
  }
};

export const updateAlert = async (alertId: string, updates: Partial<DealAlert>) => {
  try {
    const { data, error } = await supabase
      .from('deal_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId: string) => {
  try {
    const { error } = await supabase
      .from('deal_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    return false;
  }
};
