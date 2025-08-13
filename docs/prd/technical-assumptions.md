# Technical Assumptions

## Repository Structure: Monorepo
Single repository containing frontend and backend packages for streamlined development and deployment coordination.

## Service Architecture  
**Monolith** - Single Node.js application handling all functionality to minimize infrastructure complexity and costs.

## Testing Requirements
**Unit Only** - Focus on core business logic testing. Manual testing for API integrations during development.

## Additional Technical Assumptions and Requests

**Frontend Stack:**
- React.js with TypeScript for type safety and maintainability
- Vite for fast development cycles
- Responsive CSS framework for cross-device compatibility

**Backend Stack:**
- Node.js with Express framework for Gmail API integration
- SQLite for development, PostgreSQL only when needed
- In-memory caching (no Redis initially)

**Infrastructure:**
- Railway free tier ($0/month) or Render free tier ($0/month) for hosting
- Supabase free tier ($0/month) for PostgreSQL (500MB, 2 connections)
- Upstash Redis free tier ($0/month) for critical queuing only

**API Integrations:**
- Gmail API (free tier: 1 billion quota units/day)
- WhatsApp Business API (pay-per-message, ~$0.005/message)
- OAuth 2.0 for secure user authentication

**Security & Compliance:**
- Basic encryption for stored metadata
- No premium compliance features initially
- No storage of actual email content - metadata only
