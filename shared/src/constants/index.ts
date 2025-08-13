// API Constants
export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: '/auth',
  USERS: '/users',
  EMAILS: '/emails',
  RULES: '/rules',
  NOTIFICATIONS: '/notifications',
} as const;

// Gmail API Constants
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
] as const;

// WhatsApp Business API Constants
export const WHATSAPP_API = {
  BASE_URL: 'https://graph.facebook.com/v18.0',
  ENDPOINTS: {
    MESSAGES: '/messages',
    WEBHOOKS: '/webhooks',
  },
} as const;

// Application Constants
export const APP_CONFIG = {
  NAME: 'NotifyMe',
  VERSION: '1.0.0',
  DESCRIPTION: 'Intelligent email monitoring system with WhatsApp notifications',
  MAX_RULES_PER_USER: 10,
  MAX_EMAIL_FETCH_LIMIT: 100,
} as const;

// Environment Constants
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_FOUND: 'Email not found',
  RULE_NOT_FOUND: 'Rule not found',
  GMAIL_NOT_CONNECTED: 'Gmail account not connected',
  WHATSAPP_NOT_CONFIGURED: 'WhatsApp not configured',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  RULE_CREATED: 'Rule created successfully',
  RULE_UPDATED: 'Rule updated successfully',
  RULE_DELETED: 'Rule deleted successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
} as const;