# IONOS DNS Configuration for ratemyra.com

This guide will help you configure your IONOS domain to work with Railway.

## Step 1: Get DNS Records from Railway

1. **Go to Railway Dashboard**
   - Navigate to: https://railway.app
   - Click on your project
   - Click on your service (the one running RateMyRA)
   - Go to **Settings** tab
   - Scroll to **"Domains"** section
   - Click **"Add Domain"** or **"Custom Domain"**
   - Enter: `ratemyra.com`
   - Railway will show you the DNS records you need

## Step 2: Configure DNS in IONOS

### Access IONOS Domain Management

1. **Log in to IONOS**
   - Go to: https://www.ionos.com
   - Log in to your account

2. **Navigate to Domain Management**
   - Click on **"Domains & SSL"** in the main menu
   - Find `ratemyra.com` in your domain list
   - Click on the domain name or click **"Manage"**

3. **Access DNS Settings**
   - Look for **"DNS"** or **"DNS Settings"** tab
   - Or click **"DNS"** in the domain management menu
   - You should see a list of DNS records

### Configure DNS Records

Railway will provide you with specific records. Here's what you'll typically need to add:

#### Option A: If Railway provides an A Record (IP Address)

1. **Add A Record for root domain:**
   - Click **"Add Record"** or **"+"**
   - **Type**: Select `A`
   - **Name/Host**: Enter `@` or leave blank (for root domain)
   - **Value/Points to**: Enter the IP address Railway provides
   - **TTL**: Leave default (usually 3600)
   - Click **"Save"** or **"Add"**

2. **Add CNAME Record for www:**
   - Click **"Add Record"** or **"+"**
   - **Type**: Select `CNAME`
   - **Name/Host**: Enter `www`
   - **Value/Points to**: Enter `ratemyra.com` or Railway's provided domain
   - **TTL**: Leave default
   - Click **"Save"** or **"Add"**

#### Option B: If Railway provides a CNAME

1. **Add CNAME Record for root domain:**
   - Some registrars (including IONOS) may not allow CNAME on root domain
   - If Railway provides a CNAME, you may need to use an A record instead
   - Contact Railway support if you're unsure

2. **Add CNAME Record for www:**
   - Click **"Add Record"** or **"+"**
   - **Type**: Select `CNAME`
   - **Name/Host**: Enter `www`
   - **Value/Points to**: Enter Railway's provided CNAME target
   - **TTL**: Leave default
   - Click **"Save"** or **"Add"**

### IONOS-Specific Notes

- IONOS interface may vary slightly, but the DNS settings are usually under **"DNS"** or **"DNS Settings"**
- If you see existing records (like `www` pointing to IONOS parking page), you may need to **edit** or **delete** them first
- IONOS sometimes has a **"DNS Zone Editor"** - use that if available

## Step 3: Remove/Update Existing Records (if needed)

If IONOS has default records set up:

1. **Check for existing records:**
   - Look for any existing `A` or `CNAME` records
   - Especially check for `www` records pointing to IONOS parking pages

2. **Update or delete:**
   - If there's a `www` record pointing to IONOS, either:
     - **Edit** it to point to Railway's value
     - **Delete** it and create a new one

## Step 4: Verify in Railway

1. **Go back to Railway Dashboard**
2. **Check domain status:**
   - In Settings → Domains
   - Railway will show:
     - ✅ **Active** - Domain is working
     - ⏳ **Pending** - Waiting for DNS propagation
     - ❌ **Failed** - Check DNS records

## Step 5: Wait for DNS Propagation

- DNS changes typically take **15-30 minutes** to propagate
- Can take up to **48 hours** in rare cases
- Check propagation status: https://www.whatsmydns.net/#A/ratemyra.com

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

## Troubleshooting IONOS

### Can't find DNS settings?

1. **Try these paths:**
   - Domains & SSL → ratemyra.com → DNS
   - Domain Management → ratemyra.com → DNS Settings
   - My Products → Domains → ratemyra.com → DNS

2. **Contact IONOS Support:**
   - They can guide you to the DNS settings
   - Phone: Check IONOS support page
   - Email: support@ionos.com

### DNS records not saving?

1. **Check for errors:**
   - Make sure values match exactly what Railway provided
   - No extra spaces or characters

2. **Try different browser:**
   - Sometimes IONOS interface has issues in certain browsers
   - Try Chrome, Firefox, or Safari

### Domain still not working after 30 minutes?

1. **Verify DNS records:**
   - Use: https://www.whatsmydns.net/#A/ratemyra.com
   - Should show Railway's IP address

2. **Check Railway logs:**
   - Railway Dashboard → Deployments → View Logs
   - Look for domain-related errors

3. **Contact Railway Support:**
   - They can verify your DNS configuration
   - Railway Dashboard → Help → Support

## Quick Checklist

- [ ] Got DNS records from Railway
- [ ] Logged into IONOS account
- [ ] Found DNS settings for ratemyra.com
- [ ] Added/updated A record for root domain (@)
- [ ] Added/updated CNAME record for www
- [ ] Removed any conflicting IONOS default records
- [ ] Saved DNS changes in IONOS
- [ ] Verified domain status in Railway
- [ ] Waited 15-30 minutes for propagation
- [ ] Tested https://ratemyra.com
- [ ] Tested https://www.ratemyra.com

## IONOS Support

If you need help with IONOS:
- **Support Center**: https://www.ionos.com/help
- **Phone**: Check IONOS support page for your region
- **Live Chat**: Available in IONOS dashboard

## Railway Support

If you need help with Railway:
- **Documentation**: https://docs.railway.app/guides/custom-domains
- **Support**: Railway Dashboard → Help → Support
