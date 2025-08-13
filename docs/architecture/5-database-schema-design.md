# 5. Database Schema Design

## 5.1 Core Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Database Schema                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │     users       │         │     rules       │                │
│  │─────────────────│         │─────────────────│                │
│  │ id (PK)         │◄────────┤ id (PK)         │                │
│  │ email           │         │ user_id (FK)    │                │
│  │ gmail_id        │         │ name            │                │
│  │ access_token    │         │ type            │                │
│  │ refresh_token   │         │ sender_rules    │                │
│  │ phone_number    │         │ content_rules   │                │
│  │ phone_verified  │         │ is_active       │                │
│  │ created_at      │         │ created_at      │                │
│  │ updated_at      │         │ updated_at      │                │
│  └─────────────────┘         └─────────────────┘                │
│                                       │                         │
│                                       │                         │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │ notifications   │         │   rule_logs     │                │
│  │─────────────────│         │─────────────────│                │
│  │ id (PK)         │         │ id (PK)         │                │
│  │ user_id (FK)    │────────►│ rule_id (FK)    │◄──────────────┐ │
│  │ rule_id (FK)    │         │ email_id        │               │ │
│  │ email_id        │         │ matched         │               │ │
│  │ message_text    │         │ reasons         │               │ │
│  │ delivery_status │         │ processed_at    │               │ │
│  │ whatsapp_id     │         └─────────────────┘               │ │
│  │ sent_at         │                                           │ │
│  │ delivered_at    │                                           │ │
│  │ failed_reason   │                                           │ │
│  └─────────────────┘                                           │ │
│                                                                 │ │
│  ┌─────────────────┐                                           │ │
│  │   user_sessions │                                           │ │
│  │─────────────────│                                           │ │
│  │ id (PK)         │                                           │ │
│  │ user_id (FK)    │───────────────────────────────────────────┘ │
│  │ session_token   │                                             │
│  │ expires_at      │                                             │
│  │ created_at      │                                             │
│  └─────────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 5.2 Database Schema Implementation

```sql
-- Users table with encrypted token storage
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  gmail_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,  -- AES-256 encrypted
  refresh_token TEXT NOT NULL, -- AES-256 encrypted
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  webhook_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring rules with JSON storage for flexibility
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'sender', 'content', 'combined'
  
  -- JSON fields for flexible rule definitions
  sender_rules JSONB, -- {emails: [], domains: [], patterns: []}
  content_rules JSONB, -- {subjects: [], keywords: [], urgency: []}
  
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1, -- 1-5 scale
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_rules_user_id (user_id),
  INDEX idx_rules_active (is_active),
  INDEX idx_rules_sender_rules USING GIN (sender_rules),
  INDEX idx_rules_content_rules USING GIN (content_rules)
);

-- Notification delivery log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  
  -- Email context (not storing actual content)
  email_id VARCHAR(255) NOT NULL, -- Gmail message ID
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Notification details
  message_text TEXT NOT NULL,
  urgency_level VARCHAR(20) NOT NULL,
  extracted_deadline TIMESTAMP WITH TIME ZONE,
  keyword_matches TEXT[],
  
  -- Delivery tracking
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  whatsapp_message_id VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_status (delivery_status),
  INDEX idx_notifications_sent_at (sent_at),
  INDEX idx_notifications_email_id (email_id)
);

-- Rule execution logs for debugging and analytics
CREATE TABLE rule_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  email_id VARCHAR(255) NOT NULL,
  matched BOOLEAN NOT NULL,
  reasons TEXT[], -- Why it matched or didn't match
  processing_time_ms INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_rule_logs_rule_id (rule_id),
  INDEX idx_rule_logs_processed_at (processed_at)
);

-- User sessions for authentication
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_user_id (user_id)
);

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every hour
SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');
```

## 5.3 Data Migration Strategy

```typescript
// Database migration system
interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class DatabaseMigrator {
  private migrations: Migration[] = [
    {
      version: '001',
      description: 'Initial schema',
      up: async () => {
        // Create initial tables
        await this.db.query(initialSchemaSQL);
      },
      down: async () => {
        await this.db.query('DROP TABLE IF EXISTS notifications, rule_logs, rules, user_sessions, users CASCADE;');
      }
    },
    {
      version: '002',
      description: 'Add encryption for tokens',
      up: async () => {
        // Migrate existing tokens to encrypted format
        await this.encryptExistingTokens();
      },
      down: async () => {
        // Decrypt tokens back to plain text
        await this.decryptTokens();
      }
    }
  ];
  
  async migrate(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(
      m => m.version > currentVersion
    );
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      await migration.up();
      await this.updateVersion(migration.version);
    }
  }
}
```

---
