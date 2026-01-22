# Setup Instructions

## Current Status
⚠️ **Network Issue Detected**: npm cannot reach the registry. Please ensure you have internet connectivity.

## Once Network is Available:

### 1. Install Dependencies
```bash
cd /Users/menadoce/Documents/ratemyra
npm run install:all
```

This will install dependencies for:
- Root project (concurrently)
- Server (Express, Prisma, etc.)
- Client (React, Vite, etc.)

### 2. Configure Database
Edit `server/.env` and update the DATABASE_URL:
```bash
cd server
nano .env  # or use your preferred editor
```

Update the DATABASE_URL to match your PostgreSQL setup:
```
DATABASE_URL="postgresql://username:password@localhost:5432/ratemyra?schema=public"
```

### 3. Run Database Migrations
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 4. Create Admin Account
```bash
cd server
npm run create-admin admin@ratemyra.com yourpassword123
```

### 5. Start the Application
From the project root:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend on http://localhost:3000

### 6. Access the Application
- **Home**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

## Troubleshooting

### Network Issues
If npm install fails:
- Check your internet connection
- Verify you can access https://registry.npmjs.org
- Check proxy settings if behind a corporate firewall
- Try: `npm config set registry https://registry.npmjs.org/`

### Database Connection
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Create the database if it doesn't exist:
  ```sql
  CREATE DATABASE ratemyra;
  ```

### Redis (Optional)
Redis is optional but recommended for caching. If not using Redis:
- The app will work without it (caching will be disabled)
- You'll see a warning in the server logs

## Quick Start (Once Network is Fixed)
```bash
# 1. Install
npm run install:all

# 2. Setup database (update .env first)
cd server
npm run db:migrate

# 3. Create admin
npm run create-admin admin@example.com password123

# 4. Start
cd ..
npm run dev
```
