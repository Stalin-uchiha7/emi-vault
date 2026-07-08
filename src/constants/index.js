// ============================================================================
// Centralized constants used across the app
// ============================================================================

export const LOAN_CATEGORIES = [
  'Home Loan',
  'Car Loan',
  'Personal Loan',
  'Gold Loan',
  'Education Loan',
  'Credit Card EMI',
  'Other',
];

export const CATEGORY_COLORS = {
  'Home Loan': '#6366F1',
  'Car Loan': '#F59E0B',
  'Personal Loan': '#10B981',
  'Gold Loan': '#EAB308',
  'Education Loan': '#3B82F6',
  'Credit Card EMI': '#EF4444',
  Other: '#8B5CF6',
};

export const LOAN_STATUS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  OVERDUE: 'Overdue',
  UPCOMING: 'Upcoming Due',
};

export const STATUS_COLORS = {
  Active: '#10B981',
  Closed: '#6B7280',
  Overdue: '#EF4444',
  'Upcoming Due': '#F59E0B',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee (INR)' },
  USD: { symbol: '$', label: 'US Dollar (USD)' },
  EUR: { symbol: '€', label: 'Euro (EUR)' },
  GBP: { symbol: '£', label: 'British Pound (GBP)' },
};

export const PAYMENT_FREQUENCIES = ['Monthly', 'Quarterly', 'Yearly'];

export const NOTIFICATION_TYPES = {
  UPCOMING_7_DAYS: 'upcoming_7_days',
  DUE_TOMORROW: 'due_tomorrow',
  OVERDUE: 'overdue',
  LOAN_COMPLETED: 'loan_completed',
};

export const COLLECTIONS = {
  USERS: 'users',
  LOANS: 'loans',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
};
