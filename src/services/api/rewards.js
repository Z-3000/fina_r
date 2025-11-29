/**
 * Rewards, Leaderboard & Gamification API
 */
import { supabase } from './apiClient';
import { challengesAPI, missionsAPI, attendanceAPI } from './challenges';

export const rewardsAPI = {
  // Exchange reward (atomic with DB function)
  exchange: async (userId, rewardName, points) => {
    const { data, error } = await supabase.rpc('exchange_reward', {
      p_user_id: userId,
      p_reward_name: rewardName,
      p_points: points
    });

    if (error) {
      if (error.message.includes('insufficient')) {
        throw new Error('Insufficient points.');
      }
      throw error;
    }

    return data;
  },

  // Get exchange history
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('reward_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const rewardsProductAPI = {
  // Get all reward products
  getAll: async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });
    if (error) throw error;
    return data;
  },
};

export const leaderboardAPI = {
  // Get top ranks
  getTopRanks: async (limit = 10) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, points, level')
      .order('points', { ascending: false })
      .limit(limit);
    if (error) throw error;

    return data?.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points,
      badge: index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐',
    }));
  },

  // Get user rank
  getUserRank: async (userId) => {
    const { data: user } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('points', user.points);

    return (count || 0) + 1;
  },

  // Get total users
  getTotalUsers: async () => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
};

export const gamificationAPI = {
  getChallenges: challengesAPI.getAll,
  getUserChallenges: challengesAPI.getUserChallenges,

  // 출석 체크 (attendanceAPI.checkIn wrapper)
  checkAttendance: attendanceAPI.checkIn,

  // 리워드 교환 (rewardsAPI.exchange wrapper)
  exchangeReward: async (userId, reward) => {
    return rewardsAPI.exchange(userId, reward.name, reward.points);
  },

  getCompletedChallenges: async (userId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`*, challenge:challenges(*)`)
      .eq('user_id', userId)
      .eq('status', 'completed');
    if (error) throw error;
    return data?.map(uc => ({
      id: uc.challenge_id,
      title: uc.challenge?.title,
      badge: uc.challenge?.badge,
      reward: uc.challenge?.reward,
      completedDate: uc.completed_at?.split('T')[0]
    }));
  },
  getDailyMissions: missionsAPI.getDailyMissions,
  getWeeklyMissions: missionsAPI.getWeeklyMissions,
  getLeaderboard: leaderboardAPI.getTopRanks,
  getRewards: rewardsProductAPI.getAll,
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },
};
