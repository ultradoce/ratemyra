# 🎯 Final Railway Configuration

## Repository Structure
Your git repository root is `/Users/menadoce` (home directory), so files are tracked as:
- `Documents/ratemyra/package.json`
- `Documents/ratemyra/server/`
- `Documents/ratemyra/client/`

## Railway Configuration

### Root Directory Setting
In Railway Dashboard → Service → Settings → Build & Deploy:
- **Root Directory**: `/` (leave empty or set to `/`)
- Railway will clone the repo and see `Documents/ratemyra/` structure

### All Paths Updated
All configuration files now use correct paths:
- `nixpacks.toml`: All commands use `Documents/ratemyra/...`
- `Procfile`: Uses `Documents/ratemyra/server`
- `railway.json`: Uses `Documents/ratemyra/server`
- `railway.toml`: Uses `Documents/ratemyra/server`

## Build Process

1. **Install Phase**:
   - `cd Documents/ratemyra && npm install` (root deps)
   - `cd Documents/ratemyra/server && npm install` (server deps)
   - `cd Documents/ratemyra/client && npm install` (client deps)

2. **Build Phase**:
   - `cd Documents/ratemyra/server && npx prisma generate`
   - `cd Documents/ratemyra/client && npm run build`

3. **Release Phase** (runs on deploy):
   - `cd Documents/ratemyra/server && npx prisma generate && npx prisma migrate deploy`

4. **Start**:
   - `cd Documents/ratemyra/server && npm start`

## Environment Variables

Set these in Railway Dashboard:
```
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

`DATABASE_URL` is automatically set when you add PostgreSQL.

## After Deployment

Create admin account:
```bash
railway run "cd Documents/ratemyra/server && node scripts/create-admin-railway.js admin@ratemyra.com password123"
```

Or use Railway dashboard terminal and run:
```bash
cd Documents/ratemyra/server
node scripts/create-admin-railway.js admin@ratemyra.com password123
```

## Verification

After successful deployment:
- ✅ Health check: `https://your-app.railway.app/api/health`
- ✅ Frontend: `https://your-app.railway.app`
- ✅ Admin: `https://your-app.railway.app/admin`

Everything is now configured correctly!
