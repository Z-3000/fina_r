-- 좋아요 증가 함수 (원자적 증감)
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = post_id
  RETURNING json_build_object(
    'id', id,
    'title', title,
    'likes_count', likes_count
  ) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'post_not_found: 게시물을 찾을 수 없습니다.';
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO authenticated;

-- ============================================

-- 리워드 교환 함수 (원자성 보장)
-- 포인트 확인 + 차감 + 기록 추가를 한 트랜잭션으로 처리

CREATE OR REPLACE FUNCTION exchange_reward(
  p_user_id UUID,
  p_reward_name TEXT,
  p_points INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_points INTEGER;
  v_result JSON;
BEGIN
  -- 현재 포인트 조회 (FOR UPDATE로 락)
  SELECT points INTO v_current_points
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- 포인트 부족 체크
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RAISE EXCEPTION 'insufficient_points: 포인트가 부족합니다. (현재: %, 필요: %)', COALESCE(v_current_points, 0), p_points;
  END IF;

  -- 포인트 차감
  UPDATE profiles
  SET points = points - p_points,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 교환 기록 추가
  INSERT INTO reward_history (user_id, reward_name, points_used, status, created_at)
  VALUES (p_user_id, p_reward_name, p_points, 'pending', NOW())
  RETURNING json_build_object(
    'id', id,
    'user_id', user_id,
    'reward_name', reward_name,
    'points_used', points_used,
    'status', status,
    'created_at', created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION exchange_reward(UUID, TEXT, INTEGER) TO authenticated;
