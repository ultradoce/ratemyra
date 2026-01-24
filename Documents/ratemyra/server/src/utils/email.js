import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@ratemyra.com';
const APP_URL = process.env.APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'https://ratemyra.com';

// Create transporter
let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn('⚠️  Email not configured. SMTP_USER and SMTP_PASSWORD not set.');
  console.warn('   Email verification will be logged to console only.');
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `RateMyRA <${SMTP_FROM}>`,
    to: email,
    subject: 'Verify Your Email - RateMyRA',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to RateMyRA!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for creating an account with RateMyRA. Please verify your email address to complete your registration.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RateMyRA. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to RateMyRA!
      
      Thank you for creating an account. Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  } else {
    // Log email in development
    console.log('📧 Verification Email (not sent - SMTP not configured):');
    console.log('   To:', email);
    console.log('   Verification URL:', verificationUrl);
    return { success: true, messageId: 'logged-only' };
  }
}

/**
 * Generate verification token
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}
