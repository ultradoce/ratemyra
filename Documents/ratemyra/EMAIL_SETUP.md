# Email Verification Setup Guide

This guide will help you configure email verification for RateMyRA.

## Overview

The email verification system:
- Sends verification emails when users register
- Requires users to verify their email before full account access
- Allows users to resend verification emails
- Uses secure tokens that expire after 24 hours

## Step 1: Install Dependencies

```bash
cd server
npm install nodemailer
```

## Step 2: Configure Email Service

You need to set up SMTP credentials. Choose one of these options:

### Option A: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "RateMyRA" as the name
   - Copy the generated 16-character password

3. **Set Environment Variables in Railway**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM=your-email@gmail.com
   ```

### Option B: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Create an API Key**:
   - Go to Settings → API Keys
   - Create a new API Key with "Mail Send" permissions
   - Copy the API key

3. **Set Environment Variables in Railway**:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM=noreply@ratemyra.com
   ```

### Option C: Mailgun

1. **Sign up for Mailgun**: https://www.mailgun.com
2. **Get SMTP credentials** from your Mailgun dashboard
3. **Set Environment Variables in Railway**:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASSWORD=your-mailgun-password
   SMTP_FROM=noreply@ratemyra.com
   ```

### Option D: Other SMTP Providers

Any SMTP provider will work. Set these variables:
```
SMTP_HOST=your-smtp-host
SMTP_PORT=587 (or 465 for SSL)
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@ratemyra.com
```

## Step 3: Set App URL

Set the base URL for your application (used in verification links):

```
APP_URL=https://ratemyra.com
```

Or Railway will automatically use:
```
RAILWAY_PUBLIC_DOMAIN=https://ratemyra.up.railway.app
```

## Step 4: Run Database Migration

After setting up email, you need to update the database schema:

1. **Create Migration**:
   ```bash
   cd server
   npx prisma migrate dev --name add_email_verification
   ```

2. **Or Deploy Migration** (Production):
   ```bash
   npx prisma migrate deploy
   ```

3. **Or Use Railway Setup Endpoint**:
   Visit: `https://ratemyra.com/api/setup`
   This will run migrations automatically.

## Step 5: Test Email Verification

1. **Register a new account**
2. **Check your email** for the verification link
3. **Click the link** to verify your email
4. **Try logging in** - should work now!

## Troubleshooting

### Emails Not Sending

1. **Check Railway Logs**:
   - Look for email-related errors
   - Check if SMTP credentials are correct

2. **Verify Environment Variables**:
   - Make sure all SMTP variables are set in Railway
   - Check for typos in variable names

3. **Test SMTP Connection**:
   - Try sending a test email manually
   - Check if your SMTP provider has rate limits

### Verification Link Not Working

1. **Check Token Expiration**:
   - Tokens expire after 24 hours
   - Use "Resend Verification Email" if expired

2. **Check APP_URL**:
   - Make sure `APP_URL` is set correctly
   - Should match your domain (e.g., `https://ratemyra.com`)

### Development Mode

If SMTP is not configured, the system will:
- Log verification emails to the console
- Still create users (but emailVerified will be false)
- Allow you to test the flow without sending real emails

## Environment Variables Summary

Required for email to work:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@ratemyra.com
APP_URL=https://ratemyra.com
```

## Security Notes

- Verification tokens expire after 24 hours
- Tokens are cryptographically secure (32 random bytes)
- Tokens are deleted after successful verification
- Email addresses are case-insensitive and normalized

## Features

✅ Automatic email sending on registration
✅ Secure token-based verification
✅ Token expiration (24 hours)
✅ Resend verification email
✅ Email verification status tracking
✅ Beautiful HTML email templates
✅ Fallback to console logging in development
