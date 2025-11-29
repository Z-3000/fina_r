/**
 * Receipts API
 */
import { supabase } from './apiClient';

export const receiptsAPI = {
  // Get all receipts
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Create receipt
  create: async (receiptData) => {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        user_id: receiptData.userId,
        date: receiptData.date,
        merchant: receiptData.merchant,
        category: receiptData.category,
        amount: receiptData.amount,
        tax: Math.floor(receiptData.amount * 0.1),
        type: receiptData.type || 'manual',
        ocr_confidence: receiptData.ocrConfidence,
        memo: receiptData.memo
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update receipt
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('receipts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete receipt
  delete: async (id) => {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Get monthly stats
  getMonthlyStats: async (userId, yearMonth) => {
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-31`;

    const { data, error } = await supabase
      .from('receipts')
      .select('category, amount, tax')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      totalSpent: 0,
      totalTax: 0,
      byCategory: {}
    };

    data.forEach(r => {
      stats.totalSpent += r.amount;
      stats.totalTax += r.tax;
      stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + r.amount;
    });

    return stats;
  }
};
