/**
 * Tax & Deduction API
 */
import { supabase } from './apiClient';
import taxCalculator from '../calculators';

export const deductionAPI = {
  // Get all deductions
  getAll: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('deduction_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year);
    if (error) throw error;
    return data;
  },

  // Update deduction
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('deduction_tracker')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Initialize deductions for new year
  initializeDeductions: async (userId, year) => {
    const defaultDeductions = [
      { category: 'medical', name: '의료비', max_deduction: 7000000, deduction_rate: 0.15, threshold: 1000000 },
      { category: 'education', name: '교육비', max_deduction: 3000000, deduction_rate: 0.15, threshold: 0 },
      { category: 'housing', name: '월세', max_deduction: 7500000, deduction_rate: 0.12, threshold: 0 },
      { category: 'donation', name: '기부금', max_deduction: 10000000, deduction_rate: 0.15, threshold: 0 },
      { category: 'pension', name: '연금저축', max_deduction: 4000000, deduction_rate: 0.15, threshold: 0 }
    ];

    const deductionData = defaultDeductions.map(d => ({
      user_id: userId,
      year,
      ...d
    }));

    const { data, error } = await supabase
      .from('deduction_tracker')
      .upsert(deductionData, {
        onConflict: 'user_id,category,year'
      })
      .select();
    if (error) throw error;
    return data;
  }
};

export const taxAPI = {
  // Get individual tax data
  getIndividualTax: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('individual_tax_data')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Get business tax data
  getBusinessTax: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('business_tax_data')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Update individual tax data
  updateIndividualTax: async (userId, year, month, data) => {
    const { data: result, error } = await supabase
      .from('individual_tax_data')
      .upsert({
        user_id: userId,
        year,
        month,
        ...data
      }, {
        onConflict: 'user_id,year,month'
      })
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  // Calculate tax health score
  calculateTaxHealthScore: async (userId) => {
    const deductions = await deductionAPI.getAll(userId);

    let score = 100;

    if (deductions.length > 0) {
      const deductionUsage = deductions.reduce((sum, item) => {
        const current = item.current_amount || 0;
        const max = item.max_deduction || 1;
        return sum + (max > 0 ? current / max : 0);
      }, 0) / deductions.length;
      score -= (1 - deductionUsage) * 20;

      const totalDocs = deductions.reduce((sum, item) => sum + (item.documents_count || 0), 0);
      if (totalDocs < 30) score -= 10;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  },

  // Tax calculator functions (linked to taxCalculator)
  calculateIndividualTax: (params) => {
    return taxCalculator.calculateIndividualTax(params);
  },

  calculateBusinessTax: (params) => {
    return taxCalculator.calculateBusinessTax(params);
  },

  calculateVAT: (params) => {
    return taxCalculator.calculateVAT(params);
  },

  predictMonthlyTax: (params) => {
    return taxCalculator.predictMonthlyTax(params);
  },

  calculatePotentialSavings: (params) => {
    return taxCalculator.calculatePotentialSavings(params);
  },

  getDeductionLimits: () => {
    return taxCalculator.getDeductionLimits();
  },

  calculateMedicalDeduction: (totalIncome, medicalExpenses, hasInfertility) => {
    return taxCalculator.calculateMedicalDeduction(totalIncome, medicalExpenses, hasInfertility);
  },

  calculateEducationDeduction: (educationExpenses) => {
    return taxCalculator.calculateEducationDeduction(educationExpenses);
  },

  calculateDonationDeduction: (donations, totalIncome) => {
    return taxCalculator.calculateDonationDeduction(donations, totalIncome);
  },

  calculatePensionDeduction: (pensionSavings, irpAmount, totalIncome) => {
    return taxCalculator.calculatePensionDeduction(pensionSavings, irpAmount, totalIncome);
  }
};
