# 4. WhatsApp Business API Implementation

## 4.1 Message Delivery Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                WhatsApp Message Delivery Flow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email Processor    Message Queue     WhatsApp API    User      │
│       │                 │                 │           │         │
│       │ 1. Create       │                 │           │         │
│       │    Notification │                 │           │         │
│       │────────────────►│                 │           │         │
│       │                 │                 │           │         │
│       │                 │ 2. Process      │           │         │
│       │                 │    Message      │           │         │
│       │                 │                 │           │         │
│       │                 │ 3. Send to      │           │         │
│       │                 │    WhatsApp     │           │         │
│       │                 │────────────────►│           │         │
│       │                 │                 │           │         │
│       │                 │                 │ 4. Deliver│         │
│       │                 │                 │   Message │         │
│       │                 │                 │──────────►│         │
│       │                 │                 │           │         │
│       │                 │ 5. Delivery     │           │         │
│       │                 │    Status       │           │         │
│       │                 │◄────────────────│           │         │
│       │                 │                 │           │         │
│       │ 6. Log Result   │                 │           │         │
│       │◄────────────────│                 │           │         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Message Template and Context Generation

```typescript
interface EmailContext {
  sender: {
    email: string;
    displayName: string;
    domain: string;
    authorityScore: number; // 0-100
  };
  subject: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  extractedDeadline?: Date;
  keywordMatches: string[];
  receivedAt: Date;
}

interface WhatsAppMessage {
  to: string;
  text: string;
  preview_url?: boolean;
}

class MessageGenerator {
  generateNotification(context: EmailContext): WhatsAppMessage {
    const urgencyEmoji = this.getUrgencyEmoji(context.urgencyLevel);
    const senderInfo = this.formatSenderInfo(context.sender);
    const deadline = context.extractedDeadline 
      ? `⏰ Deadline: ${this.formatDeadline(context.extractedDeadline)}\n`
      : '';
    
    const message = `${urgencyEmoji} Email Alert\n\n` +
      `From: ${senderInfo}\n` +
      `Subject: ${context.subject}\n` +
      `${deadline}` +
      `Received: ${this.formatTime(context.receivedAt)}\n\n` +
      `Match: ${context.keywordMatches.join(', ')}\n\n` +
      `Check Gmail to read full message.`;
    
    return {
      to: context.recipient,
      text: message,
      preview_url: false
    };
  }
  
  private getUrgencyEmoji(level: string): string {
    const emojis = {
      low: '📧',
      medium: '📨',
      high: '🚨',
      critical: '🔴'
    };
    return emojis[level] || '📧';
  }
  
  private formatSenderInfo(sender: EmailContext['sender']): string {
    if (sender.authorityScore > 80) {
      return `${sender.displayName} (${sender.domain}) ⭐`;
    }
    return `${sender.displayName} (${sender.email})`;
  }
}
```

## 4.3 Reliable Message Delivery with Retry Logic

```typescript
interface DeliveryAttempt {
  id: string;
  messageId: string;
  attempt: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  timestamp: Date;
}

class WhatsAppDeliveryService {
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // ms
  
  async sendMessage(message: WhatsAppMessage): Promise<DeliveryAttempt> {
    const attempt: DeliveryAttempt = {
      id: generateId(),
      messageId: generateId(),
      attempt: 1,
      status: 'pending',
      timestamp: new Date()
    };
    
    try {
      await this.deliverMessage(message, attempt);
      return attempt;
    } catch (error) {
      return this.retryDelivery(message, attempt, error);
    }
  }
  
  private async retryDelivery(
    message: WhatsAppMessage,
    attempt: DeliveryAttempt,
    error: Error
  ): Promise<DeliveryAttempt> {
    if (attempt.attempt >= this.maxRetries) {
      attempt.status = 'failed';
      attempt.error = error.message;
      await this.logFailedDelivery(attempt);
      return attempt;
    }
    
    const delay = this.retryDelays[attempt.attempt - 1];
    await this.sleep(delay);
    
    attempt.attempt++;
    attempt.timestamp = new Date();
    
    try {
      await this.deliverMessage(message, attempt);
      return attempt;
    } catch (retryError) {
      return this.retryDelivery(message, attempt, retryError);
    }
  }
  
  private async deliverMessage(
    message: WhatsAppMessage,
    attempt: DeliveryAttempt
  ): Promise<void> {
    const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }
    
    attempt.status = 'sent';
    await this.logDeliveryAttempt(attempt);
  }
}
```

---
