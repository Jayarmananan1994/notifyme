# 1. System Architecture Overview

## 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NotifyMe System Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   React/TS      │    │   Node.js/      │    │ PostgreSQL  │  │
│  │   Frontend      │◄──►│   Express       │◄──►│ (Supabase)  │  │
│  │                 │    │   Backend       │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                 │                               │
│                                 ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Gmail API     │    │   Message       │    │ WhatsApp    │  │
│  │   Webhooks      │◄──►│   Queue         │◄──►│ Business    │  │
│  │                 │    │   (Memory/      │    │ API         │  │
│  │                 │    │   Redis)        │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Service Boundaries (Monolith with Logical Separation)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Monolith Application                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Auth Service  │  │  Email Service  │  │ Notification    │  │
│  │                 │  │                 │  │ Service         │  │
│  │ • OAuth flow    │  │ • Gmail API     │  │ • WhatsApp API  │  │
│  │ • Session mgmt  │  │ • Webhook       │  │ • Message queue │  │
│  │ • Token refresh │  │ • Rule engine   │  │ • Retry logic   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  User Service   │  │  Rule Service   │  │  Analytics      │  │
│  │                 │  │                 │  │  Service        │  │
│  │ • Profile mgmt  │  │ • Rule CRUD     │  │ • Event logging │  │
│  │ • Settings      │  │ • Rule testing  │  │ • Performance   │  │
│  │ • Phone verify  │  │ • Content       │  │ • Metrics       │  │
│  │                 │  │   analysis      │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---
