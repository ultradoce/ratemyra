# Database Setup Instructions

## Current Status
✅ Dependencies installed
❌ PostgreSQL not installed/running

## Option 1: Install PostgreSQL (Recommended)

### macOS Installation Options:

**A. Using Homebrew** (if you have it):
```bash
brew install postgresql@14
brew services start postgresql@14
createdb ratemyra
```

**B. Using Postgres.app** (Easiest):
1. Download from: https://postgresapp.com/
2. Install and open the app
3. Click "Initialize" to create a new server
4. The default connection is: `postgresql://localhost:5432`

**C. Using Official Installer**:
1. Download from: https://www.postgresql.org/download/macosx/
2. Follow the installer
3. Default port: 5432, default user: your macOS username

### After Installation:

1. **Update server/.env**:
   ```bash
   cd server
   nano .env
   ```
   
   Update DATABASE_URL:
   ```
   DATABASE_URL="postgresql://yourusername@localhost:5432/ratemyra?schema=public"
   ```
   (Replace `yourusername` with your macOS username)

2. **Create the database**:
   ```bash
   createdb ratemyra
   ```

3. **Run migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Create admin account**:
   ```bash
   npm run create-admin admin@ratemyra.com yourpassword123
   ```

5. **Start the server**:
   ```bash
   cd ..
   npm run dev
   ```

## Option 2: Quick Start Without Database (Limited)

If you just want to see the UI without database:

1. The frontend will start but show errors
2. You can see the UI at http://localhost:3000
3. But features won't work without database

## Quick Commands Once PostgreSQL is Running:

```bash
# 1. Create database
createdb ratemyra

# 2. Update .env file with your username
# Edit server/.env: DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/ratemyra?schema=public"

# 3. Run migrations
cd server
npm run db:generate
npm run db:migrate

# 4. Create admin
npm run create-admin admin@ratemyra.com password123

# 5. Start app
cd ..
npm run dev
```

## Troubleshooting

**"createdb: command not found"**
→ PostgreSQL is not in your PATH. Add it:
```bash
export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
```

**"Can't reach database server"**
→ PostgreSQL is not running. Start it:
```bash
brew services start postgresql@14
# OR if using Postgres.app, make sure it's running
```

**"database does not exist"**
→ Create it: `createdb ratemyra`
