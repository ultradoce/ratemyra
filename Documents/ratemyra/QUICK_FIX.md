# Quick Fix Guide

## Issues Found

1. **Network Issue**: Cannot reach npm registry (registry.npmjs.org)
2. **npm Permissions Issue**: Cache folder has permission problems

## Immediate Solutions

### Fix 1: Fix npm Permissions (Run this first)
```bash
sudo chown -R $(whoami) ~/.npm
```

### Fix 2: Try Alternative Registry
After fixing permissions, try using an alternative npm registry:

```bash
# Option A: Use npmmirror (China mirror, often faster)
npm config set registry https://registry.npmmirror.com

# Option B: Use Cloudflare mirror
npm config set registry https://registry.npmjs.cf

# Then install
npm run install:all
```

### Fix 3: Check Your Network
```bash
# Test if you can reach the internet
ping -c 3 8.8.8.8

# Test DNS
nslookup registry.npmjs.org

# If DNS fails, try using Google DNS
# (You may need to configure this in System Preferences > Network)
```

### Fix 4: Use Yarn Instead
If npm continues to fail:

```bash
# Install Yarn globally (if you can reach npm at all)
npm install -g yarn

# Or install via Homebrew
brew install yarn

# Then use Yarn
cd server && yarn install
cd ../client && yarn install
```

## Step-by-Step Recovery

1. **Fix npm permissions**:
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. **Try alternative registry**:
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. **Install dependencies**:
   ```bash
   npm run install:all
   ```

4. **If still failing, check network**:
   - Are you connected to the internet?
   - Are you behind a firewall/proxy?
   - Try a different network (mobile hotspot)

## What You Need

To run this application, you need:

1. ✅ **Node.js** - Already installed (v18.17.0)
2. ✅ **npm** - Already installed (v9.6.7)
3. ❌ **Dependencies** - Need to install (blocked by network)
4. ❌ **PostgreSQL** - Need to set up database
5. ⚠️ **Redis** - Optional (for caching)

## Next Steps After Dependencies Install

Once `npm run install:all` succeeds:

1. **Set up PostgreSQL database**:
   - Install PostgreSQL if not installed: `brew install postgresql@14`
   - Start PostgreSQL: `brew services start postgresql@14`
   - Create database: `createdb ratemyra`
   - Update `server/.env` with your database credentials

2. **Run database migrations**:
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   ```

3. **Create admin account**:
   ```bash
   npm run create-admin admin@ratemyra.com yourpassword123
   ```

4. **Start the app**:
   ```bash
   npm run dev
   ```

## Still Stuck?

The main blocker is network connectivity. Try:
- Using a mobile hotspot
- Using a VPN
- Checking with your network administrator
- Using a different computer/network
