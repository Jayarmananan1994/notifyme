# 10. Performance Optimization Strategies

## 10.1 Database Query Optimization

```sql
-- Optimized queries with proper indexing
-- Index on user_id for rule lookups
CREATE INDEX CONCURRENTLY idx_rules_user_active 
ON rules (user_id, is_active) 
WHERE is_active = true;

-- Composite index for notification queries
CREATE INDEX CONCURRENTLY idx_notifications_user_status_sent 
ON notifications (user_id, delivery_status, sent_at DESC);

-- Partial index for failed notifications
CREATE INDEX CONCURRENTLY idx_notifications_failed 
ON notifications (user_id, created_at) 
WHERE delivery_status = 'failed';

-- GIN index for JSON rule matching
CREATE INDEX CONCURRENTLY idx_rules_sender_gin 
ON rules USING GIN (sender_rules) 
WHERE sender_rules IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_rules_content_gin 
ON rules USING GIN (content_rules) 
WHERE content_rules IS NOT NULL;
```

```typescript
// Optimized database queries
class OptimizedRuleService {
  async findMatchingRules(userId: string, emailContext: EmailContext): Promise<Rule[]> {
    // Single query to get all active rules with relevant fields
    const query = `
      SELECT id, name, type, sender_rules, content_rules, priority
      FROM rules 
      WHERE user_id = $1 
        AND is_active = true
      ORDER BY priority DESC, created_at ASC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows.map(row => this.mapToRule(row));
  }
  
  async getUserNotificationsSummary(userId: string): Promise<NotificationSummary> {
    // Optimized query with aggregation
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE delivery_status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE delivery_status = 'failed') as failed,
        COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '7 days') as last_7d
      FROM notifications 
      WHERE user_id = $1
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows[0];
  }
  
  // Batch processing for multiple email checks
  async processEmailBatch(emails: EmailContext[]): Promise<ProcessingResult[]> {
    const userRulesCache = new Map<string, Rule[]>();
    const results: ProcessingResult[] = [];
    
    for (const email of emails) {
      // Cache user rules to avoid repeated DB queries
      if (!userRulesCache.has(email.userId)) {
        const rules = await this.findMatchingRules(email.userId, email);
        userRulesCache.set(email.userId, rules);
      }
      
      const rules = userRulesCache.get(email.userId)!;
      const matchedRules = this.evaluateRules(rules, email);
      
      results.push({
        emailId: email.id,
        userId: email.userId,
        matchedRules,
        processed: true
      });
    }
    
    return results;
  }
}
```

## 10.2 Caching Strategy

```typescript
interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  keyPrefix: string;
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private redisCache?: Redis;
  
  constructor(private config: CacheConfig, redisUrl?: string) {
    if (redisUrl) {
      this.redisCache = new Redis(redisUrl);
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    
    // Try memory cache first (fastest)
    const memoryItem = this.memoryCache.get(fullKey);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.value;
    }
    
    // Try Redis cache if available
    if (this.redisCache) {
      const redisValue = await this.redisCache.get(fullKey);
      if (redisValue) {
        const parsed = JSON.parse(redisValue);
        // Store in memory cache for faster future access
        this.setMemoryCache(fullKey, parsed);
        return parsed;
      }
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    
    // Set in memory cache
    this.setMemoryCache(fullKey, value);
    
    // Set in Redis cache if available
    if (this.redisCache) {
      await this.redisCache.setex(
        fullKey, 
        this.config.ttl, 
        JSON.stringify(value)
      );
    }
  }
  
  private setMemoryCache<T>(key: string, value: T): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.config.maxSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  private isExpired(item: CacheItem): boolean {
    return (Date.now() - item.timestamp) > (this.config.ttl * 1000);
  }
}

// Cache implementation for different data types
class ServiceCaches {
  private userRulesCache = new CacheManager(
    { ttl: 300, maxSize: 1000, keyPrefix: 'user_rules' }, // 5 minutes
    process.env.REDIS_URL
  );
  
  private gmailTokensCache = new CacheManager(
    { ttl: 3300, maxSize: 500, keyPrefix: 'gmail_tokens' }, // 55 minutes (tokens expire in 1 hour)
    process.env.REDIS_URL
  );
  
  async getUserRules(userId: string): Promise<Rule[] | null> {
    return this.userRulesCache.get(userId);
  }
  
  async setUserRules(userId: string, rules: Rule[]): Promise<void> {
    await this.userRulesCache.set(userId, rules);
  }
  
  async getGmailTokens(userId: string): Promise<TokenSet | null> {
    return this.gmailTokensCache.get(userId);
  }
  
  async setGmailTokens(userId: string, tokens: TokenSet): Promise<void> {
    await this.gmailTokensCache.set(userId, tokens);
  }
  
  // Invalidate cache when data changes
  async invalidateUserRules(userId: string): Promise<void> {
    await this.userRulesCache.delete(userId);
  }
}
```

## 10.3 Message Queue Implementation

```typescript
interface QueueJob {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: Date;
  processAt: Date;
}

interface QueueConfig {
  maxConcurrency: number;
  defaultJobOptions: {
    maxAttempts: number;
    backoffType: 'exponential' | 'linear';
    backoffDelay: number;
  };
}

class MessageQueue {
  private jobs: QueueJob[] = [];
  private processing = false;
  private activeJobs = 0;
  
  constructor(private config: QueueConfig) {}
  
  async add(type: string, data: any, options?: Partial<QueueJob>): Promise<string> {
    const job: QueueJob = {
      id: generateId(),
      type,
      data,
      attempts: 0,
      maxAttempts: options?.maxAttempts || this.config.defaultJobOptions.maxAttempts,
      createdAt: new Date(),
      processAt: new Date(Date.now() + (options?.delay || 0)),
      ...options
    };
    
    this.jobs.push(job);
    this.startProcessing();
    
    return job.id;
  }
  
  private async startProcessing(): Promise<void> {
    if (this.processing || this.activeJobs >= this.config.maxConcurrency) {
      return;
    }
    
    this.processing = true;
    
    while (this.jobs.length > 0 && this.activeJobs < this.config.maxConcurrency) {
      const job = this.getNextJob();
      if (job) {
        this.processJob(job);
      } else {
        break; // No jobs ready to process
      }
    }
    
    this.processing = false;
  }
  
  private getNextJob(): QueueJob | null {
    const now = new Date();
    const index = this.jobs.findIndex(job => job.processAt <= now);
    
    if (index === -1) return null;
    
    return this.jobs.splice(index, 1)[0];
  }
  
  private async processJob(job: QueueJob): Promise<void> {
    this.activeJobs++;
    
    try {
      await this.executeJob(job);
      console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      await this.handleJobFailure(job, error as Error);
    } finally {
      this.activeJobs--;
      this.startProcessing(); // Process next job
    }
  }
  
  private async executeJob(job: QueueJob): Promise<void> {
    switch (job.type) {
      case 'send-notification':
        await this.sendNotification(job.data);
        break;
      case 'process-email':
        await this.processEmail(job.data);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }
  
  private async handleJobFailure(job: QueueJob, error: Error): Promise<void> {
    job.attempts++;
    
    if (job.attempts < job.maxAttempts) {
      // Schedule retry with backoff
      const delay = this.calculateBackoffDelay(job.attempts);
      job.processAt = new Date(Date.now() + delay);
      
      this.jobs.push(job);
      console.log(`Job ${job.id} failed, retry ${job.attempts}/${job.maxAttempts} in ${delay}ms`);
    } else {
      console.error(`Job ${job.id} failed permanently:`, error);
      await this.handlePermanentFailure(job, error);
    }
  }
  
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = this.config.defaultJobOptions.backoffDelay;
    
    if (this.config.defaultJobOptions.backoffType === 'exponential') {
      return baseDelay * Math.pow(2, attempt - 1);
    } else {
      return baseDelay * attempt;
    }
  }
  
  private async sendNotification(data: NotificationJob): Promise<void> {
    const whatsappService = new WhatsAppService();
    await whatsappService.sendMessage(data.recipient, data.message);
  }
  
  private async processEmail(data: EmailJob): Promise<void> {
    const emailService = new EmailProcessingService();
    await emailService.processNewEmail(data.emailId, data.userId);
  }
}

// Usage in email webhook handler
class EmailWebhookHandler {
  private messageQueue = new MessageQueue({
    maxConcurrency: 5,
    defaultJobOptions: {
      maxAttempts: 3,
      backoffType: 'exponential',
      backoffDelay: 1000
    }
  });
  
  async handleEmailNotification(notification: GmailNotification): Promise<void> {
    // Queue email processing instead of processing synchronously
    await this.messageQueue.add('process-email', {
      emailId: notification.emailId,
      userId: notification.userId
    });
    
    // Return immediately to Gmail webhook
  }
}
```

---
