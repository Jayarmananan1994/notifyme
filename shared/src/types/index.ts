// User types
export interface User {
  id: string;
  email: string;
  gmailConnected: boolean;
  whatsappNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email types
export interface EmailMessage {
  id: string;
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  snippet: string;
  received: Date;
  read: boolean;
  labels: string[];
}

// Notification types
export interface NotificationRule {
  id: string;
  userId: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: 'sender' | 'subject' | 'content';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  value: string;
}

export interface RuleAction {
  type: 'whatsapp';
  template: string;
  enabled: boolean;
}

// Health check types
export interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  services?: {
    database: 'connected' | 'disconnected';
    gmail: 'connected' | 'disconnected';
    whatsapp: 'connected' | 'disconnected';
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}