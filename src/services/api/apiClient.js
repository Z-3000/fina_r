/**
 * API Client - Supabase instance and common error handling
 */
import { supabase } from '../../lib/supabase';

// Re-export supabase instance for use in API modules
export { supabase };

/**
 * Common error handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  };
};

/**
 * Execute Supabase query with standard error handling
 * @param {Promise} query - Supabase query promise
 * @returns {Promise} Query result data
 */
export const executeQuery = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Execute Supabase query expecting single result
 * @param {Promise} query - Supabase query promise
 * @returns {Promise} Single result data
 */
export const executeSingleQuery = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
