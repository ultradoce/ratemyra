# 🔧 Railway Deployment Fix

## Issue
Railway couldn't detect the Node.js project structure because it was looking in the wrong directory.

## Solution Applied
Updated configuration files to make Railway detect the project correctly:

1. **package.json** - Added `main` field and `engines` to specify Node.js version
2. **railway.toml** - Updated with proper start command
3. **nixpacks.toml** - Simplified configuration

## What to Do in Railway Dashboard

If Railway still can't detect the project:

### Option 1: Manual Configuration
1. Go to your Railway service
2. Go to **Settings** → **Build & Deploy**
3. Set **Root Directory**: `/` (or leave empty)
4. Set **Build Command**: (leave empty, nixpacks will handle it)
5. Set **Start Command**: `cd server && npm start`

### Option 2: Use Nixpacks Builder
1. In Railway service settings
2. Under **Build** section
3. Select **Builder**: `Nixpacks`
4. Railway will use `nixpacks.toml` automatically

### Option 3: Check Repository Structure
Make sure Railway is looking at the root of the repository, not a subdirectory.

## Environment Variables Needed

In Railway dashboard → Variables:
```
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

`DATABASE_URL` is automatically set when you add PostgreSQL.

## After Deployment

1. **Run migrations** (automatic via Procfile release command)
2. **Create admin account**:
   ```bash
   railway run node server/scripts/create-admin-railway.js admin@ratemyra.com password123
   ```

## Verify Build

Check Railway logs to see:
- ✅ Node.js detected
- ✅ Dependencies installing
- ✅ Prisma generating
- ✅ Frontend building
- ✅ Server starting

If you see errors, check the logs and let me know!
