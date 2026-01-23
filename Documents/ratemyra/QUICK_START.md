# 🚀 Quick Start Guide

## After Deployment

### 1. Run Database Migrations
Migrations should run automatically during the release phase. If not:
```bash
cd server
npx prisma migrate deploy
```

### 2. Seed Schools Database
Add all the schools to your database:
```bash
cd server
npm run db:seed:schools
```

This adds 100+ major US colleges and universities including:
- Ivy League schools
- Top public universities (UC system, Big Ten, etc.)
- Top private universities (Stanford, MIT, etc.)
- Liberal Arts colleges
- Major state universities

### 3. Create Admin Account
```bash
cd server
npm run create-admin your-email@example.com your-password
```

## On Railway

### Using Railway Dashboard Terminal:
1. Railway Dashboard → Your Service
2. Click "Deployments" → Latest deployment
3. Click "View Logs" → Open Terminal
4. Run the commands above

### Using Railway CLI:
```bash
railway run "cd server && npm run db:seed:schools"
railway run "cd server && npm run create-admin your-email@example.com your-password"
```

## Verify Everything Works

1. **Test Database**: `https://your-app.railway.app/api/schools/test`
   - Should return: `{"success": true, "count": 100+}`

2. **Search Schools**: Try searching for "Harvard", "Stanford", "MIT", etc.

3. **Health Check**: `https://your-app.railway.app/api/health`
   - Should return: `{"status": "ok"}`

## Troubleshooting

### No Schools Found
- Run the seed script: `npm run db:seed:schools`

### Database Connection Error
- Check `DATABASE_URL` is set in Railway Variables
- Verify PostgreSQL service is running

### Migrations Failed
- Check Railway logs for error messages
- Verify `DATABASE_URL` is correct
- Try running migrations manually
