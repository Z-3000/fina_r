/**
 * PDF 및 Excel 내보내기 서비스
 * - PDF: jsPDF + jspdf-autotable (안정적)
 * - Excel: xlsx + file-saver
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// =============================================
// PDF 리포트 생성
// =============================================

/**
 * 월별 지출 리포트 PDF 생성
 */
export const generateMonthlyExpenseReport = async ({
  receipts = [],
  budgets = {},
  stats = {},
  userProfile = {},
  month = new Date().toISOString().slice(0, 7),
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 제목 (영문 사용 - 한글 폰트 문제 방지)
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('Monthly Expense Report', pageWidth / 2, 20, { align: 'center' });

    // 부제목
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${month} | ${userProfile?.name || 'User'}`, pageWidth / 2, 28, { align: 'center' });

    // 구분선
    doc.setDrawColor(200);
    doc.line(20, 32, pageWidth - 20, 32);

    // 요약 테이블
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 20, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Item', 'Amount']],
      body: [
        ['Total Spent', `${(stats?.totalSpent || 0).toLocaleString()} KRW`],
        ['Total Budget', `${(stats?.totalBudget || 0).toLocaleString()} KRW`],
        ['Remaining', `${(stats?.budgetRemaining || 0).toLocaleString()} KRW`],
        ['Transactions', `${stats?.receiptCount || 0}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    // 카테고리별 지출
    const categoryY = doc.lastAutoTable.finalY + 15;
    doc.text('By Category', 20, categoryY);

    const categoryData = (stats?.budgetUsage || []).map(item => [
      item.category || '',
      `${(item.spent || 0).toLocaleString()}`,
      `${(item.budget || 0).toLocaleString()}`,
      `${item.percentage || 0}%`,
    ]);

    if (categoryData.length > 0) {
      autoTable(doc, {
        startY: categoryY + 4,
        head: [['Category', 'Spent', 'Budget', 'Usage']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 },
      });
    }

    // 거래 내역
    const transactionY = (doc.lastAutoTable?.finalY || categoryY) + 15;
    doc.text('Recent Transactions', 20, transactionY);

    const transactionData = (receipts || []).slice(0, 15).map(r => [
      r.date?.slice(0, 10) || '',
      r.merchant || '',
      r.category || '',
      `${(r.amount || 0).toLocaleString()}`,
    ]);

    if (transactionData.length > 0) {
      autoTable(doc, {
        startY: transactionY + 4,
        head: [['Date', 'Merchant', 'Category', 'Amount']],
        body: transactionData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 20, right: 20 },
      });
    }

    // 푸터
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString()} | FINA_R`, pageWidth / 2, footerY, { align: 'center' });

    // 저장
    const fileName = `MonthlyReport_${month}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed: ' + error.message);
  }
};

/**
 * 연말정산 예상 리포트 PDF 생성
 */
export const generateYearEndTaxReport = async ({
  taxResult = {},
  deductions = {},
  userProfile = {},
  year = new Date().getFullYear(),
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 제목
    doc.setFontSize(18);
    doc.setTextColor(239, 68, 68);
    doc.text(`${year} Tax Estimation Report`, pageWidth / 2, 20, { align: 'center' });

    // 부제목
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${userProfile?.name || 'User'}'s Tax Analysis`, pageWidth / 2, 28, { align: 'center' });

    // 구분선
    doc.setDrawColor(200);
    doc.line(20, 32, pageWidth - 20, 32);

    // 소득 정보
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Income Information', 20, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Item', 'Amount (KRW)']],
      body: [
        ['Annual Income', (taxResult?.annualIncome || 0).toLocaleString()],
        ['Earned Income Deduction', (taxResult?.earnedIncomeDeduction || 0).toLocaleString()],
        ['Taxable Earned Income', (taxResult?.earnedIncome || 0).toLocaleString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    // 공제 정보
    const deductionY = doc.lastAutoTable.finalY + 15;
    doc.text('Deductions', 20, deductionY);

    autoTable(doc, {
      startY: deductionY + 4,
      head: [['Deduction Type', 'Amount (KRW)']],
      body: [
        ['Personal Deductions', (taxResult?.personalDeductions || 0).toLocaleString()],
        ['Special Deductions', (taxResult?.specialDeductions || 0).toLocaleString()],
        ['Tax Credits', (taxResult?.taxCredits || 0).toLocaleString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: 20, right: 20 },
    });

    // 세금 계산
    const taxY = doc.lastAutoTable.finalY + 15;
    doc.text('Tax Calculation', 20, taxY);

    autoTable(doc, {
      startY: taxY + 4,
      head: [['Item', 'Amount (KRW)']],
      body: [
        ['Taxable Income', (taxResult?.taxableIncome || 0).toLocaleString()],
        ['Calculated Tax', (taxResult?.calculatedTax || 0).toLocaleString()],
        ['Final Tax', (taxResult?.finalTax || 0).toLocaleString()],
        ['Local Tax', (taxResult?.localTax || 0).toLocaleString()],
        ['Total Estimated Tax', (taxResult?.totalTax || 0).toLocaleString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 20, right: 20 },
    });

    // 실효세율 박스
    const effectiveY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(254, 243, 199);
    doc.rect(20, effectiveY, pageWidth - 40, 20, 'F');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Effective Tax Rate: ${taxResult?.effectiveRate || 0}%`, pageWidth / 2, effectiveY + 8, { align: 'center' });
    doc.text(`Monthly Tax: ${(taxResult?.monthlyTax || 0).toLocaleString()} KRW`, pageWidth / 2, effectiveY + 15, { align: 'center' });

    // 푸터
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString()} | FINA_R - For reference only`, pageWidth / 2, footerY, { align: 'center' });

    // 저장
    const fileName = `TaxReport_${year}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed: ' + error.message);
  }
};

/**
 * 세금 건강 리포트 PDF 생성
 */
export const generateTaxHealthReport = async ({
  taxHealthScore = 0,
  deductionTracker = {},
  userProfile = {},
  recommendations = [],
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 제목
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('Tax Health Score Report', pageWidth / 2, 20, { align: 'center' });

    // 구분선
    doc.setDrawColor(200);
    doc.line(20, 25, pageWidth - 20, 25);

    // 점수 표시
    doc.setFontSize(48);
    const scoreColor = taxHealthScore >= 70 ? [16, 185, 129] : [245, 158, 11];
    doc.setTextColor(...scoreColor);
    doc.text(`${taxHealthScore}`, pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    const scoreLabel = taxHealthScore >= 90 ? 'Excellent' : taxHealthScore >= 70 ? 'Good' : taxHealthScore >= 50 ? 'Average' : 'Needs Improvement';
    doc.text(scoreLabel, pageWidth / 2, 58, { align: 'center' });

    // 공제 현황
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Deduction Status', 20, 75);

    const deductionData = Object.entries(deductionTracker || {}).map(([key, item]) => {
      const current = item?.current || 0;
      const max = item?.maxDeduction || 1;
      return [
        item?.name || key,
        current.toLocaleString(),
        max.toLocaleString(),
        `${Math.round((current / max) * 100)}%`,
      ];
    });

    if (deductionData.length > 0) {
      autoTable(doc, {
        startY: 79,
        head: [['Item', 'Current', 'Limit', 'Usage']],
        body: deductionData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 20, right: 20 },
      });
    }

    // 개선 제안
    if (recommendations && recommendations.length > 0) {
      const recY = (doc.lastAutoTable?.finalY || 79) + 15;
      doc.text('Recommendations', 20, recY);

      const recData = recommendations.map((rec, idx) => [
        `${idx + 1}`,
        rec?.title || '',
        rec?.description || '',
        `+${rec?.expectedPoints || 0}`,
      ]);

      autoTable(doc, {
        startY: recY + 4,
        head: [['#', 'Title', 'Description', 'Points']],
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
    doc.text(`Generated: ${new Date().toLocaleString()} | FINA_R`, pageWidth / 2, footerY, { align: 'center' });

    // 저장
    const fileName = `TaxHealth_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed: ' + error.message);
  }
};

// =============================================
// Excel 내보내기
// =============================================

/**
 * 거래 내역 Excel 내보내기
 */
export const exportReceiptsToExcel = (receipts = [], fileName = 'Transactions') => {
  try {
    const data = (receipts || []).map(r => ({
      'Date': r?.date?.slice(0, 10) || '',
      'Merchant': r?.merchant || '',
      'Category': r?.category || '',
      'Amount': r?.amount || 0,
      'Tax': r?.tax || 0,
      'Notes': r?.notes || '',
      'Payment': r?.paymentMethod || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
    ];

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fullFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fullFileName);
    return fullFileName;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed: ' + error.message);
  }
};

/**
 * 예산 현황 Excel 내보내기
 */
export const exportBudgetToExcel = (budgetUsage = [], fileName = 'Budget') => {
  try {
    const data = (budgetUsage || []).map(item => ({
      'Category': item?.category || '',
      'Budget': item?.budget || 0,
      'Spent': item?.spent || 0,
      'Remaining': (item?.budget || 0) - (item?.spent || 0),
      'Usage(%)': item?.percentage || 0,
      'Status': (item?.spent || 0) > (item?.budget || 0) ? 'Over' : 'OK',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Budget');

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
    const fullFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fullFileName);
    return fullFileName;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed: ' + error.message);
  }
};

/**
 * 연말정산 데이터 Excel 내보내기
 */
export const exportTaxDataToExcel = (taxResult = {}, deductions = {}, fileName = 'TaxData') => {
  try {
    const tr = taxResult || {};

    const incomeData = [
      { 'Item': 'Annual Income', 'Amount': tr.annualIncome || 0 },
      { 'Item': 'Earned Income Deduction', 'Amount': tr.earnedIncomeDeduction || 0 },
      { 'Item': 'Taxable Earned Income', 'Amount': tr.earnedIncome || 0 },
      { 'Item': 'Taxable Income', 'Amount': tr.taxableIncome || 0 },
      { 'Item': 'Calculated Tax', 'Amount': tr.calculatedTax || 0 },
      { 'Item': 'Final Tax', 'Amount': tr.finalTax || 0 },
      { 'Item': 'Local Tax', 'Amount': tr.localTax || 0 },
      { 'Item': 'Total Tax', 'Amount': tr.totalTax || 0 },
    ];

    const deductionData = [
      { 'Deduction': 'Personal', 'Amount': tr.personalDeductions || 0 },
      { 'Deduction': 'Special', 'Amount': tr.specialDeductions || 0 },
      { 'Deduction': 'Tax Credits', 'Amount': tr.taxCredits || 0 },
      { 'Deduction': 'Earned Income Credit', 'Amount': tr.earnedIncomeTaxCredit || 0 },
    ];

    const wb = XLSX.utils.book_new();

    const wsIncome = XLSX.utils.json_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

    const wsDeduction = XLSX.utils.json_to_sheet(deductionData);
    XLSX.utils.book_append_sheet(wb, wsDeduction, 'Deductions');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fullFileName = `${fileName}_${new Date().getFullYear()}.xlsx`;
    saveAs(blob, fullFileName);
    return fullFileName;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed: ' + error.message);
  }
};

/**
 * 종합 데이터 Excel 내보내기 (모든 시트 포함)
 */
export const exportAllDataToExcel = ({
  receipts = [],
  budgetUsage = [],
  taxResult = {},
  deductionTracker = {},
  fileName = 'FINA_R_Data',
}) => {
  try {
    const wb = XLSX.utils.book_new();
    const tr = taxResult || {};
    const dt = deductionTracker || {};

    // 1. 거래내역 시트
    const receiptData = (receipts || []).map(r => ({
      'Date': r?.date?.slice(0, 10) || '',
      'Merchant': r?.merchant || '',
      'Category': r?.category || '',
      'Amount': r?.amount || 0,
      'Tax': r?.tax || 0,
    }));
    const wsReceipts = XLSX.utils.json_to_sheet(receiptData);
    XLSX.utils.book_append_sheet(wb, wsReceipts, 'Transactions');

    // 2. 예산현황 시트
    const budgetData = (budgetUsage || []).map(item => ({
      'Category': item?.category || '',
      'Budget': item?.budget || 0,
      'Spent': item?.spent || 0,
      'Usage': `${item?.percentage || 0}%`,
    }));
    const wsBudget = XLSX.utils.json_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget');

    // 3. 공제현황 시트
    const deductionData = Object.entries(dt).map(([key, item]) => {
      const current = item?.current || 0;
      const max = item?.maxDeduction || 1;
      return {
        'Item': item?.name || key,
        'Current': current,
        'Limit': max,
        'Usage': `${Math.round((current / max) * 100)}%`,
      };
    });
    const wsDeduction = XLSX.utils.json_to_sheet(deductionData);
    XLSX.utils.book_append_sheet(wb, wsDeduction, 'Deductions');

    // 4. 세금요약 시트
    const taxData = [
      { 'Item': 'Annual Income', 'Value': tr.annualIncome || 0 },
      { 'Item': 'Taxable Income', 'Value': tr.taxableIncome || 0 },
      { 'Item': 'Final Tax', 'Value': tr.finalTax || 0 },
      { 'Item': 'Total Tax', 'Value': tr.totalTax || 0 },
      { 'Item': 'Effective Rate', 'Value': `${tr.effectiveRate || 0}%` },
    ];
    const wsTax = XLSX.utils.json_to_sheet(taxData);
    XLSX.utils.book_append_sheet(wb, wsTax, 'TaxSummary');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fullFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fullFileName);
    return fullFileName;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed: ' + error.message);
  }
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
