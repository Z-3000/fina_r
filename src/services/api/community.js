/**
 * Community, Experts & Products API
 */
import { supabase } from './apiClient';

export const communityAPI = {
  // Get posts
  getPosts: async (limit = 10) => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  // Create post
  createPost: async (userId, title, content, authorName = '익명') => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        author_name: authorName,
        title,
        content
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Like post
  likePost: async (postId) => {
    const { data, error } = await supabase.rpc('increment_likes', { post_id: postId });
    if (error) throw error;
    return data;
  },
};

export const expertsAPI = {
  // Get all experts
  getAll: async () => {
    const { data, error } = await supabase
      .from('tax_experts')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });
    if (error) throw error;
    return data;
  },
};

export const productsAPI = {
  // Get financial products
  getAll: async (type = null) => {
    let query = supabase.from('financial_products').select('*').eq('is_active', true);
    if (type) query = query.eq('type', type);
    const { data, error } = await query.order('match_score', { ascending: false });
    if (error) throw error;
    return data;
  },
};
