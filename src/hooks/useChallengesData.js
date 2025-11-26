import { useState, useRef, useCallback } from 'react';
import {
  challengesAPI,
  gamificationAPI,
  missionsAPI,
  leaderboardAPI,
  rewardsProductAPI,
} from '../services/supabaseApi';
import { useToast } from '../context/ToastContext';

/**
 * Challenges 탭 데이터를 지연 로드하는 훅
 * - 탭 선택 시에만 데이터 로드
 * - 캐싱으로 재로드 방지
 * - 로딩/에러 상태 관리
 */
export function useChallengesData(userId) {
  const toast = useToast();

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 상태
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [weeklyMissions, setWeeklyMissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);

  // 캐시 플래그 (한 번 로드되면 재로드 안 함)
  const isLoadedRef = useRef(false);

  // 데이터 로드 함수
  const loadData = useCallback(async (forceReload = false) => {
    // 이미 로드되었고 강제 리로드가 아니면 스킵
    if (isLoadedRef.current && !forceReload) {
      return;
    }

    if (!userId) {
      console.log('[useChallengesData] userId 없음, 로드 스킵');
      return;
    }

    setIsLoading(true);
    setError(null);

    const failedApis = [];
    const withErrorHandling = (promise, name, fallback = []) =>
      promise.catch((err) => {
        console.error(`[${name}] 로드 실패:`, err);
        failedApis.push(name);
        return fallback;
      });

    try {
      const [
        challengesData,
        completedChallengesData,
        weeklyMissionsData,
        leaderboardData,
        rewardsData,
      ] = await Promise.all([
        withErrorHandling(challengesAPI.getAll(), '챌린지'),
        withErrorHandling(gamificationAPI.getCompletedChallenges(userId), '완료챌린지'),
        withErrorHandling(missionsAPI.getWeeklyMissions(), '주간미션'),
        withErrorHandling(leaderboardAPI.getTopRanks(10), '리더보드'),
        withErrorHandling(rewardsProductAPI.getAll(), '리워드'),
      ]);

      // 데이터 설정
      setChallenges(challengesData || []);
      setCompletedChallenges(completedChallengesData || []);
      setWeeklyMissions(weeklyMissionsData || []);
      setLeaderboard(leaderboardData || []);
      setRewards(rewardsData || []);

      // 실패한 API가 있으면 알림
      if (failedApis.length > 0) {
        toast.warning(`챌린지 데이터 일부 로드 실패: ${failedApis.join(', ')}`);
        setError(`일부 데이터 로드 실패: ${failedApis.join(', ')}`);
      }

      // 캐시 플래그 설정
      isLoadedRef.current = true;
    } catch (err) {
      console.error('[useChallengesData] 로드 실패:', err);
      setError('챌린지 데이터를 불러오는 중 오류가 발생했습니다.');
      toast.error('챌린지 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // 강제 리로드
  const reload = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // 캐시 초기화 (로그아웃 시 등)
  const reset = useCallback(() => {
    isLoadedRef.current = false;
    setChallenges([]);
    setCompletedChallenges([]);
    setWeeklyMissions([]);
    setLeaderboard([]);
    setRewards([]);
    setError(null);
  }, []);

  return {
    // 상태
    isLoading,
    error,
    isLoaded: isLoadedRef.current,

    // 데이터
    challenges,
    completedChallenges,
    weeklyMissions,
    leaderboard,
    rewards,

    // 액션
    loadData,
    reload,
    reset,
  };
}

export default useChallengesData;
