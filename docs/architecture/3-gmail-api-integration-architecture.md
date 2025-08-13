# 3. Gmail API Integration Architecture

## 3.1 OAuth 2.0 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Gmail OAuth Integration                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Browser          NotifyMe Backend         Google OAuth    │
│       │                       │                       │         │
│       │  1. Login Request     │                       │         │
│       │──────────────────────►│                       │         │
│       │                       │                       │         │
│       │                       │ 2. Redirect to OAuth  │         │
│       │                       │──────────────────────►│         │
│       │                       │                       │         │
│       │      3. User Consent  │                       │         │
│       │◄─────────────────────────────────────────────►│         │
│       │                       │                       │         │
│       │                       │ 4. Auth Code          │         │
│       │                       │◄──────────────────────│         │
│       │                       │                       │         │
│       │                       │ 5. Exchange for       │         │
│       │                       │    Tokens             │         │
│       │                       │──────────────────────►│         │
│       │                       │                       │         │
│       │                       │ 6. Access & Refresh   │         │
│       │                       │    Tokens             │         │
│       │                       │◄──────────────────────│         │
│       │                       │                       │         │
│       │  7. Success Response  │                       │         │
│       │◄──────────────────────│                       │         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 Real-time Email Monitoring via Webhooks

```
┌─────────────────────────────────────────────────────────────────┐
│                   Gmail Webhook Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Gmail Server         NotifyMe Backend        Message Queue    │
│       │                       │                       │         │
│       │                       │ 1. Subscribe to       │         │
│       │                       │    Push Notifications │         │
│       │◄──────────────────────│                       │         │
│       │                       │                       │         │
│       │ 2. New Email Arrives  │                       │         │
│       │                       │                       │         │
│       │ 3. Push Notification  │                       │         │
│       │──────────────────────►│                       │         │
│       │                       │                       │         │
│       │                       │ 4. Verify Signature   │         │
│       │                       │                       │         │
│       │                       │ 5. Queue Processing   │         │
│       │                       │──────────────────────►│         │
│       │                       │                       │         │
│       │ 6. Fetch Email        │                       │         │
│       │    Metadata           │                       │         │
│       │◄──────────────────────│                       │         │
│       │                       │                       │         │
│       │ 7. Email Details      │                       │         │
│       │──────────────────────►│                       │         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.3 Rate Limiting and Error Handling

```typescript
// Gmail API Rate Limiting Configuration
interface GmailRateLimits {
  maxQueriesPerUser: 250;        // per 100 seconds
  maxQueriesPerProject: 1000000; // per day
  batchSize: 100;                // emails per batch request
}

// Rate limiting implementation
class GmailRateLimiter {
  private userQuotaCache = new Map<string, number>();
  
  async checkUserQuota(userId: string): Promise<boolean> {
    const used = this.userQuotaCache.get(userId) || 0;
    return used < 250;
  }
  
  async incrementUserQuota(userId: string): Promise<void> {
    const current = this.userQuotaCache.get(userId) || 0;
    this.userQuotaCache.set(userId, current + 1);
    
    // Reset after 100 seconds
    setTimeout(() => {
      this.userQuotaCache.delete(userId);
    }, 100000);
  }
}

// Exponential backoff for API failures
class GmailAPIClient {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---
