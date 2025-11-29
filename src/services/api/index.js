/**
 * API Module Index
 * Re-exports all API modules for convenient importing
 */

// Auth
export { authAPI } from './auth';

// Core Data
export { receiptsAPI } from './receipts';
export { budgetsAPI } from './budgets';
export { accountsAPI, banksAPI } from './accounts';

// Tax
export { taxAPI, deductionAPI } from './tax';

// Gamification
export { challengesAPI, missionsAPI, attendanceAPI } from './challenges';
export { rewardsAPI, rewardsProductAPI, leaderboardAPI, gamificationAPI } from './rewards';

// Insights & Notifications
export { insightsAPI } from './insights';
export { notificationsAPI, notificationCenterAPI } from './notifications';

// Community
export { communityAPI, expertsAPI, productsAPI } from './community';

// Misc
export { eventsAPI, documentFoldersAPI, bankDummyTransactionsAPI, autoTransactionsAPI } from './misc';

// Re-export supabase client for direct access if needed
export { supabase } from './apiClient';
