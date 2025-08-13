# 2. Infrastructure Design

## 2.1 Cost-Optimized Infrastructure Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Stack                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Application Hosting:                                            │
│ ┌─────────────────┐     ┌─────────────────┐                    │
│ │ Railway/Render  │ OR  │ Vercel Frontend │                    │
│ │ Free Tier       │     │ + Railway       │                    │
│ │ $0/month        │     │ Backend         │                    │
│ │                 │     │ $0-5/month      │                    │
│ └─────────────────┘     └─────────────────┘                    │
│                                                                 │
│ Database & Storage:                                             │
│ ┌─────────────────┐     ┌─────────────────┐                    │
│ │ Supabase        │     │ Upstash Redis   │                    │
│ │ PostgreSQL      │     │ (Optional)      │                    │
│ │ Free: 500MB     │     │ Free: 10K cmds  │                    │
│ │ $0/month        │     │ $0/month        │                    │
│ └─────────────────┘     └─────────────────┘                    │
│                                                                 │
│ External APIs:                                                  │
│ ┌─────────────────┐     ┌─────────────────┐                    │
│ │ Gmail API       │     │ WhatsApp        │                    │
│ │ Free: 1B        │     │ Business API    │                    │
│ │ quota/day       │     │ ~$0.005/msg     │                    │
│ │ $0/month        │     │ ~$5-10/month    │                    │
│ └─────────────────┘     └─────────────────┘                    │
│                                                                 │
│ Total Monthly Cost: $5-10/month                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Deployment Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Developer Machine                                              │
│  ┌─────────────────┐                                            │
│  │ Git Push        │                                            │
│  │ to main branch  │                                            │
│  └─────────┬───────┘                                            │
│            │                                                    │
│            ▼                                                    │
│  ┌─────────────────┐                                            │
│  │ GitHub Actions  │                                            │
│  │ • Run tests     │                                            │
│  │ • Type check    │                                            │
│  │ • Build         │                                            │
│  │ • Deploy        │                                            │
│  └─────────┬───────┘                                            │
│            │                                                    │
│            ▼                                                    │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ Railway/Render  │     │ Supabase DB     │                   │
│  │ Production      │◄───►│ Production      │                   │
│  │ Environment     │     │ Environment     │                   │
│  └─────────────────┘     └─────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---
