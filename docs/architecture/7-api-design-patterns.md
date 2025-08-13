# 7. API Design Patterns

## 7.1 RESTful API Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Endpoint Structure                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Authentication & User Management:                               │
│   POST   /auth/google                 - Initiate OAuth         │
│   POST   /auth/callback               - Handle OAuth callback  │
│   POST   /auth/refresh                - Refresh access token   │
│   DELETE /auth/logout                 - Logout user            │
│                                                                 │
│ User Profile:                                                   │
│   GET    /users/me                    - Get user profile       │
│   PUT    /users/me                    - Update user profile    │
│   DELETE /users/me                    - Delete user account    │
│   GET    /users/me/export             - Export user data       │
│                                                                 │
│ Phone Management:                                               │
│   POST   /users/me/phone              - Add/update phone       │
│   POST   /users/me/phone/verify       - Verify phone number    │
│   DELETE /users/me/phone              - Remove phone number    │
│                                                                 │
│ Monitoring Rules:                                               │
│   GET    /rules                       - List user rules        │
│   POST   /rules                       - Create new rule        │
│   GET    /rules/:id                   - Get specific rule      │
│   PUT    /rules/:id                   - Update rule            │
│   DELETE /rules/:id                   - Delete rule            │
│   POST   /rules/:id/test              - Test rule against      │
│                                         sample email           │
│                                                                 │
│ Notifications:                                                  │
│   GET    /notifications               - List notifications     │
│   GET    /notifications/:id           - Get notification       │
│   POST   /notifications/:id/retry     - Retry failed          │
│                                         notification           │
│                                                                 │
│ System:                                                         │
│   GET    /health                      - Health check           │
│   POST   /webhooks/gmail              - Gmail webhook          │
│   POST   /webhooks/whatsapp           - WhatsApp webhook       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 7.2 API Response Format Standards

```typescript
// Standard API response format
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Response builder utility
class APIResponseBuilder {
  static success<T>(data: T, meta?: APIResponse['meta']): APIResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        ...meta
      }
    };
  }
  
  static error(
    code: string, 
    message: string, 
    details?: any,
    httpStatus: number = 400
  ): APIResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      }
    };
  }
  
  static paginated<T>(
    data: T[], 
    pagination: PaginationMeta
  ): APIResponse<T[]> {
    return this.success(data, { pagination });
  }
}

// Error handling middleware
class APIErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error(`API Error [${req.method} ${req.path}]:`, error);
    
    if (error instanceof ValidationError) {
      res.status(400).json(APIResponseBuilder.error(
        'VALIDATION_ERROR',
        'Request validation failed',
        error.details
      ));
    } else if (error instanceof AuthenticationError) {
      res.status(401).json(APIResponseBuilder.error(
        'AUTHENTICATION_ERROR',
        'Authentication required'
      ));
    } else if (error instanceof AuthorizationError) {
      res.status(403).json(APIResponseBuilder.error(
        'AUTHORIZATION_ERROR',
        'Insufficient permissions'
      ));
    } else if (error instanceof NotFoundError) {
      res.status(404).json(APIResponseBuilder.error(
        'NOT_FOUND',
        'Resource not found'
      ));
    } else if (error instanceof RateLimitError) {
      res.status(429).json(APIResponseBuilder.error(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests'
      ));
    } else {
      res.status(500).json(APIResponseBuilder.error(
        'INTERNAL_ERROR',
        'An unexpected error occurred'
      ));
    }
  }
}
```

## 7.3 Request/Response Validation

```typescript
// Request validation schemas using Joi
const ValidationSchemas = {
  createRule: Joi.object({
    name: Joi.string().required().max(255),
    type: Joi.string().valid('sender', 'content', 'combined').required(),
    senderRules: Joi.object({
      emails: Joi.array().items(Joi.string().email()),
      domains: Joi.array().items(Joi.string()),
      patterns: Joi.array().items(Joi.string())
    }).when('type', {
      is: Joi.alternatives().try('sender', 'combined'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    contentRules: Joi.object({
      subjects: Joi.array().items(Joi.string()),
      keywords: Joi.array().items(Joi.string()),
      urgencyKeywords: Joi.array().items(Joi.string())
    }).when('type', {
      is: Joi.alternatives().try('content', 'combined'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    priority: Joi.number().integer().min(1).max(5).default(1),
    isActive: Joi.boolean().default(true)
  }),
  
  updateUser: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional(),
    notificationPreferences: Joi.object({
      quietHoursStart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      quietHoursEnd: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      maxNotificationsPerHour: Joi.number().integer().min(1).max(60)
    }).optional()
  }),
  
  testRule: Joi.object({
    sampleEmail: Joi.object({
      from: Joi.string().email().required(),
      fromName: Joi.string().optional(),
      subject: Joi.string().required(),
      snippet: Joi.string().required()
    }).required()
  })
};

// Validation middleware
function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json(APIResponseBuilder.error(
        'VALIDATION_ERROR',
        'Request validation failed',
        details
      ));
    }
    
    req.body = value;
    next();
  };
}

// Usage in routes
app.post('/rules', 
  authenticate,
  validateRequest(ValidationSchemas.createRule),
  RuleController.create
);
```

---
