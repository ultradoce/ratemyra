# 🚀 Getting Started - Fix Connection Refused Error

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` because **the server isn't running yet**.

## Why?
The server can't start because **dependencies aren't installed**.

## Quick Fix (3 Steps)

### Step 1: Install Dependencies
```bash
cd /Users/menadoce/Documents/ratemyra
npm run install:all
```

This will take 2-5 minutes. Wait for it to complete.

### Step 2: Set Up Database
Edit `server/.env` and update the database connection:
```bash
# Open the file
nano server/.env

# Update this line with your PostgreSQL credentials:
DATABASE_URL="postgresql://username:password@localhost:5432/ratemyra?schema=public"
```

Then run migrations:
```bash
cd server
npm run db:generate
npm run db:migrate
```

### Step 3: Start the Server
```bash
# From project root
npm run dev
```

Or use the startup script:
```bash
./start.sh
```

## What You'll See

Once running, you should see:
```
🚀 Server running on http://localhost:3001
VITE ready in XXX ms
```

Then visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin

## Still Getting Connection Refused?

1. **Check if servers are running**:
   ```bash
   lsof -ti:3000,3001
   ```
   If nothing shows, servers aren't running.

2. **Check if dependencies installed**:
   ```bash
   ls server/node_modules
   ls client/node_modules
   ```
   If these don't exist, dependencies aren't installed.

3. **Check for errors**:
   Look at the terminal output when running `npm run dev`
   - Red errors = something is wrong
   - Yellow warnings = usually OK

## Common Issues

### "Cannot find module"
→ Dependencies not installed. Run `npm run install:all`

### "Database connection error"
→ PostgreSQL not running or wrong credentials in `.env`

### "Port already in use"
→ Another app is using port 3000 or 3001
→ Kill it: `lsof -ti:3000 | xargs kill`

## Need Admin Account?

After starting the server:
```bash
cd server
npm run create-admin admin@ratemyra.com yourpassword123
```

Then login at http://localhost:3000/login
