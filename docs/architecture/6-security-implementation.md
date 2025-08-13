# 6. Security Implementation

## 6.1 Data Encryption Strategy

```typescript
interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyDerivation: 'pbkdf2';
  iterations: 100000;
  saltLength: 32;
  ivLength: 16;
  tagLength: 16;
}

class DataEncryption {
  private config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000,
    saltLength: 32,
    ivLength: 16,
    tagLength: 16
  };
  
  async encryptSensitiveData(data: string, masterKey: string): Promise<string> {
    const salt = crypto.randomBytes(this.config.saltLength);
    const iv = crypto.randomBytes(this.config.ivLength);
    
    const key = await this.deriveKey(masterKey, salt);
    const cipher = crypto.createCipher(this.config.algorithm, key, { iv });
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }
  
  async decryptSensitiveData(encryptedData: string, masterKey: string): Promise<string> {
    const { encrypted, salt, iv, authTag } = JSON.parse(encryptedData);
    
    const key = await this.deriveKey(masterKey, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipher(this.config.algorithm, key, {
      iv: Buffer.from(iv, 'hex')
    });
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.config.iterations, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }
}

// Token storage with encryption
class SecureTokenStorage {
  private encryption = new DataEncryption();
  
  async storeTokens(userId: string, tokens: OAuthTokens): Promise<void> {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    
    const encryptedAccess = await this.encryption.encryptSensitiveData(
      tokens.access_token, 
      masterKey
    );
    const encryptedRefresh = await this.encryption.encryptSensitiveData(
      tokens.refresh_token, 
      masterKey
    );
    
    await this.db.query(`
      UPDATE users 
      SET access_token = $1, refresh_token = $2, updated_at = NOW()
      WHERE id = $3
    `, [encryptedAccess, encryptedRefresh, userId]);
  }
  
  async retrieveTokens(userId: string): Promise<OAuthTokens> {
    const result = await this.db.query(`
      SELECT access_token, refresh_token 
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    
    const access_token = await this.encryption.decryptSensitiveData(
      result.rows[0].access_token,
      masterKey
    );
    const refresh_token = await this.encryption.decryptSensitiveData(
      result.rows[0].refresh_token,
      masterKey
    );
    
    return { access_token, refresh_token };
  }
}
```

## 6.2 GDPR Compliance Implementation

```typescript
interface GDPRComplianceService {
  exportUserData(userId: string): Promise<UserDataExport>;
  deleteUserData(userId: string): Promise<void>;
  anonymizeUserData(userId: string): Promise<void>;
  getUserConsent(userId: string): Promise<ConsentRecord>;
  updateConsent(userId: string, consent: ConsentUpdate): Promise<void>;
}

interface UserDataExport {
  user: UserProfile;
  rules: MonitoringRule[];
  notifications: NotificationRecord[];
  sessions: SessionRecord[];
  exportedAt: Date;
  format: 'json';
}

class GDPRService implements GDPRComplianceService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.getUserProfile(userId);
    const rules = await this.getUserRules(userId);
    const notifications = await this.getUserNotifications(userId);
    const sessions = await this.getUserSessions(userId);
    
    return {
      user: this.sanitizeForExport(user),
      rules: rules.map(r => this.sanitizeRuleForExport(r)),
      notifications: notifications.map(n => this.sanitizeNotificationForExport(n)),
      sessions: sessions.map(s => this.sanitizeSessionForExport(s)),
      exportedAt: new Date(),
      format: 'json'
    };
  }
  
  async deleteUserData(userId: string): Promise<void> {
    const transaction = await this.db.begin();
    
    try {
      // Delete in correct order to respect foreign key constraints
      await transaction.query('DELETE FROM rule_logs WHERE rule_id IN (SELECT id FROM rules WHERE user_id = $1)', [userId]);
      await transaction.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await transaction.query('DELETE FROM rules WHERE user_id = $1', [userId]);
      await transaction.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
      
      // Revoke Gmail API access
      await this.revokeGmailAccess(userId);
      
      // Finally delete user record
      await transaction.query('DELETE FROM users WHERE id = $1', [userId]);
      
      await transaction.commit();
      
      // Log deletion for compliance audit
      await this.logGDPRAction(userId, 'data_deletion', 'complete');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  private async revokeGmailAccess(userId: string): Promise<void> {
    const tokens = await this.secureTokenStorage.retrieveTokens(userId);
    
    // Revoke access token with Google
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${tokens.access_token}`
    });
  }
  
  private sanitizeForExport(data: any): any {
    // Remove sensitive fields that shouldn't be exported
    const sanitized = { ...data };
    delete sanitized.access_token;
    delete sanitized.refresh_token;
    delete sanitized.session_token;
    
    return sanitized;
  }
}
```

## 6.3 Security Headers and Middleware

```typescript
// Security middleware configuration
class SecurityMiddleware {
  static configure(app: Express): void {
    // Helmet for security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://accounts.google.com", "https://graph.facebook.com"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
    
    // Stricter rate limiting for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // limit auth attempts
      message: 'Too many authentication attempts, please try again later.',
    });
    app.use('/auth', authLimiter);
    
    // Request validation middleware
    app.use(this.requestValidation);
    
    // CORS configuration
    app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
  }
  
  static requestValidation(req: Request, res: Response, next: NextFunction): void {
    // Validate content-type for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method)) {
      if (!req.is('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
      }
    }
    
    // Validate request size
    if (req.get('content-length') && parseInt(req.get('content-length')!) > 1048576) {
      return res.status(413).json({ error: 'Request too large' });
    }
    
    next();
  }
}
```

---
