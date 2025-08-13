# 11. Monitoring and Analytics

## 11.1 Application Performance Monitoring

```typescript
interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels?: Record<string, string>;
}

interface PerformanceTimer {
  name: string;
  start: number;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private timers = new Map<string, PerformanceTimer>();
  private metrics: Metric[] = [];
  
  // Counter metrics
  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.addMetric(name, value, 'count', labels);
  }
  
  // Gauge metrics
  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.addMetric(name, value, 'gauge', labels);
  }
  
  // Histogram/Timer metrics
  startTimer(name: string, labels?: Record<string, string>): string {
    const timerId = generateId();
    this.timers.set(timerId, {
      name,
      start: performance.now(),
      labels
    });
    return timerId;
  }
  
  endTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer) return;
    
    const duration = performance.now() - timer.start;
    this.addMetric(timer.name, duration, 'ms', timer.labels);
    this.timers.delete(timerId);
  }
  
  // Convenience method for timing functions
  async time<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T> {
    const timerId = this.startTimer(name, labels);
    try {
      return await fn();
    } finally {
      this.endTimer(timerId);
    }
  }
  
  private addMetric(name: string, value: number, unit: string, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      labels
    });
    
    // Emit to monitoring service
    this.emitMetric({ name, value, unit, timestamp: new Date(), labels });
  }
  
  private emitMetric(metric: Metric): void {
    // Send to monitoring service (could be console for development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`METRIC [${metric.name}]: ${metric.value}${metric.unit}`, metric.labels);
    }
    
    // In production, send to monitoring service like DataDog, New Relic, etc.
    // this.sendToMonitoringService(metric);
  }
  
  getMetrics(): Metric[] {
    return [...this.metrics];
  }
  
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();

// Express middleware for request metrics
export const requestMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const timerId = metrics.startTimer('http_request_duration', {
    method: req.method,
    route: req.route?.path || req.path,
    status_code: res.statusCode.toString()
  });
  
  res.on('finish', () => {
    metrics.endTimer(timerId);
    metrics.increment('http_requests_total', 1, {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString()
    });
  });
  
  next();
};
```

## 11.2 Business Metrics Tracking

```typescript
interface BusinessMetrics {
  activeUsers: number;
  totalRules: number;
  notificationsSent24h: number;
  notificationsDelivered24h: number;
  failureRate24h: number;
  avgProcessingTimeMs: number;
  topFailureReasons: Array<{ reason: string; count: number }>;
}

class BusinessMetricsService {
  async collectBusinessMetrics(): Promise<BusinessMetrics> {
    const [
      activeUsers,
      totalRules,
      notificationStats,
      avgProcessingTime,
      failureReasons
    ] = await Promise.all([
      this.getActiveUsersCount(),
      this.getTotalRulesCount(),
      this.getNotificationStats(),
      this.getAverageProcessingTime(),
      this.getTopFailureReasons()
    ]);
    
    return {
      activeUsers,
      totalRules,
      notificationsSent24h: notificationStats.sent,
      notificationsDelivered24h: notificationStats.delivered,
      failureRate24h: notificationStats.failureRate,
      avgProcessingTimeMs: avgProcessingTime,
      topFailureReasons: failureReasons
    };
  }
  
  private async getActiveUsersCount(): Promise<number> {
    const result = await this.db.query(`
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM notifications 
      WHERE sent_at >= NOW() - INTERVAL '7 days'
    `);
    return result.rows[0].active_users;
  }
  
  private async getTotalRulesCount(): Promise<number> {
    const result = await this.db.query(`
      SELECT COUNT(*) as total_rules
      FROM rules 
      WHERE is_active = true
    `);
    return result.rows[0].total_rules;
  }
  
  private async getNotificationStats(): Promise<{
    sent: number;
    delivered: number;
    failureRate: number;
  }> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as sent,
        COUNT(*) FILTER (WHERE delivery_status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE delivery_status = 'failed') as failed
      FROM notifications 
      WHERE sent_at >= NOW() - INTERVAL '24 hours'
    `);
    
    const { sent, delivered, failed } = result.rows[0];
    const failureRate = sent > 0 ? (failed / sent) * 100 : 0;
    
    return { sent, delivered, failureRate };
  }
  
  private async getAverageProcessingTime(): Promise<number> {
    const result = await this.db.query(`
      SELECT AVG(processing_time_ms) as avg_time
      FROM rule_logs 
      WHERE processed_at >= NOW() - INTERVAL '24 hours'
    `);
    return result.rows[0].avg_time || 0;
  }
  
  private async getTopFailureReasons(): Promise<Array<{ reason: string; count: number }>> {
    const result = await this.db.query(`
      SELECT failed_reason as reason, COUNT(*) as count
      FROM notifications 
      WHERE delivery_status = 'failed' 
        AND sent_at >= NOW() - INTERVAL '24 hours'
      GROUP BY failed_reason
      ORDER BY count DESC
      LIMIT 5
    `);
    return result.rows;
  }
}

// Scheduled metrics collection
class MetricsScheduler {
  private businessMetricsService = new BusinessMetricsService();
  
  startMetricsCollection(): void {
    // Collect business metrics every 5 minutes
    setInterval(async () => {
      try {
        const businessMetrics = await this.businessMetricsService.collectBusinessMetrics();
        
        // Emit business metrics
        Object.entries(businessMetrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            metrics.gauge(`business.${key}`, value);
          }
        });
        
      } catch (error) {
        console.error('Failed to collect business metrics:', error);
        metrics.increment('metrics.collection.errors', 1);
      }
    }, 5 * 60 * 1000);
  }
}
```

## 11.3 Alerting and Incident Response

```typescript
interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

interface AlertRule {
  name: string;
  condition: (metrics: Metric[]) => boolean;
  severity: Alert['severity'];
  cooldownMs: number;
  description: string;
}

class AlertingService {
  private activeAlerts = new Map<string, Alert>();
  private alertRules: AlertRule[] = [
    {
      name: 'high_failure_rate',
      condition: (metrics) => {
        const failureRate = metrics.find(m => m.name === 'business.failureRate24h');
        return failureRate ? failureRate.value > 10 : false; // > 10% failure rate
      },
      severity: 'high',
      cooldownMs: 15 * 60 * 1000, // 15 minutes
      description: 'Notification failure rate exceeds 10%'
    },
    {
      name: 'database_connection_failed',
      condition: (metrics) => {
        const dbErrors = metrics.find(m => m.name === 'database.connection.errors');
        return dbErrors ? dbErrors.value > 0 : false;
      },
      severity: 'critical',
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      description: 'Database connection failures detected'
    },
    {
      name: 'slow_processing',
      condition: (metrics) => {
        const avgTime = metrics.find(m => m.name === 'business.avgProcessingTimeMs');
        return avgTime ? avgTime.value > 5000 : false; // > 5 seconds
      },
      severity: 'medium',
      cooldownMs: 30 * 60 * 1000, // 30 minutes
      description: 'Email processing time exceeds 5 seconds'
    },
    {
      name: 'gmail_api_errors',
      condition: (metrics) => {
        const apiErrors = metrics.find(m => m.name === 'gmail.api.errors');
        return apiErrors ? apiErrors.value > 5 : false; // > 5 errors in collection window
      },
      severity: 'high',
      cooldownMs: 10 * 60 * 1000, // 10 minutes
      description: 'Gmail API errors detected'
    }
  ];
  
  async evaluateAlerts(metrics: Metric[]): Promise<void> {
    for (const rule of this.alertRules) {
      const shouldTrigger = rule.condition(metrics);
      const alertKey = `${rule.name}`;
      const existingAlert = this.activeAlerts.get(alertKey);
      
      if (shouldTrigger && !this.isInCooldown(rule.name, rule.cooldownMs)) {
        if (!existingAlert || existingAlert.resolved) {
          await this.triggerAlert(rule);
        }
      } else if (!shouldTrigger && existingAlert && !existingAlert.resolved) {
        await this.resolveAlert(alertKey);
      }
    }
  }
  
  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alert: Alert = {
      id: generateId(),
      severity: rule.severity,
      title: `${rule.name.replace(/_/g, ' ').toUpperCase()}`,
      description: rule.description,
      source: 'monitoring',
      timestamp: new Date(),
      resolved: false,
      metadata: { ruleName: rule.name }
    };
    
    this.activeAlerts.set(rule.name, alert);
    
    // Send alert notification
    await this.sendAlertNotification(alert);
    
    // Log alert
    console.error(`ALERT [${alert.severity}]: ${alert.title} - ${alert.description}`);
    metrics.increment('alerts.triggered', 1, { 
      severity: alert.severity, 
      rule: rule.name 
    });
  }
  
  private async resolveAlert(alertKey: string): Promise<void> {
    const alert = this.activeAlerts.get(alertKey);
    if (alert) {
      alert.resolved = true;
      
      console.info(`RESOLVED: ${alert.title}`);
      metrics.increment('alerts.resolved', 1, { 
        severity: alert.severity,
        rule: alert.metadata?.ruleName 
      });
      
      // Optionally send resolution notification
      await this.sendResolutionNotification(alert);
    }
  }
  
  private isInCooldown(ruleName: string, cooldownMs: number): boolean {
    const alert = this.activeAlerts.get(ruleName);
    if (!alert) return false;
    
    const timeSinceAlert = Date.now() - alert.timestamp.getTime();
    return timeSinceAlert < cooldownMs;
  }
  
  private async sendAlertNotification(alert: Alert): Promise<void> {
    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 ALERT: ${alert.title}`);
      return;
    }
    
    // In production, send to notification channels
    // Could be email, Slack, PagerDuty, etc.
    const adminNotification = {
      to: process.env.ADMIN_PHONE_NUMBER,
      text: `🚨 ${alert.title}\n\n${alert.description}\n\nSeverity: ${alert.severity}\nTime: ${alert.timestamp.toISOString()}`
    };
    
    // Send via WhatsApp or other notification channel
    await this.sendAdminNotification(adminNotification);
  }
  
  private async sendResolutionNotification(alert: Alert): Promise<void> {
    if (alert.severity === 'critical' || alert.severity === 'high') {
      const resolution = {
        to: process.env.ADMIN_PHONE_NUMBER,
        text: `✅ RESOLVED: ${alert.title}\n\nIssue has been automatically resolved.\nTime: ${new Date().toISOString()}`
      };
      
      await this.sendAdminNotification(resolution);
    }
  }
}
```

---
