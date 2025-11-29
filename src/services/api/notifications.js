/**
 * Notifications API
 */
import { supabase } from './apiClient';

export const notificationsAPI = {
  // Get all notifications
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
};

export const notificationCenterAPI = {
  // Get all notifications
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notification_center')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notification_center')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notification_center')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
