# 🔍 White Screen Fix Guide

## The Problem
You see a white screen because the frontend isn't being served.

## Diagnosis Steps

### 1. Check Railway Build Logs
1. Railway Dashboard → Your Service
2. **Deployments** tab → Latest deployment
3. **Build Logs** → Look for:
   ```
   cd client && npm run build
   ```
   - Should see: `dist/` folder created
   - Should see: `Build completed successfully`

### 2. Check Server Logs
1. Railway Dashboard → Your Service
2. **Deployments** → Latest deployment
3. **Deploy Logs** → Look for:
   - `✅ Found client dist! Serving from: /path/to/client/dist`
   - OR: `⚠️ Client dist NOT found`

### 3. Verify Build Phase Completed
The build phase should:
1. ✅ Generate Prisma client
2. ✅ Build frontend (`cd client && npm run build`)
3. ✅ Create `client/dist/` folder

## Common Issues & Fixes

### Issue 1: Frontend Not Built
**Symptom**: Server logs show "Client dist NOT found"

**Fix**: Check build logs for errors in `cd client && npm run build`

### Issue 2: Wrong Path
**Symptom**: Path mismatch in logs

**Fix**: Make sure Root Directory in Railway is set to `/Documents/ratemyra`

### Issue 3: Build Phase Failed
**Symptom**: Build logs show errors

**Fix**: 
- Check for missing dependencies
- Verify `client/package.json` is correct
- Check for Vite build errors

## Quick Test

Visit these URLs to diagnose:
- `https://your-app.railway.app/api/health` → Should return JSON
- `https://your-app.railway.app/` → Should show React app or error message

## If Frontend Still Not Showing

1. **Check Railway Build Logs** for `client/dist` creation
2. **Check Server Logs** for the path it's looking for
3. **Verify Root Directory** is `/Documents/ratemyra` in Railway
4. **Check Environment**: `NODE_ENV=production` should be set

The server now logs exactly where it's looking for the frontend files!
