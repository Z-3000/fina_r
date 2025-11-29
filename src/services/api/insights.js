/**
 * AI Insights API
 */
import { supabase } from './apiClient';

export const insightsAPI = {
  // Get all insights
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Create insight
  create: async (insightData) => {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insightData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Generate with AI (Edge Function call)
  generateWithAI: async (userId) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\s/g, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/\s/g, '');

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-ai-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI insight generation failed: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'AI insight generation failed');
    }

    return result.insights;
  }
};
