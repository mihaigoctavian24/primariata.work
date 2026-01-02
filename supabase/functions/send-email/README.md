# Send Email Edge Function

Supabase Edge Function for sending email notifications via SendGrid for cereri events.

## Overview

This Edge Function handles email notifications for the following cereri events:

- **cerere_submitted** - Confirmation when a new cerere is submitted
- **status_changed** - Notification when cerere status is updated
- **cerere_finalizata** - Success notification when cerere is completed
- **cerere_respinsa** - Notification when cerere is rejected

## Email Templates

All emails include:

- **HTML version** - Responsive design with Primăriata branding
- **Plain text version** - Fallback for email clients that don't support HTML
- **Cerere details** - Număr înregistrare, tip cerere, status
- **Action link** - Direct link to cerere details page

## Configuration

### 1. SendGrid API Key

Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys

#### Option A: Local Development (.env.local)

```bash
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@primariata.work
SENDGRID_FROM_NAME=Primăriata
```

#### Option B: Supabase Project (Production)

Set secrets via Supabase CLI:

```bash
supabase secrets set SENDGRID_API_KEY=SG.your-api-key-here
supabase secrets set SENDGRID_FROM_EMAIL=noreply@primariata.work
supabase secrets set SENDGRID_FROM_NAME=Primăriata
```

Or via Supabase Dashboard:

1. Go to Project Settings > Edge Functions
2. Add secrets: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`

### 2. App URL

Set the app URL for generating links in emails:

```bash
NEXT_PUBLIC_APP_URL=https://primariata.work
```

### 3. Database Configuration

The Edge Function URL needs to be configured for database triggers:

#### Via Supabase Dashboard:

1. Go to Project Settings > Custom Postgres Config
2. Add custom config:

```sql
ALTER DATABASE postgres SET app.settings.edge_function_url TO 'https://your-project.supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET app.settings.service_role_key TO 'your-service-role-key';
```

#### Via Migration (Recommended):

Create a migration file:

```sql
-- Set Edge Function URL for email notifications
ALTER DATABASE postgres SET app.settings.edge_function_url TO 'https://your-project.supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET app.settings.service_role_key TO 'your-service-role-key';
```

**Note**: Replace `your-project` and `your-service-role-key` with your actual values.

## Deployment

### Deploy to Supabase

```bash
# Deploy single function
supabase functions deploy send-email

# Or deploy all functions
supabase functions deploy
```

### Local Development

```bash
# Start Supabase local stack
supabase start

# Serve function locally
supabase functions serve send-email --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "cerere_submitted",
    "cerereId": "123e4567-e89b-12d3-a456-426614174000",
    "toEmail": "test@example.com",
    "toName": "Test User"
  }'
```

## API Usage

### Request Format

```typescript
POST /functions/v1/send-email

Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY

Body:
{
  "type": "cerere_submitted" | "status_changed" | "cerere_finalizata" | "cerere_respinsa",
  "cerereId": "uuid",
  "toEmail": "user@example.com",
  "toName": "User Name"
}
```

### Response

**Success (200)**:

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Error (400/500)**:

```json
{
  "error": "Error message details"
}
```

## Database Triggers

Emails are automatically triggered by database changes:

### INSERT Trigger

- Fires when: New cerere is created with status `depusa` or `trimisa`
- Sends: `cerere_submitted` email

### UPDATE Trigger

- Fires when: Cerere status changes (excluding `draft`)
- Sends:
  - `cerere_finalizata` if status → `finalizata`
  - `cerere_respinsa` if status → `respinsa`
  - `status_changed` for other status changes

### Manual Trigger

To manually send an email from your application:

```typescript
const { data, error } = await supabase.functions.invoke("send-email", {
  body: {
    type: "cerere_submitted",
    cerereId: cerere.id,
    toEmail: user.email,
    toName: user.full_name,
  },
});
```

## Email Verification (SendGrid)

**Important**: Before sending production emails, verify your sender domain in SendGrid:

1. Go to SendGrid Dashboard > Settings > Sender Authentication
2. Authenticate your domain (e.g., `primariata.work`)
3. Add DNS records to your domain provider
4. Wait for verification (usually 24-48 hours)

**Note**: Without domain verification, you can only send to verified email addresses in SendGrid.

## Monitoring

### View Logs

```bash
# Local logs
supabase functions serve send-email --debug

# Production logs
supabase functions logs send-email --project-ref your-project-ref
```

### SendGrid Dashboard

Monitor email delivery status:

- https://app.sendgrid.com/email_activity

## Troubleshooting

### "SendGrid API key not configured"

- Ensure `SENDGRID_API_KEY` is set in secrets
- Redeploy function after setting secrets

### "Failed to send email"

- Check SendGrid API key is valid
- Verify sender domain is authenticated
- Check recipient email is not on SendGrid suppression list

### "Cerere not found"

- Verify `cerereId` exists in database
- Check Supabase service role key has access to `cereri` table

### Emails not being triggered automatically

- Verify `pg_net` extension is enabled: `CREATE EXTENSION IF NOT EXISTS pg_net;`
- Check database trigger configuration
- Review database function logs

## Testing

### Local Testing with Inbucket

Supabase local development includes Inbucket for email testing:

1. Start Supabase: `supabase start`
2. Access Inbucket: http://localhost:54324
3. Trigger an email event
4. View captured email in Inbucket UI

### Production Testing

1. Use a test email address
2. Create a test cerere or change status
3. Check email delivery in SendGrid activity dashboard
4. Verify email content and links

## Email Content Customization

To customize email templates, edit the `buildHtmlTemplate()` and `buildTextTemplate()` functions in `index.ts`:

```typescript
// HTML templates - Full HTML with inline CSS
function buildHtmlTemplate(type: string, data: Record<string, string>): string {
  // Modify HTML templates here
}

// Plain text templates - Fallback for non-HTML clients
function buildTextTemplate(type: string, data: Record<string, string>): string {
  // Modify text templates here
}
```

## Rate Limiting

SendGrid free tier limits:

- **100 emails/day** - Free plan
- **40,000 emails/month** - Essentials plan ($15/month)

Monitor usage in SendGrid Dashboard to avoid hitting limits.

## Security

- ✅ Service role key required for invoking function
- ✅ User email fetched from `auth.users` (trusted source)
- ✅ Cerere data validated via database query
- ✅ CORS restricted to app domain
- ✅ Secrets stored in Supabase vault (not in code)

## Next Steps

- [ ] Set up SendGrid account and API key
- [ ] Verify sender domain in SendGrid
- [ ] Deploy Edge Function to Supabase
- [ ] Configure database settings (edge_function_url, service_role_key)
- [ ] Test with real email addresses
- [ ] Monitor SendGrid delivery rates
