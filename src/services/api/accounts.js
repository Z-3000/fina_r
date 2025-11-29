/**
 * Accounts & Banks API
 */
import { supabase } from './apiClient';

export const accountsAPI = {
  // Get linked accounts
  getLinkedAccounts: async (userId) => {
    const { data, error } = await supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  },

  // Link account
  linkAccount: async (accountData) => {
    const { data, error } = await supabase
      .from('linked_accounts')
      .insert({
        user_id: accountData.userId,
        type: accountData.type,
        bank: accountData.bank,
        name: accountData.name,
        last_digits: accountData.lastDigits,
        color: accountData.color,
        icon: accountData.icon
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Unlink account
  unlinkAccount: async (id) => {
    const { error } = await supabase
      .from('linked_accounts')
      .update({ status: 'inactive' })
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

export const banksAPI = {
  // Get available banks
  getAll: async () => {
    const { data, error } = await supabase
      .from('available_banks')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },
};
