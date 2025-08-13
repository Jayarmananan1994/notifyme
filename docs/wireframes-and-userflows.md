# NotifyMe - Wireframes and User Flow Documentation

## Executive Summary

This document provides comprehensive wireframes and user flow diagrams for the NotifyMe application, designed to build user trust for Gmail permission grants while maintaining simplicity for MVP scope. The designs prioritize professional aesthetics appropriate for digital professionals who need confidence in granting email access permissions.

## Design Philosophy

### Core Principles
1. **Trust-First Design**: Every interaction reinforces security and professional credibility
2. **Minimal Cognitive Load**: One-time setup complexity for long-term passive benefit
3. **Progressive Disclosure**: Show only what users need at each step
4. **Mobile-Responsive Foundation**: Desktop-optimized rule creation, mobile-friendly management
5. **Conservative Professional Aesthetic**: Healthcare/financial service visual language

### Visual Design System

#### Color Palette
- **Primary Blue**: #2563EB (trustworthy, professional)
- **Secondary Gray**: #64748B (neutral, professional)
- **Success Green**: #059669 (positive actions, connected status)
- **Warning Orange**: #D97706 (alerts, attention)
- **Error Red**: #DC2626 (errors, disconnected status)
- **Background**: #F8FAFC (clean, minimal)
- **Surface White**: #FFFFFF (content areas)
- **Text Primary**: #1E293B (high contrast)
- **Text Secondary**: #64748B (supporting information)

#### Typography
- **Headings**: Inter, Semi-bold (600)
- **Body Text**: Inter, Regular (400)
- **UI Elements**: Inter, Medium (500)
- **Monospace**: JetBrains Mono (for email addresses, timestamps)

#### Spacing System
- **Base Unit**: 8px
- **Small**: 4px (8px/2)
- **Medium**: 16px (8px*2)
- **Large**: 24px (8px*3)
- **X-Large**: 32px (8px*4)
- **XX-Large**: 48px (8px*6)

## User Flow Diagrams

### Primary User Journey: First-Time Setup

```
[Landing Page] 
    ↓ "Get Started"
[Permission Explanation] 
    ↓ "I Understand, Continue"
[Gmail OAuth] 
    ↓ OAuth Success
[WhatsApp Setup] 
    ↓ Number Verified
[Create First Rule] 
    ↓ Rule Created
[Dashboard] 
    → [Rule Management]
    → [Notification History]
    → [Settings]
```

### Secondary User Journey: Rule Management

```
[Dashboard] 
    ↓ "Add New Rule" or "Edit Rule"
[Rule Configuration Form]
    ↓ Preview & Test
[Rule Validation]
    ↓ Save Rule
[Dashboard] (updated with new rule)
```

### Notification Flow (Behind-the-scenes)

```
[New Email Arrives] 
    ↓ Gmail Webhook
[Rule Engine Processing] 
    ↓ Rule Matches
[WhatsApp Notification Sent] 
    ↓ Logged
[Notification History Updated]
```

## Screen Wireframes

### 1. Login/OAuth Screen with Permission Explanations

#### Initial Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│  NotifyMe                                      [Learn More]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           📧 → 📱 Never Miss Critical Emails Again          │
│                                                             │
│   Get WhatsApp alerts for important emails automatically   │
│                                                             │
│              [🔐 Secure Gmail Connection]                  │
│                                                             │
│  ✓ Read-only access to your emails                         │
│  ✓ No email content stored on our servers                  │
│  ✓ Industry-standard encryption & security                 │
│                                                             │
│                    [Get Started]                           │
│                                                             │
│           Used by 500+ digital professionals               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Permission Explanation Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Gmail Access Permissions                              [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔐 What NotifyMe needs access to:                         │
│                                                             │
│  ✓ Read your email metadata (sender, subject, date)        │
│  ✓ Monitor for new emails in real-time                     │
│  ✓ Check read/unread status of messages                    │
│                                                             │
│  🚫 What NotifyMe will NEVER do:                          │
│                                                             │
│  × Read your actual email content                          │
│  × Send emails from your account                           │
│  × Modify or delete your emails                            │
│  × Share your data with third parties                      │
│                                                             │
│  🛡️ Your data is encrypted and secure. You can revoke     │
│     access at any time from your Google Account settings.  │
│                                                             │
│         [Cancel]           [I Understand, Continue]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Gmail OAuth Loading State
```
┌─────────────────────────────────────────────────────────────┐
│                    Connecting to Gmail                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      [Loading Spinner]                     │
│                                                             │
│              Redirecting to Google for secure              │
│                      authentication...                     │
│                                                             │
│         This should only take a few seconds.               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Dashboard with Rule Overview and System Status

#### Main Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  NotifyMe Dashboard                    john@company.com [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  System Status                                              │
│  ┌─────────────────┬─────────────────┬─────────────────────┐ │
│  │ Gmail Connected │ WhatsApp Active │ Rules Processing    │ │
│  │      🟢         │      🟢         │        🟢          │ │
│  │   Last sync:    │  +1-555-0123   │     3 active       │ │
│  │   2 mins ago    │   verified ✓    │                    │ │
│  └─────────────────┴─────────────────┴─────────────────────┘ │
│                                                             │
│  Quick Stats (Last 7 days)                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  📧 42 emails monitored  📱 8 notifications sent       │ │
│  │  🎯 95% delivery rate    ⏱️  Avg response: 2.3 min    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Active Monitoring Rules                   [+ Add New Rule] │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 1. Executive Team Updates                     [Edit]    │ │
│  │    From: *@company.com (C-level)                       │ │
│  │    Keywords: urgent, deadline, board                   │ │
│  │    📊 3 notifications last week                        │ │
│  │                                                         │ │
│  │ 2. Client Payment Reminders                  [Edit]    │ │
│  │    From: accounting@*, billing@*                       │ │
│  │    Keywords: payment, invoice, overdue                 │ │
│  │    📊 2 notifications last week                        │ │
│  │                                                         │ │
│  │ 3. Government Compliance                      [Edit]    │ │
│  │    From: *.gov, *compliance.com                        │ │
│  │    Keywords: filing, deadline, compliance              │ │
│  │    📊 1 notification last week                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Recent Activity                           [View All History] │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🟢 2:34 PM - Payment reminder from Accounting Dept     │ │
│  │ 🟢 11:23 AM - Board meeting update from CEO            │ │
│  │ 🟢 Yesterday 4:45 PM - Compliance deadline notice      │ │
│  │ 🟢 Yesterday 10:15 AM - Client contract update         │ │
│  │ [Show more...]                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### System Status - Error State
```
┌─────────────────────────────────────────────────────────────┐
│  System Status                                              │
│  ┌─────────────────┬─────────────────┬─────────────────────┐ │
│  │ Gmail Connected │ WhatsApp Active │ Rules Processing    │ │
│  │      🔴         │      🟢         │        🟡          │ │
│  │  Connection     │  +1-555-0123   │    Reduced due to   │ │
│  │     lost        │   verified ✓    │   Gmail issue       │ │
│  │  [Reconnect]    │                 │                    │ │
│  └─────────────────┴─────────────────┴─────────────────────┘ │
│                                                             │
│  ⚠️ Action Required: Gmail connection has been lost.        │
│     Please reconnect to resume email monitoring.           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Rule Configuration Form

#### Create New Rule Form
```
┌─────────────────────────────────────────────────────────────┐
│  Create New Monitoring Rule                           [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Rule Name *                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Executive Communications                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  📧 Sender Filters                                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Email Addresses (one per line):                        │ │
│  │ ceo@company.com                                         │ │
│  │ cto@company.com                                         │ │
│  │ *@boardmembers.com                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  OR match display names containing:                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ CEO, CTO, President                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🔍 Content Filters                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Subject must contain (comma-separated):                 │ │
│  │ urgent, deadline, board meeting, executive              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Body text keywords (comma-separated):                   │ │
│  │ action required, immediate, ASAP, decision needed       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ⚙️ Advanced Options                        [Show/Hide]    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑️ Only monitor unread emails                          │ │
│  │ ☑️ Skip emails I've already starred                    │ │
│  │ ☐ Weekend notifications (Sat-Sun)                      │ │
│  │ ☐ After-hours notifications (6PM-8AM)                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  📱 Notification Preview                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔔 NotifyMe Alert                                       │ │
│  │                                                         │ │
│  │ 📧 From: CEO <ceo@company.com>                         │ │
│  │ 📄 Subject: Urgent: Board Decision Required            │ │
│  │ 🚨 Priority: High (Executive + Urgent keywords)        │ │
│  │ ⏰ Received: Just now                                   │ │
│  │                                                         │ │
│  │ Matched rule: Executive Communications                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🧪 Test Rule with Sample                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ From: ceo@company.com                                   │ │
│  │ Subject: Board meeting moved to urgent priority         │ │
│  │ Body: Team, we need an immediate decision on...         │ │
│  │                                                         │ │
│  │ [Test Match] → ✅ This email would trigger notification │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│              [Cancel]              [Save Rule]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Rule Validation States
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Rule Validation Errors                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Rule name is required                                 │ │
│  │ • At least one sender filter OR content filter needed  │ │
│  │ • Invalid email pattern: "invalid@"                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4. WhatsApp Setup Flow

#### WhatsApp Number Registration
```
┌─────────────────────────────────────────────────────────────┐
│  WhatsApp Notification Setup                          [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Connect Your WhatsApp Number                           │
│                                                             │
│  We'll send email notifications to your WhatsApp.          │
│  Your number is encrypted and never shared.                │
│                                                             │
│  Phone Number *                                             │
│  ┌───┬─────────────────────────────────────────────────────┐ │
│  │+1 │ (555) 123-4567                                     │ │
│  └───┴─────────────────────────────────────────────────────┘ │
│                                                             │
│  ℹ️ Important Notes:                                       │
│  • Must be a WhatsApp-enabled number                       │
│  • You'll receive a verification code                      │
│  • Standard messaging rates may apply                      │
│                                                             │
│              [Cancel]           [Send Verification]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### WhatsApp Verification Code
```
┌─────────────────────────────────────────────────────────────┐
│  Verify WhatsApp Number                               [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Verification code sent to +1 (555) 123-4567           │
│                                                             │
│  Please enter the 6-digit code you received:               │
│                                                             │
│  ┌───┬───┬───┬───┬───┬───┐                                 │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │                                 │
│  └───┴───┴───┴───┴───┴───┘                                 │
│                                                             │
│  Didn't receive the code?                                  │
│  [Resend Code] (available in 45 seconds)                   │
│                                                             │
│              [Cancel]           [Verify Number]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Notification History View

#### History Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Notification History                    [🔄] [📥 Export]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filters                                                   │
│  ┌──────────┬──────────┬─────────────┬─────────────────────┐ │
│  │Date Range│  Status  │    Rule     │      Search         │ │
│  │Last 7 days│   All    │     All     │  [Search emails...] │ │
│  └──────────┴──────────┴─────────────┴─────────────────────┘ │
│                                                             │
│  📊 Summary: 12 notifications sent, 11 delivered (92%)     │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🟢 Today, 2:34 PM                         Delivered     │ │
│  │ 📧 Payment Reminder - Accounting Dept                   │ │
│  │ 📄 "Invoice #1234 payment overdue by 5 days"          │ │
│  │ 📱 Rule: Client Payment Reminders                      │ │
│  │ ⏱️ Sent in 1.8 seconds                                 │ │
│  │                                                         │ │
│  │ 🟢 Today, 11:23 AM                        Delivered     │ │
│  │ 📧 Board Meeting Update - CEO                           │ │
│  │ 📄 "Urgent: Tomorrow's board meeting agenda changed"   │ │
│  │ 📱 Rule: Executive Communications                       │ │
│  │ ⏱️ Sent in 2.1 seconds                                 │ │
│  │                                                         │ │
│  │ 🟡 Yesterday, 4:45 PM                     Delayed       │ │
│  │ 📧 Compliance Deadline - Legal Dept                    │ │
│  │ 📄 "Q3 filing deadline in 48 hours"                   │ │
│  │ 📱 Rule: Government Compliance                          │ │
│  │ ⏱️ Sent in 4.2 seconds (WhatsApp API delay)           │ │
│  │                                                         │ │
│  │ 🔴 Aug 10, 9:15 AM                        Failed        │ │
│  │ 📧 Contract Update - Client Services                    │ │
│  │ 📄 "Contract renewal requires immediate attention"     │ │
│  │ 📱 Rule: Executive Communications                       │ │
│  │ ❌ WhatsApp API error - number unreachable             │ │
│  │ [Retry Now] [View Details]                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [Load More] (8 more notifications)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Notification Detail Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Notification Details                                  [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 WhatsApp Message Sent                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔔 NotifyMe Alert                                       │ │
│  │                                                         │ │
│  │ 📧 From: CEO <ceo@company.com>                         │ │
│  │ 📄 Subject: Urgent: Board Decision Required            │ │
│  │ 🚨 Priority: High                                       │ │
│  │ ⏰ Received: Aug 12, 2:34 PM                           │ │
│  │                                                         │ │
│  │ Matched rule: Executive Communications                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  📊 Delivery Information                                   │
│  • Status: Delivered ✅                                    │
│  • Sent to: +1 (555) ***-4567                             │
│  • Delivery time: 1.8 seconds                             │
│  • Message ID: msg_abc123def456                           │
│                                                             │
│  🎯 Rule Match Details                                     │
│  • Sender: ceo@company.com ✅                             │
│  • Subject keywords: "urgent", "decision" ✅              │
│  • Priority boost: Executive sender (+2) ✅               │
│                                                             │
│                    [Close]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6. Settings Page for Account Management

#### Account Settings Page
```
┌─────────────────────────────────────────────────────────────┐
│  Account Settings                     john@company.com [👤] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📧 Gmail Connection                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Status: Connected ✅                                    │ │
│  │ Account: john@company.com                               │ │
│  │ Permissions: Read-only email access                     │ │
│  │ Last sync: 2 minutes ago                               │ │
│  │                                                         │ │
│  │ [Reconnect Gmail] [Revoke Access]                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  📱 WhatsApp Configuration                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Phone Number: +1 (555) ***-4567 ✅ Verified            │ │
│  │ Status: Active                                          │ │
│  │ Last message sent: Today, 2:34 PM                      │ │
│  │                                                         │ │
│  │ [Change Number] [Test Connection]                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🔔 Notification Preferences                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Maximum notifications per hour: [5 ▼]                   │ │
│  │                                                         │ │
│  │ Quiet hours (no notifications):                        │ │
│  │ ☑️ Enable quiet hours                                   │ │
│  │ From: [10:00 PM ▼] To: [7:00 AM ▼]                    │ │
│  │ Timezone: Pacific Time                                 │ │
│  │                                                         │ │
│  │ Weekend notifications:                                  │ │
│  │ ☐ Saturday notifications                               │ │
│  │ ☐ Sunday notifications                                 │ │
│  │                                                         │ │
│  │ [Save Preferences]                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🛡️ Privacy & Security                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Data retention: 90 days (notification history)         │ │
│  │ Encryption: AES-256 for all stored data               │ │
│  │ Data location: US servers only                         │ │
│  │                                                         │ │
│  │ [Download My Data] [Delete Account]                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  💳 Subscription & Usage                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Plan: Free (Beta)                                       │ │
│  │ This month: 23 notifications sent                      │ │
│  │ Limit: 100 notifications/month                         │ │
│  │                                                         │ │
│  │ [Usage Details] [Upgrade Plan]                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Account Deletion Confirmation
```
┌─────────────────────────────────────────────────────────────┐
│  Delete Account                                        [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️ This action cannot be undone                           │
│                                                             │
│  Deleting your account will:                               │
│  • Remove all monitoring rules                             │
│  • Delete notification history                             │
│  • Revoke Gmail access permissions                         │
│  • Cancel WhatsApp notifications                           │
│                                                             │
│  Your data will be permanently deleted within 30 days.     │
│                                                             │
│  📥 Before deleting, you can download your data:          │
│  [Download Account Data]                                    │
│                                                             │
│  Type "DELETE" to confirm:                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│              [Cancel]           [Delete Account]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Considerations

### Navigation Adaptation
- **Desktop**: Horizontal navigation with all options visible
- **Mobile**: Hamburger menu with collapsible sections
- **Tablet**: Hybrid approach with primary actions visible, secondary in menu

### Rule Configuration Mobile Flow
```
Mobile Rule Creation (Stack Layout):

[Step 1: Rule Name]
┌─────────────────────────┐
│ Rule Name               │
│ ┌─────────────────────┐ │
│ │ Executive Comms     │ │
│ └─────────────────────┘ │
│        [Next]           │
└─────────────────────────┘

[Step 2: Senders]
┌─────────────────────────┐
│ Who to monitor          │
│ ┌─────────────────────┐ │
│ │ Email addresses     │ │
│ │ ceo@company.com     │ │
│ └─────────────────────┘ │
│   [Back]    [Next]      │
└─────────────────────────┘

[Step 3: Keywords]
┌─────────────────────────┐
│ Keywords to watch       │
│ ┌─────────────────────┐ │
│ │ urgent, deadline    │ │
│ └─────────────────────┘ │
│   [Back]    [Next]      │
└─────────────────────────┘

[Step 4: Preview & Save]
┌─────────────────────────┐
│ Review & Save           │
│ ✓ Executive Comms       │
│ ✓ CEO monitoring        │
│ ✓ Urgent keywords       │
│   [Back]    [Save]      │
└─────────────────────────┘
```

### Dashboard Mobile Layout
```
┌─────────────────────────┐
│ NotifyMe        [☰]     │
├─────────────────────────┤
│ Status                  │
│ ┌─────┬─────┬─────┐    │
│ │ 🟢  │ 🟢  │ 🟢  │    │
│ │Gmail│WhApp│Rules│    │
│ └─────┴─────┴─────┘    │
│                         │
│ Rules (3)      [+]      │
│ ┌─────────────────────┐ │
│ │ Executive Comms     │ │
│ │ 3 alerts this week  │ │
│ └─────────────────────┘ │
│                         │
│ Recent Activity         │
│ ┌─────────────────────┐ │
│ │ 🟢 2:34 PM          │ │
│ │ Payment reminder    │ │
│ └─────────────────────┘ │
│                         │
│ [View All]              │
└─────────────────────────┘
```

## Interaction Design Patterns

### Loading States
```
Button Loading State:
[Saving Rule...] (disabled, spinner)

Page Loading State:
┌─────────────────────────────────────────────────────────────┐
│                    [Loading Spinner]                       │
│                  Loading your dashboard...                 │
│                                                             │
│  This may take a few seconds while we check your          │
│                Gmail connection status.                     │
└─────────────────────────────────────────────────────────────┘

Form Validation (Real-time):
┌─────────────────────────────────────────────────────────────┐
│ Email Address                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ invalid@                                            [❌] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ❌ Please enter a valid email address                      │
└─────────────────────────────────────────────────────────────┘
```

### Success States
```
Rule Creation Success:
┌─────────────────────────────────────────────────────────────┐
│  ✅ Rule Created Successfully                               │
│                                                             │
│  Your "Executive Communications" rule is now active        │
│  and monitoring your inbox. You'll receive WhatsApp        │
│  notifications when matching emails arrive.                │
│                                                             │
│              [View Dashboard] [Create Another]             │
└─────────────────────────────────────────────────────────────┘
```

### Error States
```
Connection Error:
┌─────────────────────────────────────────────────────────────┐
│  ❌ Connection Error                                        │
│                                                             │
│  We couldn't connect to Gmail. Please check your           │
│  internet connection and try again.                        │
│                                                             │
│              [Try Again] [Contact Support]                 │
└─────────────────────────────────────────────────────────────┘

Validation Error:
┌─────────────────────────────────────────────────────────────┐
│  ❌ Please fix the following errors:                       │
│  • Rule name is required                                   │
│  • At least one filter must be specified                  │
│                                                             │
│                    [Got it]                                │
└─────────────────────────────────────────────────────────────┘
```

## Accessibility Considerations

### WCAG AA Compliance Features

#### Color and Contrast
- All text meets 4.5:1 contrast ratio minimum
- Interactive elements have focus indicators
- Color is never the only indicator of state (icons + color)

#### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements are keyboard accessible
- Skip links for main content areas
- Clear focus indicators throughout

#### Screen Reader Support
- Semantic HTML structure (headings, landmarks, lists)
- Alt text for all icons and images
- ARIA labels for complex interactions
- Live regions for dynamic updates (notifications, loading states)

#### Form Accessibility
```html
<!-- Example markup patterns -->
<label for="rule-name">Rule Name *</label>
<input 
  id="rule-name" 
  type="text" 
  aria-required="true"
  aria-describedby="rule-name-help"
>
<div id="rule-name-help" class="help-text">
  Choose a descriptive name for this monitoring rule
</div>
```

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced interactions layer on top
- Graceful degradation for older browsers

## Trust-Building UX Elements

### Security Indicators
- 🔒 SSL/security indicators prominent throughout
- Clear data handling explanations at each step
- Google OAuth branding to leverage trust
- Professional language avoiding casual tone

### Transparency Features
- Real-time status indicators for all connections
- Clear explanation of what data is accessed
- Easy access to privacy policy and terms
- Prominent account deletion and data export options

### Professional Credibility
- Clean, minimal design avoiding flashy elements
- Professional color palette (blues, grays)
- Clear, jargon-free language
- Consistent spacing and typography

### Permission Explanations
Every permission request includes:
- What we need and why
- What we will never do
- How to revoke access
- Visual indicators of security

## Technical Implementation Notes

### Component Architecture
```
Components/
├── Layout/
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── Dashboard/
│   ├── SystemStatus.tsx
│   ├── RulesList.tsx
│   ├── QuickStats.tsx
│   └── RecentActivity.tsx
├── Rules/
│   ├── RuleForm.tsx
│   ├── RulePreview.tsx
│   ├── RuleTest.tsx
│   └── RuleValidation.tsx
├── Auth/
│   ├── LoginForm.tsx
│   ├── PermissionExplanation.tsx
│   └── OAuthCallback.tsx
├── Settings/
│   ├── AccountSettings.tsx
│   ├── WhatsAppConfig.tsx
│   └── NotificationPrefs.tsx
└── Common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── LoadingSpinner.tsx
    └── StatusIndicator.tsx
```

### State Management
```typescript
// Global state structure
interface AppState {
  user: {
    email: string;
    isAuthenticated: boolean;
    whatsappNumber?: string;
    whatsappVerified: boolean;
  };
  system: {
    gmailConnected: boolean;
    whatsappActive: boolean;
    lastSync: Date;
  };
  rules: Rule[];
  notifications: Notification[];
  settings: UserSettings;
}
```

### API Integration Points
- Gmail OAuth flow handling
- Real-time rule validation
- WhatsApp number verification
- Notification delivery status
- Historical data pagination

This wireframe and user flow documentation provides a comprehensive foundation for implementing the NotifyMe application with a focus on trust-building, professional aesthetics, and user-friendly rule configuration while maintaining the MVP scope defined in the PRD.