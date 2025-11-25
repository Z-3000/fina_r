import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { BRAND_COLOR } from '../../constants/colors';

// 차트 색상 상수
const CHART_COLORS = {
  green: '#10B981',
  greenLight: '#34D399',
  red: '#EF4444',
  redLight: '#F87171',
};

const BudgetView = ({
  // 상태
  activeTheme,
  stats,
  budgets,
  monthlySpendingData,
  budgetComparisonData,
  // 함수
  setBudgets,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">예산 관리</h2>

      {/* 월별 지출 추이 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: activeTheme.primary }} />
            <h3 className="font-bold text-lg">월별 지출 추이</h3>
          </div>
          <div className="text-sm text-gray-500">최근 6개월</div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
            <Legend />
            <Area type="monotone" dataKey="지출" stroke={CHART_COLORS.red} fill={CHART_COLORS.redLight} fillOpacity={0.4} />
            <Area type="monotone" dataKey="예산" stroke={CHART_COLORS.green} fill={CHART_COLORS.greenLight} fillOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 예산 vs 실제 비교 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: activeTheme.primary }} />
            <h3 className="font-bold text-lg">예산 vs 실제 지출</h3>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.green }}></div>
              예산
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.red }}></div>
              실제 지출
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
            <Legend />
            <Bar dataKey="예산" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="실제" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 절약/초과 요약 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${CHART_COLORS.green}15`, borderColor: `${CHART_COLORS.green}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" style={{ color: CHART_COLORS.green }} />
            <span className="font-semibold" style={{ color: CHART_COLORS.green }}>절약한 항목</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.green }}>
            {budgetComparisonData.filter(d => d.차이 > 0).length}개
          </div>
          <div className="text-sm mt-1" style={{ color: CHART_COLORS.green }}>
            총 {budgetComparisonData.filter(d => d.차이 > 0).reduce((sum, d) => sum + d.차이, 0).toLocaleString()}원 절약
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${CHART_COLORS.red}15`, borderColor: `${CHART_COLORS.red}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: CHART_COLORS.red }} />
            <span className="font-semibold" style={{ color: CHART_COLORS.red }}>초과한 항목</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.red }}>
            {budgetComparisonData.filter(d => d.차이 < 0).length}개
          </div>
          <div className="text-sm mt-1" style={{ color: CHART_COLORS.red }}>
            총 {Math.abs(budgetComparisonData.filter(d => d.차이 < 0).reduce((sum, d) => sum + d.차이, 0)).toLocaleString()}원 초과
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ backgroundColor: activeTheme.soft, borderColor: activeTheme.border }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5" style={{ color: CHART_COLORS.green }} />
            <span className="font-semibold" style={{ color: BRAND_COLOR }}>예산 달성률</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.green }}>
            {Math.round((budgetComparisonData.filter(d => d.차이 >= 0).length / Math.max(budgetComparisonData.length, 1)) * 100)}%
          </div>
          <div className="text-sm mt-1" style={{ color: BRAND_COLOR }}>
            {budgetComparisonData.filter(d => d.차이 >= 0).length}/{budgetComparisonData.length} 카테고리 달성
          </div>
        </div>
      </div>

      {/* 예산 사용 상세 - 예산 설정 가능 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">예산 사용 상세</h3>
        <div className="space-y-4">
          {stats.budgetUsage.map((item, idx) => {
            const pct = parseFloat(item.percentage);
            const barColor = pct > 90 ? CHART_COLORS.red : pct > 70 ? CHART_COLORS.redLight : CHART_COLORS.green;
            return (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-semibold">{item.category}</div>
                    <div className="text-sm" style={{ color: CHART_COLORS.red }}>
                      현재 지출: {item.spent.toLocaleString()}원
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: CHART_COLORS.green }}>예산:</span>
                    <input
                      type="text"
                      className="w-28 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2"
                      style={{ borderColor: CHART_COLORS.greenLight }}
                      defaultValue={(budgets[item.category] || item.budget).toLocaleString()}
                      onFocus={(e) => {
                        e.target.value = (budgets[item.category] || item.budget).toString();
                        e.target.select();
                        e.preventDefault();
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                        setBudgets({ ...budgets, [item.category]: value });
                        e.target.value = value.toLocaleString();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      placeholder="예산 입력"
                    />
                    <span className="text-sm text-gray-500">원</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                  <div
                    className="text-lg font-bold min-w-[50px] text-right"
                    style={{ color: barColor }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetView;
