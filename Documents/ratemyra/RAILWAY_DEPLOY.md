# 🚂 Deploying RateMyRA to Railway

Railway makes it easy to deploy this app with automatic PostgreSQL setup!

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. **Add PostgreSQL**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

### 3. Configure Environment Variables

In Railway dashboard, go to your service → Variables tab, add:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

**Note**: `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

### 4. Run Database Migrations

Railway will automatically run migrations on deploy (via the `release` command in Procfile).

Or manually run:
```bash
# In Railway dashboard → Service → Deployments → View Logs
# Or use Railway CLI:
railway run npm run db:migrate
```

### 5. Create Admin Account

After first deployment, create admin account:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run the create-admin script
railway run node scripts/create-admin.js admin@ratemyra.com yourpassword123
```

**Option B: Using Railway Dashboard**
1. Go to your service → Deployments
2. Click on latest deployment → View Logs
3. Use the Railway shell/terminal feature
4. Run: `node scripts/create-admin.js admin@ratemyra.com password123`

### 6. Set Up Frontend (Static Site)

The frontend needs to be built and served. You have two options:

#### Option A: Deploy Frontend Separately (Recommended)

1. **Build the frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Railway Static**:
   - Create a new service in Railway
   - Select "Static Site"
   - Point to `client/dist` directory
   - Set build command: `cd client && npm install && npm run build`

3. **Update API URL**:
   - In `client/vite.config.js`, update the proxy or
   - Create `client/.env.production`:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```

#### Option B: Serve Frontend from Backend

Update `server/src/index.js` to serve static files:

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});
```

## Railway Configuration Files

- `railway.json` - Railway build configuration
- `railway.toml` - Alternative Railway config
- `Procfile` - Process commands (web server + migrations)
- `.railwayignore` - Files to exclude from deployment

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection (auto-set by Railway) | ✅ |
| `JWT_SECRET` | Secret for JWT tokens | ✅ |
| `JWT_EXPIRES_IN` | Token expiration (default: 7d) | ❌ |
| `NODE_ENV` | Environment (production) | ❌ |
| `PORT` | Server port (Railway sets this) | ❌ |
| `REDIS_URL` | Redis connection (optional) | ❌ |

## Custom Domain

1. In Railway dashboard → Your service → Settings
2. Click "Generate Domain" or "Custom Domain"
3. Railway provides a free `.railway.app` domain
4. For custom domain, add your domain in settings

## Monitoring & Logs

- **Logs**: Railway dashboard → Service → Deployments → View Logs
- **Metrics**: Railway dashboard → Service → Metrics
- **Health Check**: `/api/health` endpoint (configured in railway.toml)

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running
- Check migrations ran successfully

### Build Failures
- Check Railway logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Railway auto-detects)

### Frontend Not Loading
- Check if frontend is built (`client/dist` exists)
- Verify static file serving is configured
- Check API URL in frontend environment variables

## Railway CLI Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands
railway run npm run db:migrate
railway run node scripts/create-admin.js email@example.com password

# Open project
railway open
```

## Cost

- **Free Tier**: $5/month credit
- **Hobby Plan**: $20/month (includes PostgreSQL)
- **Pro Plan**: $100/month (for production)

## Next Steps After Deploy

1. ✅ Database migrations run automatically
2. ✅ Create admin account (see step 5)
3. ✅ Test the API: `https://your-app.railway.app/api/health`
4. ✅ Access admin: `https://your-app.railway.app/admin`
5. ✅ Set up custom domain (optional)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
