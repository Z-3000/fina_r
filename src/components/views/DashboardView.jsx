import React, { useMemo } from 'react';
import {
  Crown, Flame, Shield, Download, AlertTriangle, FileText, TrendingUp, Target,
  User, Briefcase, Calculator, Folder, Lightbulb, Pill, GraduationCap, Home,
  Calendar, CheckCircle, Wallet, Trophy, Gift, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import {
  BRAND_COLOR, PRIMARY_BLUE, SUCCESS_GREEN, ACCENT_GOLD,
  PRIMARY_DARK
} from '../../constants/colors';
import { CHART_COLORS, UNIQUE_CHART_COLORS } from '../../constants/charts';
import { formatAmount } from '../../utils/formatting';

const DashboardView = ({
  // 상태
  activeTheme,
  userProfile,
  isPremium,
  userType,
  taxHealthScore,
  aiInsights,
  deductionTracker,
  detailedTaxHealthScores,
  attendanceChecked,
  stats,
  pieChartData,
  chartPalette,
  isRefreshingAI,
  // 함수
  setShowSettingsModal,
  setShowAIInsightModal,
  setShowPDFReportModal,
  setShowTaxSimulatorModal,
  setShowDocSpaceModal,
  handleAttendanceCheck,
  handleRefreshAIInsights,
}) => {
  // 10% 미만 항목을 기타로 묶는 로직
  const processedPieChartData = useMemo(() => {
    if (!pieChartData || pieChartData.length === 0) return [];

    const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    const threshold = 0.10; // 10%
    const mainItems = [];
    let otherValue = 0;

    pieChartData.forEach(item => {
      const percentage = item.value / total;
      if (percentage >= threshold) {
        mainItems.push(item);
      } else {
        otherValue += item.value;
      }
    });

    // 기타 항목이 있으면 추가
    if (otherValue > 0) {
      mainItems.push({ name: '기타', value: otherValue });
    }

    return mainItems;
  }, [pieChartData]);

  return (
    <div className="space-y-6">
      {/* User Profile with Tax Health Score */}
      <div
        className="rounded-xl p-6 text-white shadow-flat-md"
        style={{ backgroundColor: activeTheme.primary }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center relative">
              <Crown className="w-10 h-10" />
              <div
                className="absolute -bottom-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: ACCENT_GOLD, color: activeTheme.primary }}
              >
                Lv.{userProfile.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                {isPremium && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: ACCENT_GOLD, color: activeTheme.primary }}
                  >
                    PRO
                  </span>
                )}
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
                >
                  {userType === 'individual' ? '개인' : '사업자'}
                </span>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="ml-2 p-1 bg-white/20 rounded-full hover:bg-white/30 transition"
                  title="설정"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div className="text-sm opacity-90 mb-2">{userProfile.points.toLocaleString()} 포인트</div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="text-xs">{userProfile.streak}일 연속 출석</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75 mb-1">Tax Health Score™</div>
            <div className="text-4xl font-bold">{taxHealthScore}</div>
            <div className="text-xs opacity-75">
              {taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의'}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>레벨 {userProfile.level}</span>
            <span>{userProfile.currentExp} / {userProfile.expToNextLevel} EXP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${(userProfile.currentExp / userProfile.expToNextLevel) * 100}%`, backgroundColor: ACCENT_GOLD }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights - Critical First */}
      {aiInsights.filter(i => i.priority === 'high').length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-orange-900">🔥 세무사 AI 긴급 알림</h3>
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {aiInsights.filter(i => i.priority === 'high').length}건
                  </span>
                </div>
                <button
                  onClick={handleRefreshAIInsights}
                  disabled={isRefreshingAI}
                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-1"
                >
                  <Sparkles className={`w-3 h-3 ${isRefreshingAI ? 'animate-spin' : ''}`} />
                  {isRefreshingAI ? 'AI 분석 중...' : 'AI 새로고침'}
                </button>
              </div>
              {aiInsights.filter(i => i.priority === 'high').slice(0, 2).map(insight => (
                <div key={insight.id} className="mb-3 last:mb-0">
                  <div className="flex items-start gap-2">
                    <insight.icon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-orange-900">{insight.title}</div>
                      <div className="text-sm text-orange-800 mt-1">{insight.description}</div>
                      {insight.potentialSaving > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            +{insight.potentialSaving.toLocaleString()}원
                          </span>
                          <span className="text-xs text-gray-600">절감 가능</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIInsightModal(true)}
                    className="mt-2 text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition"
                  >
                    {insight.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tax Health Score Detail - Enhanced */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">Tax Health Score™</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: taxHealthScore >= 90 ? `${SUCCESS_GREEN}30` :
                  taxHealthScore >= 70 ? `${PRIMARY_BLUE}20` :
                    taxHealthScore >= 50 ? `${ACCENT_GOLD}30` : '#FFE6E8',
                color: taxHealthScore >= 90 ? SUCCESS_GREEN :
                  taxHealthScore >= 70 ? PRIMARY_BLUE :
                    taxHealthScore >= 50 ? '#806B00' : '#CC1F2D'
              }}
            >
              {taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의'}
            </span>
          </div>
          <button
            onClick={() => setShowPDFReportModal(true)}
            className="text-sm px-3 py-1 rounded-lg hover:opacity-80 transition flex items-center gap-1"
            style={{ backgroundColor: activeTheme.soft, color: activeTheme.primary }}
          >
            <Download className="w-4 h-4" />
            리포트 다운로드
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 게이지 차트 */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={20}
                data={[{ name: 'Score', value: taxHealthScore, fill: taxHealthScore >= 70 ? '#10b981' : '#f59e0b' }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold">
                  {taxHealthScore}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600 -mt-4">
              상위 {Math.max(1, 100 - taxHealthScore)}% 수준
            </div>
          </div>

          {/* 히스토리 트렌드 차트 */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">점수 추이 (최근 6개월)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={[
                { month: '6월', score: Math.max(30, taxHealthScore - 25) },
                { month: '7월', score: Math.max(35, taxHealthScore - 20) },
                { month: '8월', score: Math.max(40, taxHealthScore - 15) },
                { month: '9월', score: Math.max(45, taxHealthScore - 10) },
                { month: '10월', score: Math.max(50, taxHealthScore - 5) },
                { month: '11월', score: taxHealthScore },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}점`, '점수']} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={activeTheme.primary}
                  strokeWidth={2}
                  dot={{ fill: activeTheme.primary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 점수 향상 제안 알림 */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">점수 향상 제안</div>
            {taxHealthScore < 90 && Object.keys(deductionTracker).length < 5 && (
              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                <div className="text-xs font-semibold text-yellow-800">공제 항목 추가 +5점</div>
                <div className="text-[10px] text-yellow-700">의료비, 교육비 등 등록</div>
              </div>
            )}
            {taxHealthScore < 85 && (
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800">증빙 자료 업로드 +8점</div>
                <div className="text-[10px] text-blue-700">영수증 추가 등록</div>
              </div>
            )}
            {userProfile.streak < 7 && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <div className="text-xs font-semibold text-green-800">꾸준히 관리 +3점</div>
                <div className="text-[10px] text-green-700">매일 출석하기</div>
              </div>
            )}
            {taxHealthScore >= 90 && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <div className="text-xs font-semibold text-green-800">최상 상태! 👏</div>
                <div className="text-[10px] text-green-700">세금 관리를 잘 하고 계세요</div>
              </div>
            )}
          </div>
        </div>

        {/* 4개 카테고리 세부 점수 */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                name: '세금 리스크',
                score: detailedTaxHealthScores.taxRisk.score,
                status: detailedTaxHealthScores.taxRisk.status,
                color: detailedTaxHealthScores.taxRisk.statusColor,
                icon: AlertTriangle,
                tooltip: '증빙 누락, 한도 초과, 업종 평균 대비 이상치 등을 분석',
              },
              {
                name: '증빙 완성도',
                score: detailedTaxHealthScores.documentation.score,
                status: detailedTaxHealthScores.documentation.status,
                color: detailedTaxHealthScores.documentation.statusColor,
                icon: FileText,
                tooltip: '공제 금액 대비 증빙 서류 업로드 비율',
              },
              {
                name: '환급 가능성',
                score: detailedTaxHealthScores.refundPotential.score,
                status: detailedTaxHealthScores.refundPotential.status,
                color: detailedTaxHealthScores.refundPotential.statusColor,
                icon: TrendingUp,
                tooltip: detailedTaxHealthScores.refundPotential.tip,
              },
              {
                name: '절세 여력',
                score: detailedTaxHealthScores.savingsPotential.score,
                status: detailedTaxHealthScores.savingsPotential.status,
                color: detailedTaxHealthScores.savingsPotential.statusColor,
                icon: Target,
                tooltip: `추가 절세 가능: ${detailedTaxHealthScores.savingsPotential.totalPotentialSavings.toLocaleString()}원`,
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 group relative" title={cat.tooltip}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 bg-${cat.color}-100 rounded flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 text-${cat.color}-600`} />
                    </div>
                    <span className="font-semibold text-xs">{cat.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-xl font-bold text-${cat.color}-600`}>{cat.score}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 bg-${cat.color}-100 text-${cat.color}-700 rounded`}>{cat.status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full bg-${cat.color}-500`} style={{ width: `${cat.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 유저타입별 세금 핵심 정보 */}
      <div
        className="rounded-xl p-6 shadow-flat border"
        style={{
          backgroundColor: userType === 'individual' ? '#E6F2FF' : '#F3E8FF',
          borderColor: userType === 'individual' ? PRIMARY_BLUE : BRAND_COLOR
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {userType === 'individual' ? (
              <>
                <User className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
                <h3 className="font-bold text-lg" style={{ color: BRAND_COLOR }}>개인 연말정산 현황</h3>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                <h3 className="font-bold text-lg" style={{ color: BRAND_COLOR }}>사업자 세금 현황</h3>
              </>
            )}
          </div>
          <button
            onClick={() => setShowTaxSimulatorModal(true)}
            className="text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 text-white hover:opacity-90"
            style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : BRAND_COLOR }}
          >
            <Calculator className="w-4 h-4" />
            {userType === 'individual' ? '연말정산 시뮬레이터' : '종합소득세 계산'}
          </button>
        </div>

        {userType === 'individual' ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>예상 환급액</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{Math.round((stats.taxEstimate || 0) * 0.15).toLocaleString()}원</div>
              <div className="text-xs mt-1 text-right" style={{ color: PRIMARY_BLUE }}>공제 활용 시 예상</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>공제 가능 총액</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{Object.values(deductionTracker).reduce((sum, d) => sum + d.current, 0).toLocaleString()}원</div>
              <div className="text-xs mt-1 text-right" style={{ color: PRIMARY_BLUE }}>{Object.keys(deductionTracker).length}개 항목</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>신고 마감까지</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: CHART_COLORS.danger }}>D-{Math.max(0, Math.floor((new Date('2026-02-28') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs mt-1 text-right" style={{ color: PRIMARY_BLUE }}>연말정산 마감</div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>예상 종합소득세</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{(stats.taxEstimate || 0).toLocaleString()}원</div>
              <div className="text-xs mt-1 text-right" style={{ color: BRAND_COLOR, opacity: 0.7 }}>올해 예상 납부액</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>이번 달 매출</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{stats.totalSpent.toLocaleString()}원</div>
              <div className="text-xs mt-1 text-right" style={{ color: BRAND_COLOR, opacity: 0.7 }}>지출 기준</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>부가세 신고까지</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: CHART_COLORS.danger }}>D-{Math.max(0, Math.floor((new Date('2026-01-25') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs mt-1 text-right" style={{ color: BRAND_COLOR, opacity: 0.7 }}>2기 확정신고</div>
            </div>
          </div>
        )}
      </div>

      {/* Deduction Tracker */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: BRAND_COLOR }} />
            <h3 className="font-bold text-lg">{userType === 'individual' ? '공제 항목 실시간 추적' : '필요경비 추적'}</h3>
          </div>
          <button
            onClick={() => setShowDocSpaceModal(true)}
            className="text-sm hover:opacity-80 transition flex items-center gap-1"
            style={{ color: BRAND_COLOR }}
          >
            <Folder className="w-4 h-4" />
            증빙 서류 보기
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(deductionTracker).map(([key, item]) => {
            const Icon = item.icon;
            const progress = (item.current / item.maxDeduction) * 100;
            const isNearThreshold = item.threshold > 0 && item.current >= item.threshold * 0.85;

            return (
              <div key={key} className={`border-2 rounded-lg p-4 ${isNearThreshold ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.documents}건 증빙</div>
                    </div>
                  </div>
                  {isNearThreshold && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatAmount(item.current)}원</span>
                    <span className="text-gray-500">/ {formatAmount(item.maxDeduction)}원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: CHART_COLORS.green }}
                    />
                  </div>
                </div>

                {item.potentialSaving > 0 && (
                  <div className="text-xs text-gray-700 font-medium text-right">
                    +{formatAmount(item.potentialSaving)}원 추가 가능
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI 공제 추천 */}
      <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg text-indigo-900">AI 공제 추천</h3>
          <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">맞춤형</span>
        </div>
        <div className="space-y-3">
          {/* 의료비 추천 */}
          {(deductionTracker.medical?.current || 0) < 500000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">의료비 공제 확대 가능</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">최대 15% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    안경, 렌즈, 치과 치료, 보청기 등 누락된 의료비가 있는지 확인하세요.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((500000 - (deductionTracker.medical?.current || 0)) * 0.15).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 교육비 추천 */}
          {(deductionTracker.education?.current || 0) < 1000000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PRIMARY_BLUE}20` }}>
                  <GraduationCap className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">교육비 공제 놓치지 마세요</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>최대 15% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    학원비, 온라인 강의, 자격증 취득 비용도 교육비 공제 대상입니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((1000000 - (deductionTracker.education?.current || 0)) * 0.15).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 주거비 추천 */}
          {(deductionTracker.housing?.current || 0) < 3000000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">월세/주거 관련 공제</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">최대 12% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    월세 납부 내역, 주택청약저축이 있다면 추가 공제가 가능합니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((3000000 - (deductionTracker.housing?.current || 0)) * 0.12).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 연금/보험 추천 */}
          <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND_COLOR}20` }}>
                <Shield className="w-5 h-5" style={{ color: BRAND_COLOR }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">연금저축/IRP 활용하기</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BRAND_COLOR}20`, color: BRAND_COLOR }}>최대 16.5% 공제</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  연금저축과 IRP에 연간 700만원까지 납입하면 최대 115.5만원 절세됩니다.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium">연간 최대 절세:</span>
                  <span className="text-sm font-bold text-green-600">+1,155,000원</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 mx-auto" style={{ backgroundColor: PRIMARY_BLUE }}>
            <Sparkles className="w-4 h-4" />
            전체 절세 전략 보기
          </button>
        </div>
      </div>

      {/* Attendance Check */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
            <h3 className="font-bold text-lg">출석 체크</h3>
          </div>
          <button
            onClick={handleAttendanceCheck}
            disabled={attendanceChecked.every(d => d)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${attendanceChecked.every(d => d)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'text-white hover:opacity-90'
              }`}
            style={!attendanceChecked.every(d => d) ? { backgroundColor: PRIMARY_BLUE } : {}}
          >
            {attendanceChecked.every(d => d) ? '완료' : '출석 체크 +50P'}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500 mb-2">{day}</div>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center ${attendanceChecked[idx]
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-400'
                  }`}
                style={attendanceChecked[idx] ? { backgroundColor: PRIMARY_BLUE } : {}}>
                {attendanceChecked[idx] ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <div className="text-lg font-bold">{idx + 1}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">이번 달</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{stats.totalSpent.toLocaleString()}원</div>
          <div className="text-xs opacity-80">총 지출</div>
        </div>

        <div className="rounded-xl p-4 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">절감액</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{Math.floor(userProfile.totalSaved / 1000).toLocaleString()}천원</div>
          <div className="text-xs opacity-80">누적 절감</div>
        </div>

        <div className="rounded-xl p-4 text-white shadow-flat" style={{ backgroundColor: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">배지</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{userProfile.badges.length}개</div>
          <div className="text-xs opacity-80">획득 완료</div>
        </div>

        <div className="rounded-xl p-4 shadow-flat" style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">포인트</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{userProfile.points.toLocaleString()}P</div>
          <div className="text-xs opacity-80">사용 가능</div>
        </div>
      </div>

      {/* 카테고리별 지출 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">카테고리별 지출</h3>
        {processedPieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPie>
              <Pie
                data={processedPieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill={activeTheme.soft}
                dataKey="value"
              >
                {processedPieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={UNIQUE_CHART_COLORS[index % UNIQUE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
            </RechartsPie>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
