# Custom Domain Setup: ratemyra.com

This guide will help you configure your custom domain `ratemyra.com` with Railway.

## Step 1: Add Domain in Railway

1. **Go to Railway Dashboard**
   - Navigate to your project: https://railway.app
   - Click on your service (the one running your app)

2. **Add Custom Domain**
   - Click on the **"Settings"** tab
   - Scroll down to **"Domains"** section
   - Click **"Add Domain"** or **"Custom Domain"**
   - Enter: `ratemyra.com`
   - Railway will provide you with DNS records to configure

## Step 2: Configure DNS Records

You need to configure DNS records with your domain registrar (where you purchased ratemyra.com).

### Option A: Root Domain (ratemyra.com)

Railway will provide you with DNS records. Typically you'll need:

**For the root domain:**
- **Type**: `A` or `CNAME`
- **Name**: `@` (or leave blank, depending on your DNS provider)
- **Value**: Railway will provide this (usually an IP address or CNAME target)

**For www subdomain:**
- **Type**: `CNAME`
- **Name**: `www`
- **Value**: Railway will provide this (usually your Railway domain or IP)

### Option B: Using Railway's Instructions

Railway will show you the exact DNS records needed. Common configurations:

1. **A Record** (for root domain):
   ```
   Type: A
   Name: @
   Value: [Railway-provided IP address]
   ```

2. **CNAME Record** (for www):
   ```
   Type: CNAME
   Name: www
   Value: [Railway-provided domain or IP]
   ```

### DNS Provider Examples:

**Cloudflare:**
- Go to DNS → Records
- Add the records Railway provides

**GoDaddy:**
- Go to DNS Management
- Add the records Railway provides

**Namecheap:**
- Go to Advanced DNS
- Add the records Railway provides

## Step 3: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most providers
- You can check propagation status at: https://www.whatsmydns.net

## Step 4: Verify Domain in Railway

1. Go back to Railway Dashboard
2. Check the **"Domains"** section
3. Railway will show the domain status:
   - ✅ **Active** - Domain is working
   - ⏳ **Pending** - Waiting for DNS propagation
   - ❌ **Failed** - Check DNS records

## Step 5: Update Environment Variables (Optional)

Railway should automatically detect your custom domain, but you can also set:

1. Go to Railway Dashboard → Your Service → Variables
2. Add (if not already set):
   - `CUSTOM_DOMAIN=https://ratemyra.com`
   - `RAILWAY_PUBLIC_DOMAIN` (Railway sets this automatically)

## Step 6: Test Your Domain

Once DNS has propagated:

1. **Test root domain:**
   ```
   https://ratemyra.com
   ```

2. **Test www subdomain:**
   ```
   https://www.ratemyra.com
   ```

3. **Test API:**
   ```
   https://ratemyra.com/api/health
   ```

4. **Test admin dashboard:**
   ```
   https://ratemyra.com/admin
   ```

## Step 7: SSL/HTTPS Certificate

Railway automatically provisions SSL certificates for custom domains via Let's Encrypt. This happens automatically once:
- DNS records are correctly configured
- Domain is verified in Railway
- Usually takes 5-10 minutes after DNS propagation

## Troubleshooting

### Domain not working?

1. **Check DNS propagation:**
   - Use https://www.whatsmydns.net
   - Enter `ratemyra.com` and check if it resolves to Railway's IP

2. **Verify DNS records:**
   - Make sure records match exactly what Railway provided
   - Check for typos in the records

3. **Check Railway logs:**
   - Go to Railway Dashboard → Deployments → View Logs
   - Look for domain-related errors

4. **Clear browser cache:**
   - Try incognito/private browsing mode
   - Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)

### Still having issues?

1. **Contact Railway Support:**
   - Railway Dashboard → Help → Support
   - They can help verify domain configuration

2. **Check Railway Status:**
   - https://status.railway.app

## Additional Notes

- Your Railway `.railway.app` domain will continue to work alongside your custom domain
- Both domains will serve the same application
- SSL certificates are automatically managed by Railway
- No code changes needed - the app already supports custom domains via CORS configuration

## Quick Checklist

- [ ] Added domain in Railway Dashboard
- [ ] Configured DNS records at domain registrar
- [ ] Waited for DNS propagation (15-30 min)
- [ ] Verified domain status in Railway (should show ✅ Active)
- [ ] Tested https://ratemyra.com
- [ ] Tested https://www.ratemyra.com
- [ ] SSL certificate automatically provisioned

## Need Help?

If you encounter issues:
1. Check Railway's domain documentation: https://docs.railway.app/guides/custom-domains
2. Check Railway logs for errors
3. Verify DNS records are correct
4. Contact Railway support if needed
