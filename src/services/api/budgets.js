/**
 * Budgets API
 */
import { supabase } from './apiClient';

export const budgetsAPI = {
  // Get all budgets
  getAll: async (userId, month) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month);
    if (error) throw error;
    return data;
  },

  // Set budget (upsert)
  setBudget: async (userId, category, amount, month) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: userId,
        category,
        amount,
        month
      }, {
        onConflict: 'user_id,category,month'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Set multiple budgets at once
  setBudgets: async (userId, budgets, month) => {
    const budgetData = Object.entries(budgets).map(([category, amount]) => ({
      user_id: userId,
      category,
      amount,
      month
    }));

    const { data, error } = await supabase
      .from('budgets')
      .upsert(budgetData, {
        onConflict: 'user_id,category,month'
      })
      .select();
    if (error) throw error;
    return data;
  },

  // Get monthly spending trend (last 6 months)
  getMonthlySpendingTrend: async (userId) => {
    const now = new Date();
    const months = [];

    // Generate last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${d.getMonth() + 1}월`
      });
    }

    // 6 months date range
    const startDate = `${months[0].yearMonth}-01`;
    const endDate = `${months[5].yearMonth}-31`;

    // Spending data (receipts)
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (receiptsError) throw receiptsError;

    // Budget data
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('month, amount')
      .eq('user_id', userId)
      .in('month', months.map(m => m.yearMonth));

    if (budgetsError) throw budgetsError;

    // Monthly aggregation
    const result = months.map(m => {
      const monthSpending = receiptsData
        ?.filter(r => r.date.startsWith(m.yearMonth))
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      const monthBudget = budgetsData
        ?.filter(b => b.month === m.yearMonth)
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      return {
        month: m.label,
        지출: monthSpending,
        예산: monthBudget
      };
    });

    return result;
  }
};
