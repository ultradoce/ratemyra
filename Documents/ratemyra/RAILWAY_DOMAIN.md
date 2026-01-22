# 🌐 Getting a Domain for RateMyRA on Railway

## Option 1: Free Railway Domain (Easiest)

Railway automatically provides a free domain for every deployment!

### Steps:
1. Go to Railway Dashboard → Your Service
2. Click on **Settings** tab
3. Scroll to **Networking** section
4. Click **Generate Domain** (or it may already be generated)
5. Railway will provide: `your-app-name.up.railway.app`

**That's it!** Your app is live at that URL.

### Example:
- Your app might be at: `ratemyra-production.up.railway.app`
- Or: `ratemyra-abc123.up.railway.app`

## Option 2: Custom Domain (Your Own Domain)

If you want to use your own domain (e.g., `ratemyra.com`):

### Step 1: Buy a Domain
Popular domain registrars:
- **Namecheap**: https://www.namecheap.com
- **Google Domains**: https://domains.google
- **Cloudflare**: https://www.cloudflare.com/products/registrar
- **GoDaddy**: https://www.godaddy.com

Search for and purchase your desired domain (e.g., `ratemyra.com`, `ratemyra.app`)

### Step 2: Add Domain in Railway

1. **Railway Dashboard** → Your Service → **Settings**
2. Scroll to **Networking** section
3. Under **Custom Domains**, click **Add Domain**
4. Enter your domain (e.g., `ratemyra.com`)
5. Railway will show you DNS records to add

### Step 3: Configure DNS

You need to add DNS records at your domain registrar:

#### Option A: CNAME Record (Recommended)
- **Type**: CNAME
- **Name**: `@` (or leave blank for root domain) or `www` (for www.ratemyra.com)
- **Value**: Railway will provide this (e.g., `your-app.up.railway.app`)

#### Option B: A Record
- **Type**: A
- **Name**: `@` (for root domain)
- **Value**: Railway will provide the IP address

### Step 4: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 10-30 minutes
- Railway will show status: "Pending" → "Active"

### Step 5: SSL Certificate

Railway automatically provisions SSL certificates (HTTPS) for your domain!
- Free SSL via Let's Encrypt
- Automatic renewal
- No configuration needed

## Domain Configuration Examples

### Root Domain (ratemyra.com)
```
Type: CNAME
Name: @
Value: your-app.up.railway.app
```

### Subdomain (www.ratemyra.com)
```
Type: CNAME
Name: www
Value: your-app.up.railway.app
```

### Both Root and WWW
Add two CNAME records:
1. `@` → `your-app.up.railway.app`
2. `www` → `your-app.up.railway.app`

## Cost

- **Railway Domain**: FREE (`.railway.app`)
- **Custom Domain**: ~$10-15/year (varies by registrar and TLD)
- **SSL Certificate**: FREE (automatic via Railway)

## Quick Start (Free Domain)

1. Railway Dashboard → Your Service
2. Settings → Networking
3. Click "Generate Domain" (if not already generated)
4. Copy the URL (e.g., `ratemyra-production.up.railway.app`)
5. Share it! Your app is live! 🎉

## Tips

- **Free domain**: Perfect for testing and development
- **Custom domain**: Better for production and branding
- **Subdomains**: You can add multiple (e.g., `api.ratemyra.com`, `admin.ratemyra.com`)
- **HTTPS**: Always enabled automatically by Railway

## Troubleshooting

**Domain not working?**
- Check DNS propagation: https://www.whatsmydns.net
- Verify DNS records are correct
- Wait up to 48 hours for full propagation
- Check Railway logs for errors

**SSL not working?**
- Railway provisions SSL automatically
- May take a few minutes after domain is active
- Check Railway dashboard for SSL status

## Example Setup

1. Buy domain: `ratemyra.com` ($12/year)
2. Add in Railway: Settings → Networking → Add Domain
3. Add CNAME: `@` → `ratemyra-production.up.railway.app`
4. Wait 10-30 minutes
5. Visit: `https://ratemyra.com` ✅

Your app is now live with a custom domain!
