# 🚀 Start Here - Quick Setup Guide

## ✅ Step 1: Dependencies Installed ✓
Great! Dependencies are installed.

## ⚠️ Step 2: Database Setup Required

PostgreSQL is not running. You have 3 options:

### Option A: Start PostgreSQL (Recommended)

If you have PostgreSQL installed:

```bash
# Start PostgreSQL service
brew services start postgresql@14
# OR
brew services start postgresql

# Create the database
createdb ratemyra

# Update server/.env with your credentials
# DATABASE_URL="postgresql://yourusername@localhost:5432/ratemyra?schema=public"
```

Then run migrations:
```bash
cd server
npm run db:migrate
```

### Option B: Install PostgreSQL

If you don't have PostgreSQL:

```bash
# Install PostgreSQL
brew install postgresql@14

# Start it
brew services start postgresql@14

# Create database
createdb ratemyra

# Update server/.env
# Then run migrations
cd server
npm run db:migrate
```

### Option C: Use SQLite (Easier for Development)

If you want to skip PostgreSQL setup for now, we can switch to SQLite:

1. Edit `server/prisma/schema.prisma`:
   - Change `provider = "postgresql"` to `provider = "sqlite"`
   - Change `url = env("DATABASE_URL")` to `url = "file:./dev.db"`

2. Then run:
```bash
cd server
npm run db:migrate
```

## Step 3: Create Admin Account

After database is set up:

```bash
cd server
npm run create-admin admin@ratemyra.com yourpassword123
```

## Step 4: Start the Server

```bash
# From project root
npm run dev
```

Then visit:
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

## Quick Commands Summary

```bash
# 1. Start PostgreSQL (if installed)
brew services start postgresql@14
createdb ratemyra

# 2. Run migrations
cd server
npm run db:migrate

# 3. Create admin
npm run create-admin admin@ratemyra.com password123

# 4. Start app
cd ..
npm run dev
```

## Need Help?

- Database connection issues? Check `server/.env`
- Port already in use? `lsof -ti:3000 | xargs kill`
- See `GET_STARTED.md` for more details
