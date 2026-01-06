# Email Service Migration Guide

## Overview

The email service configuration has been migrated from the `SiteSettings` table to a dedicated `EmailServiceConfig` table. This allows for better organization and support for multiple email providers.

## Changes Made

### 1. New Database Table: `EmailServiceConfig`

Stores email service configuration including:
- Service type (SMTP, Resend, SendGrid, Mailgun)
- API keys (encrypted)
- SMTP credentials (encrypted)
- From email and name
- Active status

### 2. New Email Service Utility

**File**: `src/lib/email/email-service.ts`

Provides a unified interface for sending emails regardless of the provider:

```typescript
import { sendEmail } from "@/lib/email/email-service";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Hello</h1>",
  text: "Hello",
  replyTo: "support@example.com"
});
```

### 3. Updated Send Email Wrapper

**File**: `src/lib/send-email/index.ts`

Now uses the new email service internally. Existing code using `sendEmail` from this file will continue to work without changes.

## Migration Steps for Existing Deployments

### Option 1: Use Setup Wizard

1. Access `/setup` route (if not already completed)
2. Configure email service in Step 5
3. Credentials will be automatically migrated to `EmailServiceConfig`

### Option 2: Manual Migration

1. **Add email configuration via database**:

```sql
INSERT INTO EmailServiceConfig (
  service_type,
  is_active,
  api_key,
  from_email,
  from_name
) VALUES (
  'resend',
  true,
  '<encrypted_api_key>',
  'noreply@yourdomain.com',
  'Your Blog'
);
```

2. **Encrypt API key before inserting**:

```typescript
import { encryptKey } from "@/lib/encryption";
const encryptedKey = encryptKey(process.env.RESEND_API_KEY);
```

### Option 3: Keep Using Environment Variables

The system will fall back to environment variables if no active email configuration exists in the database. However, this is not recommended for production.

## Supported Email Providers

1. **Resend** - Recommended for simplicity
2. **SMTP** - For custom email servers
3. **SendGrid** - Popular email service
4. **Mailgun** - Alternative email service

## Configuration via Admin Dashboard

(To be implemented)

Future versions will include an admin UI to manage email service configuration without database access.

## Breaking Changes

### For Developers

- `getSiteSettings().resendApiKey` is deprecated
- Use `sendEmail` from `@/lib/email/email-service` or `@/lib/send-email` instead
- Direct Resend API usage should be replaced with the email service

### For Users

- No breaking changes for end users
- Existing email functionality continues to work
- Setup wizard provides easy configuration

## Troubleshooting

### Emails not sending

1. Check if email service is configured:
   ```sql
   SELECT * FROM EmailServiceConfig WHERE is_active = true;
   ```

2. Verify API key is encrypted correctly

3. Check application logs for email service errors

### Migration from old settings

If you have `resendApiKey` in `SiteSettings`:

1. Copy the encrypted value
2. Insert into `EmailServiceConfig` with `service_type = 'resend'`
3. Set `is_active = true`

## Future Enhancements

- Admin UI for email configuration
- Email template management
- Email queue for better reliability
- Email analytics and tracking
