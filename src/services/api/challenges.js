/**
 * Challenges, Missions & Attendance API
 */
import { supabase } from './apiClient';

export const challengesAPI = {
  // Get all challenges
  getAll: async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // Get user challenges
  getUserChallenges: async (userId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // Join challenge
  joinChallenge: async (userId, challengeId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        status: 'active'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update progress
  updateProgress: async (userId, challengeId, progress) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({ progress })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Complete challenge
  completeChallenge: async (userId, challengeId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const missionsAPI = {
  // Get all missions
  getAll: async (type = null) => {
    let query = supabase.from('missions').select('*').eq('is_active', true);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get daily missions
  getDailyMissions: async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('type', 'daily')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // Get weekly missions
  getWeeklyMissions: async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('type', 'weekly')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // Get user missions
  getUserMissions: async (userId, type = null) => {
    let query = supabase
      .from('user_missions')
      .select(`*, mission:missions(*)`)
      .eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    if (type && data) {
      return data.filter(um => um.mission?.type === type);
    }
    return data;
  },

  // Update progress
  updateProgress: async (userId, missionId, progress, periodStart) => {
    const { data, error } = await supabase
      .from('user_missions')
      .upsert({
        user_id: userId,
        mission_id: missionId,
        progress,
        period_start: periodStart,
        completed: false
      }, { onConflict: 'user_id,mission_id,period_start' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const attendanceAPI = {
  // Check in
  checkIn: async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    // Check if already attended
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      return { success: false, message: 'Already checked in today.' };
    }

    // Record attendance
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: today,
        points_earned: 50
      })
      .select()
      .single();

    if (error) throw error;

    // Add points
    await supabase.rpc('add_points', { user_id: userId, points: 50 });

    return { success: true, points: 50, data };
  },

  // Get history
  getHistory: async (userId, days = 7) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(days);
    if (error) throw error;
    return data;
  }
};
