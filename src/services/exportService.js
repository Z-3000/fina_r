/**
 * PDF 및 Excel 내보내기 서비스
 * - PDF: jsPDF + jspdf-autotable
 * - Excel: xlsx + file-saver
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// =============================================
// PDF 리포트 생성
// =============================================

/**
 * 월별 지출 리포트 PDF 생성
 */
export const generateMonthlyExpenseReport = ({
  receipts = [],
  budgets = {},
  stats = {},
  userProfile = {},
  month = new Date().toISOString().slice(0, 7),
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 제목
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text('월별 지출 리포트', pageWidth / 2, 20, { align: 'center' });

  // 부제목
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${month} | ${userProfile.name || '사용자'}`, pageWidth / 2, 28, { align: 'center' });

  // 구분선
  doc.setDrawColor(200);
  doc.line(20, 32, pageWidth - 20, 32);

  // 요약 섹션
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('지출 요약', 20, 42);

  doc.setFontSize(10);
  const summaryData = [
    ['총 지출', `${(stats.totalSpent || 0).toLocaleString()}원`],
    ['총 예산', `${(stats.totalBudget || 0).toLocaleString()}원`],
    ['잔여 예산', `${(stats.budgetRemaining || 0).toLocaleString()}원`],
    ['거래 건수', `${stats.receiptCount || 0}건`],
  ];

  doc.autoTable({
    startY: 46,
    head: [['항목', '금액']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
    tableWidth: pageWidth - 40,
  });

  // 카테고리별 지출
  const categoryY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('카테고리별 지출', 20, categoryY);

  const categoryData = stats.budgetUsage?.map(item => [
    item.category,
    `${item.spent.toLocaleString()}원`,
    `${item.budget.toLocaleString()}원`,
    `${item.percentage}%`,
  ]) || [];

  doc.autoTable({
    startY: categoryY + 4,
    head: [['카테고리', '지출', '예산', '사용률']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }, // purple-500
    margin: { left: 20, right: 20 },
  });

  // 거래 내역
  const transactionY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('거래 내역', 20, transactionY);

  const transactionData = receipts.slice(0, 20).map(r => [
    r.date?.slice(0, 10) || '',
    r.merchant || '',
    r.category || '',
    `${(r.amount || 0).toLocaleString()}원`,
  ]);

  doc.autoTable({
    startY: transactionY + 4,
    head: [['날짜', '가맹점', '카테고리', '금액']],
    body: transactionData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // green-500
    margin: { left: 20, right: 20 },
  });

  // 푸터
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`생성일: ${new Date().toLocaleString('ko-KR')} | FINA_R`, pageWidth / 2, footerY, { align: 'center' });

  // 저장
  const fileName = `월별지출리포트_${month}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * 연말정산 예상 리포트 PDF 생성
 */
export const generateYearEndTaxReport = ({
  taxResult = {},
  deductions = {},
  userProfile = {},
  year = new Date().getFullYear(),
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 제목
  doc.setFontSize(20);
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(`${year}년 연말정산 예상 리포트`, pageWidth / 2, 20, { align: 'center' });

  // 부제목
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${userProfile.name || '사용자'}님의 예상 세금 분석`, pageWidth / 2, 28, { align: 'center' });

  // 구분선
  doc.setDrawColor(200);
  doc.line(20, 32, pageWidth - 20, 32);

  // 소득 정보
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('소득 정보', 20, 42);

  const incomeData = [
    ['연간 총급여', `${(taxResult.annualIncome || 0).toLocaleString()}원`],
    ['근로소득공제', `${(taxResult.earnedIncomeDeduction || 0).toLocaleString()}원`],
    ['근로소득금액', `${(taxResult.earnedIncome || 0).toLocaleString()}원`],
  ];

  doc.autoTable({
    startY: 46,
    head: [['항목', '금액']],
    body: incomeData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  // 공제 정보
  const deductionY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('공제 항목', 20, deductionY);

  const deductionData = [
    ['인적공제', `${(taxResult.personalDeductions || 0).toLocaleString()}원`],
    ['특별공제', `${(taxResult.specialDeductions || 0).toLocaleString()}원`],
    ['세액공제', `${(taxResult.taxCredits || 0).toLocaleString()}원`],
    ['근로소득세액공제', `${(taxResult.earnedIncomeTaxCredit || 0).toLocaleString()}원`],
  ];

  doc.autoTable({
    startY: deductionY + 4,
    head: [['공제 항목', '금액']],
    body: deductionData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 20, right: 20 },
  });

  // 세금 계산
  const taxY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('세금 계산', 20, taxY);

  const taxData = [
    ['과세표준', `${(taxResult.taxableIncome || 0).toLocaleString()}원`],
    ['산출세액', `${(taxResult.calculatedTax || 0).toLocaleString()}원`],
    ['결정세액', `${(taxResult.finalTax || 0).toLocaleString()}원`],
    ['지방소득세', `${(taxResult.localTax || 0).toLocaleString()}원`],
    ['총 예상 세금', `${(taxResult.totalTax || 0).toLocaleString()}원`],
  ];

  doc.autoTable({
    startY: taxY + 4,
    head: [['항목', '금액']],
    body: taxData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
    margin: { left: 20, right: 20 },
  });

  // 실효세율 박스
  const effectiveY = doc.lastAutoTable.finalY + 15;
  doc.setFillColor(254, 243, 199); // yellow-100
  doc.rect(20, effectiveY, pageWidth - 40, 25, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`실효세율: ${taxResult.effectiveRate || 0}%`, pageWidth / 2, effectiveY + 10, { align: 'center' });
  doc.text(`월 예상 세금: ${(taxResult.monthlyTax || 0).toLocaleString()}원`, pageWidth / 2, effectiveY + 18, { align: 'center' });

  // 푸터
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`생성일: ${new Date().toLocaleString('ko-KR')} | FINA_R - 본 자료는 참고용이며 실제 세금과 다를 수 있습니다.`, pageWidth / 2, footerY, { align: 'center' });

  // 저장
  const fileName = `연말정산예상_${year}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * 세금 건강 리포트 PDF 생성
 */
export const generateTaxHealthReport = ({
  taxHealthScore = 0,
  deductionTracker = {},
  userProfile = {},
  recommendations = [],
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 제목
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // green-500
  doc.text('Tax Health Score Report', pageWidth / 2, 20, { align: 'center' });

  // 점수 표시
  doc.setFontSize(48);
  doc.setTextColor(taxHealthScore >= 70 ? [16, 185, 129] : [245, 158, 11]);
  doc.text(`${taxHealthScore}`, pageWidth / 2, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100);
  const scoreLabel = taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의';
  doc.text(scoreLabel, pageWidth / 2, 58, { align: 'center' });

  // 공제 현황
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('공제 항목 현황', 20, 75);

  const deductionData = Object.entries(deductionTracker).map(([key, item]) => [
    item.name || key,
    `${(item.current || 0).toLocaleString()}원`,
    `${(item.maxDeduction || 0).toLocaleString()}원`,
    `${Math.round((item.current / item.maxDeduction) * 100)}%`,
  ]);

  doc.autoTable({
    startY: 79,
    head: [['항목', '현재', '한도', '활용률']],
    body: deductionData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 20, right: 20 },
  });

  // 개선 제안
  if (recommendations.length > 0) {
    const recY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('개선 제안', 20, recY);

    const recData = recommendations.map((rec, idx) => [
      `${idx + 1}`,
      rec.title || '',
      rec.description || '',
      `+${rec.expectedPoints || 0}점`,
    ]);

    doc.autoTable({
      startY: recY + 4,
      head: [['#', '제안', '설명', '예상 점수']],
      body: recData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 20, right: 20 },
    });
  }

  // 푸터
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`생성일: ${new Date().toLocaleString('ko-KR')} | FINA_R`, pageWidth / 2, footerY, { align: 'center' });

  // 저장
  const fileName = `세금건강리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);

  return fileName;
};

// =============================================
// Excel 내보내기
// =============================================

/**
 * 거래 내역 Excel 내보내기
 */
export const exportReceiptsToExcel = (receipts = [], fileName = '거래내역') => {
  // 데이터 변환
  const data = receipts.map(r => ({
    '날짜': r.date?.slice(0, 10) || '',
    '가맹점': r.merchant || '',
    '카테고리': r.category || '',
    '금액': r.amount || 0,
    '부가세': r.tax || 0,
    '메모': r.notes || '',
    '결제수단': r.paymentMethod || '',
  }));

  // 워크북 생성
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '거래내역');

  // 열 너비 설정
  ws['!cols'] = [
    { wch: 12 }, // 날짜
    { wch: 20 }, // 가맹점
    { wch: 10 }, // 카테고리
    { wch: 12 }, // 금액
    { wch: 10 }, // 부가세
    { wch: 30 }, // 메모
    { wch: 10 }, // 결제수단
  ];

  // 파일 저장
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);

  return `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

/**
 * 예산 현황 Excel 내보내기
 */
export const exportBudgetToExcel = (budgetUsage = [], fileName = '예산현황') => {
  const data = budgetUsage.map(item => ({
    '카테고리': item.category || '',
    '예산': item.budget || 0,
    '지출': item.spent || 0,
    '잔여': (item.budget || 0) - (item.spent || 0),
    '사용률(%)': item.percentage || 0,
    '상태': item.spent > item.budget ? '초과' : '정상',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '예산현황');

  ws['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
  ];

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);

  return `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

/**
 * 연말정산 데이터 Excel 내보내기
 */
export const exportTaxDataToExcel = (taxResult = {}, deductions = {}, fileName = '연말정산') => {
  // 소득 정보 시트
  const incomeData = [
    { '항목': '연간 총급여', '금액': taxResult.annualIncome || 0 },
    { '항목': '근로소득공제', '금액': taxResult.earnedIncomeDeduction || 0 },
    { '항목': '근로소득금액', '금액': taxResult.earnedIncome || 0 },
    { '항목': '과세표준', '금액': taxResult.taxableIncome || 0 },
    { '항목': '산출세액', '금액': taxResult.calculatedTax || 0 },
    { '항목': '결정세액', '금액': taxResult.finalTax || 0 },
    { '항목': '지방소득세', '금액': taxResult.localTax || 0 },
    { '항목': '총 예상 세금', '금액': taxResult.totalTax || 0 },
  ];

  // 공제 정보 시트
  const deductionData = [
    { '공제항목': '인적공제', '금액': taxResult.personalDeductions || 0 },
    { '공제항목': '특별공제', '금액': taxResult.specialDeductions || 0 },
    { '공제항목': '세액공제', '금액': taxResult.taxCredits || 0 },
    { '공제항목': '근로소득세액공제', '금액': taxResult.earnedIncomeTaxCredit || 0 },
  ];

  const wb = XLSX.utils.book_new();

  const wsIncome = XLSX.utils.json_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, wsIncome, '소득정보');

  const wsDeduction = XLSX.utils.json_to_sheet(deductionData);
  XLSX.utils.book_append_sheet(wb, wsDeduction, '공제정보');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().getFullYear()}.xlsx`);

  return `${fileName}_${new Date().getFullYear()}.xlsx`;
};

/**
 * 종합 데이터 Excel 내보내기 (모든 시트 포함)
 */
export const exportAllDataToExcel = ({
  receipts = [],
  budgetUsage = [],
  taxResult = {},
  deductionTracker = {},
  fileName = 'FINA_R_종합데이터',
}) => {
  const wb = XLSX.utils.book_new();

  // 1. 거래내역 시트
  const receiptData = receipts.map(r => ({
    '날짜': r.date?.slice(0, 10) || '',
    '가맹점': r.merchant || '',
    '카테고리': r.category || '',
    '금액': r.amount || 0,
    '부가세': r.tax || 0,
  }));
  const wsReceipts = XLSX.utils.json_to_sheet(receiptData);
  XLSX.utils.book_append_sheet(wb, wsReceipts, '거래내역');

  // 2. 예산현황 시트
  const budgetData = budgetUsage.map(item => ({
    '카테고리': item.category,
    '예산': item.budget,
    '지출': item.spent,
    '사용률': `${item.percentage}%`,
  }));
  const wsBudget = XLSX.utils.json_to_sheet(budgetData);
  XLSX.utils.book_append_sheet(wb, wsBudget, '예산현황');

  // 3. 공제현황 시트
  const deductionData = Object.entries(deductionTracker).map(([key, item]) => ({
    '항목': item.name || key,
    '현재금액': item.current || 0,
    '한도': item.maxDeduction || 0,
    '활용률': `${Math.round((item.current / item.maxDeduction) * 100)}%`,
  }));
  const wsDeduction = XLSX.utils.json_to_sheet(deductionData);
  XLSX.utils.book_append_sheet(wb, wsDeduction, '공제현황');

  // 4. 세금요약 시트
  const taxData = [
    { '항목': '연간 총급여', '금액': taxResult.annualIncome || 0 },
    { '항목': '과세표준', '금액': taxResult.taxableIncome || 0 },
    { '항목': '결정세액', '금액': taxResult.finalTax || 0 },
    { '항목': '총 예상 세금', '금액': taxResult.totalTax || 0 },
    { '항목': '실효세율', '금액': `${taxResult.effectiveRate || 0}%` },
  ];
  const wsTax = XLSX.utils.json_to_sheet(taxData);
  XLSX.utils.book_append_sheet(wb, wsTax, '세금요약');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);

  return `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

export default {
  generateMonthlyExpenseReport,
  generateYearEndTaxReport,
  generateTaxHealthReport,
  exportReceiptsToExcel,
  exportBudgetToExcel,
  exportTaxDataToExcel,
  exportAllDataToExcel,
};
