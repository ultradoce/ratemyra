# Troubleshooting Guide

## Current Issue: Network Connectivity

**Problem**: npm cannot reach the npm registry (registry.npmjs.org)

**Symptoms**:
- `npm install` fails with `ENOTFOUND registry.npmjs.org`
- DNS cannot resolve the registry hostname

## Solutions

### Solution 1: Check Internet Connection
```bash
# Test basic connectivity
ping -c 3 google.com

# Test DNS
nslookup registry.npmjs.org

# Test HTTPS access
curl -I https://registry.npmjs.org
```

### Solution 2: Try Alternative npm Registry
If the main registry is blocked, try using a mirror:

```bash
# Use Taobao mirror (China)
npm config set registry https://registry.npmmirror.com

# Or use Cloudflare mirror
npm config set registry https://registry.npmjs.cf

# Then try installing
npm run install:all
```

### Solution 3: Use Yarn Instead
If npm continues to fail, try using Yarn:

```bash
# Install Yarn (if not installed)
npm install -g yarn

# Install dependencies
cd server && yarn install
cd ../client && yarn install
```

### Solution 4: Manual Dependency Installation
If you have the packages elsewhere, you can manually copy node_modules, but this is not recommended.

### Solution 5: Check Proxy/Firewall Settings
If you're behind a corporate firewall:

```bash
# Check if proxy is needed
npm config get proxy
npm config get https-proxy

# Set proxy if needed
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Solution 6: Use VPN or Different Network
- Connect to a different network (mobile hotspot, etc.)
- Use a VPN if your network blocks npm registry

## Quick Fix Checklist

- [ ] Verify internet connection works (try browsing a website)
- [ ] Check if DNS is working (`nslookup google.com`)
- [ ] Try alternative npm registry (see Solution 2)
- [ ] Check firewall/proxy settings
- [ ] Try from a different network
- [ ] Verify npm is up to date: `npm install -g npm@latest`

## Once Dependencies Are Installed

After successfully installing dependencies:

1. **Configure Database**:
   ```bash
   cd server
   # Edit .env file with your PostgreSQL connection string
   nano .env
   ```

2. **Run Migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Create Admin Account**:
   ```bash
   npm run create-admin admin@ratemyra.com yourpassword123
   ```

4. **Start Application**:
   ```bash
   cd ..
   npm run dev
   ```

## Still Having Issues?

If none of the above work:
1. Check your system's network settings
2. Contact your network administrator if on a corporate network
3. Try using a mobile hotspot to test if it's network-specific
4. Check if antivirus/firewall is blocking npm
