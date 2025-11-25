import React from 'react';
import {
  Trophy, Star, Award, Flame, BarChart3, CheckCircle, Lock, Repeat, Gift
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip
} from 'recharts';
import {
  BRAND_COLOR, PRIMARY_BLUE, SUCCESS_GREEN, ACCENT_GOLD
} from '../../constants/colors';

const ChallengesView = ({
  // 상태
  activeTheme,
  userProfile,
  challengeStats,
  allBadges,
  unlockedBadges,
  lockedBadges,
  leaderboard,
  weeklyMissions,
  challenges,
  completedChallenges,
  rewards,
  // 함수
  handleRewardExchange,
}) => {
  return (
    <div className="space-y-6">
      {/* User Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 shadow-flat" style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}>
          <Trophy className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.level}</div>
          <div className="text-sm opacity-80">레벨</div>
        </div>
        <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
          <Star className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.points.toLocaleString()}</div>
          <div className="text-sm opacity-90">포인트</div>
        </div>
        <div className="rounded-xl p-6 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
          <Award className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{unlockedBadges.length}</div>
          <div className="text-sm opacity-80">획득 배지</div>
        </div>
        <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: BRAND_COLOR }}>
          <Flame className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.streak}</div>
          <div className="text-sm opacity-90">연속 출석</div>
        </div>
      </div>

      {/* 챌린지 진행 현황 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-lg">챌린지 진행 현황</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 파이 차트 */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={challengeStats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {challengeStats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600">
              총 {challengeStats.active + challengeStats.completed}개 챌린지
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${PRIMARY_BLUE}15` }}>
              <div className="text-2xl font-bold" style={{ color: PRIMARY_BLUE }}>{challengeStats.active}</div>
              <div className="text-sm text-gray-600">진행 중</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${SUCCESS_GREEN}20` }}>
              <div className="text-2xl font-bold" style={{ color: SUCCESS_GREEN }}>{challengeStats.completed}</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${BRAND_COLOR}15` }}>
              <div className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>{challengeStats.avgProgress}%</div>
              <div className="text-sm text-gray-600">평균 진행률</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${ACCENT_GOLD}25` }}>
              <div className="text-2xl font-bold" style={{ color: ACCENT_GOLD }}>{challengeStats.totalRewardsEarned.toLocaleString()}P</div>
              <div className="text-sm text-gray-600">총 획득 포인트</div>
            </div>
          </div>
        </div>
      </div>

      {/* 배지 갤러리 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg">배지 갤러리</h3>
          </div>
          <span className="text-sm text-gray-500">{unlockedBadges.length}/{allBadges.length} 획득</span>
        </div>

        {/* 획득한 배지 */}
        {unlockedBadges.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> 획득한 배지
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {unlockedBadges.map(badge => (
                <div key={badge.id} className="group relative">
                  <div className="bg-yellow-50 rounded-xl p-4 text-center border-2 border-yellow-300 hover:scale-105 transition cursor-pointer">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="text-xs font-semibold truncate">{badge.name}</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                    {badge.description}
                    <div className="text-yellow-400 text-[10px]">{badge.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 미획득 배지 */}
        <div>
          <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
            <Lock className="w-4 h-4" /> 미획득 배지
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="group relative">
                <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-gray-200 opacity-60 hover:opacity-80 transition cursor-pointer">
                  <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                  <div className="text-xs font-semibold truncate text-gray-400">{badge.name}</div>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {badge.description}
                  <div className="text-gray-400 text-[10px]">{badge.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="font-bold text-lg">절약왕 리더보드</h3>
          </div>
          <span className="text-sm text-gray-500">이번 달</span>
        </div>
        <div className="space-y-3">
          {leaderboard.map((user, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-lg ${user.isUser ? 'border-2' : 'bg-gray-50'}`}
              style={user.isUser ? { backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}50` } : {}}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                }`}>
                  {user.rank}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {user.name}
                    <span className="text-xl">{user.badge}</span>
                  </div>
                  <div className="text-xs text-gray-500">{user.points.toLocaleString()} 포인트</div>
                </div>
              </div>
              {user.isUser && (
                <span className="text-xs text-white px-3 py-1 rounded-full font-bold" style={{ backgroundColor: PRIMARY_BLUE }}>
                  나
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Missions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="w-5 h-5" style={{ color: BRAND_COLOR }} />
          <h3 className="font-bold text-lg">주간 미션</h3>
        </div>
        <div className="space-y-4">
          {weeklyMissions.map(mission => (
            <div key={mission.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold mb-1">{mission.title}</div>
                  <div className="text-sm text-gray-600">{mission.progress} / {mission.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">보상</div>
                  <div className="text-lg font-bold" style={{ color: BRAND_COLOR }}>+{mission.reward}P</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${(mission.progress / mission.target) * 100}%`, backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="font-bold text-lg mb-4">진행 중인 챌린지</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.filter(c => c.status === 'active').map(challenge => (
            <div key={challenge.id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
                    {challenge.badge}
                  </div>
                  <div>
                    <div className="font-bold mb-1">{challenge.title}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                        {challenge.difficulty === 'easy' ? '쉬움' :
                          challenge.difficulty === 'medium' ? '보통' : '어려움'}
                      </span>
                      <span className="text-xs text-gray-500">D-{challenge.daysLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">진행률</span>
                  <span className="font-semibold">{Math.floor((challenge.progress / challenge.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%`, backgroundColor: PRIMARY_BLUE }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{challenge.progress} / {challenge.target}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">완료 시 보상</span>
                <span className="font-bold" style={{ color: PRIMARY_BLUE }}>+{challenge.reward}P</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">완료한 챌린지</h3>
        <div className="space-y-2">
          {completedChallenges.map(challenge => (
            <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  {challenge.badge}
                </div>
                <div>
                  <div className="font-semibold text-sm">{challenge.title}</div>
                  <div className="text-xs text-gray-500">{challenge.completedDate}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-green-600">+{challenge.reward}P</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Shop */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">리워드 샵</h3>
          <div className="text-sm font-semibold" style={{ color: PRIMARY_BLUE }}>
            보유: {userProfile.points.toLocaleString()}P
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl mx-auto mb-3 border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
                  {reward.icon}
                </div>
                <h4 className="font-bold mb-1">{reward.name}</h4>
                <p className="text-xs text-gray-600">{reward.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="font-bold text-lg" style={{ color: PRIMARY_BLUE }}>{reward.points}P</div>
                <button
                  onClick={() => handleRewardExchange(reward)}
                  disabled={userProfile.points < reward.points}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    userProfile.points >= reward.points
                      ? 'hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={userProfile.points >= reward.points ? { backgroundColor: PRIMARY_BLUE, color: '#fff' } : {}}
                >
                  {userProfile.points >= reward.points ? '교환하기' : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              </div>
              {reward.stock === 'limited' && (
                <div className="mt-2 text-xs text-center text-red-600 font-semibold">
                  ⚡ 한정 수량
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral Event */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">친구 초대하고 포인트 받기</h3>
            <p className="text-sm text-gray-700 mb-4">
              친구가 가입하면 <span className="font-bold text-green-600">양쪽 모두 500P</span>를 받아요!
            </p>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
              초대 링크 복사하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesView;
