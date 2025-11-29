/**
 * Miscellaneous APIs
 * Events, Document Folders, Bank Dummy Transactions, Auto Transactions
 */
import { supabase } from './apiClient';

export const eventsAPI = {
  // Get active events
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // Get user events
  getUserEvents: async (userId) => {
    const { data, error } = await supabase
      .from('user_events')
      .select(`*, event:events(*)`)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // Join event
  joinEvent: async (userId, eventId) => {
    const { data, error } = await supabase
      .from('user_events')
      .insert({ user_id: userId, event_id: eventId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const documentFoldersAPI = {
  // Get user document folders
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('document_folders')
      .select('*')
      .eq('user_id', userId)
      .order('folder_type')
      .order('folder_name');
    if (error) throw error;

    // Group by folder type
    const grouped = {
      yearEnd: { name: '연말정산', count: 0, folders: [] },
      comprehensiveTax: { name: '종합소득세', count: 0, folders: [] },
      vat: { name: '부가가치세', count: 0, folders: [] },
    };

    data?.forEach(folder => {
      if (grouped[folder.folder_type]) {
        grouped[folder.folder_type].folders.push({
          name: folder.folder_name,
          count: folder.document_count,
          lastUpdated: folder.last_updated
        });
        grouped[folder.folder_type].count += folder.document_count;
      }
    });

    return grouped;
  },

  // Update document count
  updateCount: async (userId, folderType, folderName, count) => {
    const { data, error } = await supabase
      .from('document_folders')
      .upsert({
        user_id: userId,
        folder_type: folderType,
        folder_name: folderName,
        document_count: count,
        last_updated: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id,folder_type,folder_name' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const bankDummyTransactionsAPI = {
  // Get dummy transactions by bank
  getByBank: async (bankName) => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .eq('bank_name', bankName)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get default dummy transactions
  getDefault: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .eq('bank_name', '기본')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get bank list
  getBankList: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('bank_name')
      .eq('is_active', true);

    if (error) throw error;

    const uniqueBanks = [...new Set(data.map(d => d.bank_name))];
    return uniqueBanks.filter(b => b !== '기본');
  },

  // Get all transactions (for admin)
  getAll: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .order('bank_name')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },
};

export const autoTransactionsAPI = {
  // Get auto transactions (type = 'auto' or 'ocr')
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['auto', 'ocr'])
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Match transaction
  matchTransaction: async (id) => {
    const { data, error } = await supabase
      .from('receipts')
      .update({ type: 'matched' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
