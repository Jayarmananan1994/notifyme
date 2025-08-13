# 9. Error Handling and Reliability Patterns

## 9.1 Circuit Breaker Pattern for External APIs

```typescript
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime?: Date;
  successCount: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    successCount: 0
  };
  
  constructor(
    private name: string,
    private failureThreshold: number = 5,
    private recoveryTimeMs: number = 60000,
    private successThreshold: number = 3
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new Error(`Circuit breaker [${this.name}] is open`);
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private isCircuitOpen(): boolean {
    if (!this.state.isOpen) return false;
    
    const now = new Date();
    const timeSinceLastFailure = now.getTime() - (this.state.lastFailureTime?.getTime() || 0);
    
    if (timeSinceLastFailure >= this.recoveryTimeMs) {
      this.state.isOpen = false;
      this.state.successCount = 0;
      return false;
    }
    
    return true;
  }
  
  private onSuccess(): void {
    this.state.successCount++;
    
    if (this.state.isOpen && this.state.successCount >= this.successThreshold) {
      this.state.isOpen = false;
      this.state.failureCount = 0;
    }
  }
  
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();
    
    if (this.state.failureCount >= this.failureThreshold) {
      this.state.isOpen = true;
    }
  }
  
  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Usage with external APIs
class ReliableGmailClient {
  private circuitBreaker = new CircuitBreaker('gmail-api', 5, 60000);
  
  async fetchEmails(userId: string): Promise<Email[]> {
    return this.circuitBreaker.execute(async () => {
      const tokens = await this.getTokens(userId);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 50,
        q: 'is:unread'
      });
      
      return response.data.messages || [];
    });
  }
}
```

## 9.2 Retry Logic with Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs?: number;
}

class RetryManager {
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterMs: 100
  };
  
  async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === finalConfig.maxRetries) {
          break; // Don't delay on final attempt
        }
        
        if (!this.isRetryableError(error)) {
          throw error; // Don't retry non-retryable errors
        }
        
        const delay = this.calculateDelay(attempt, finalConfig);
        await this.sleep(delay);
      }
    }
    
    throw new RetryExhaustedError(
      `Operation failed after ${finalConfig.maxRetries + 1} attempts`,
      lastError
    );
  }
  
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
    
    // Add jitter to prevent thundering herd
    const jitter = config.jitterMs ? Math.random() * config.jitterMs : 0;
    
    return cappedDelay + jitter;
  }
  
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and 5xx HTTP errors are retryable
    const retryableHttpCodes = [408, 429, 500, 502, 503, 504];
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    if (error.response && retryableHttpCodes.includes(error.response.status)) {
      return true;
    }
    
    return false;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class RetryExhaustedError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
    this.name = 'RetryExhaustedError';
  }
}
```

## 9.3 Health Check and Monitoring

```typescript
interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  details?: any;
  timestamp: Date;
  responseTime: number;
}

interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: Date;
  uptime: number;
}

class HealthCheckService {
  private startTime = new Date();
  
  async performHealthCheck(): Promise<SystemHealth> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkGmailAPI(),
      this.checkWhatsAppAPI(),
      this.checkRedis()
    ]);
    
    const healthChecks: HealthCheck[] = checks.map((result, index) => {
      const names = ['database', 'gmail-api', 'whatsapp-api', 'redis'];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: names[index],
          status: 'unhealthy',
          details: result.reason.message,
          timestamp: new Date(),
          responseTime: 0
        };
      }
    });
    
    const overallStatus = this.calculateOverallStatus(healthChecks);
    const uptime = Date.now() - this.startTime.getTime();
    
    return {
      status: overallStatus,
      checks: healthChecks,
      timestamp: new Date(),
      uptime
    };
  }
  
  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      await this.db.query('SELECT 1');
      
      return {
        name: 'database',
        status: 'healthy',
        timestamp: new Date(),
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        details: error.message,
        timestamp: new Date(),
        responseTime: Date.now() - start
      };
    }
  }
  
  private async checkGmailAPI(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Simple API call to check connectivity
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { 'Authorization': `Bearer ${this.testToken}` }
      });
      
      const status = response.status < 500 ? 'healthy' : 'degraded';
      
      return {
        name: 'gmail-api',
        status,
        details: { httpStatus: response.status },
        timestamp: new Date(),
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        name: 'gmail-api',
        status: 'unhealthy',
        details: error.message,
        timestamp: new Date(),
        responseTime: Date.now() - start
      };
    }
  }
  
  private calculateOverallStatus(checks: HealthCheck[]): SystemHealth['status'] {
    const criticalServices = ['database'];
    const hasCriticalFailure = checks.some(
      check => criticalServices.includes(check.name) && check.status === 'unhealthy'
    );
    
    if (hasCriticalFailure) return 'unhealthy';
    
    const hasAnyFailure = checks.some(check => check.status === 'unhealthy');
    const hasAnyDegradation = checks.some(check => check.status === 'degraded');
    
    if (hasAnyFailure || hasAnyDegradation) return 'degraded';
    
    return 'healthy';
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheckService.performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date()
    });
  }
});
```

---
