# 🗑️ How to Remove Fake Data

This guide explains how to remove all fake data that was created by the fake data seeder.

## What is Fake Data?

Fake data is test/demo data created to populate the site. It's marked with **invisible Unicode characters** that are completely hidden from users but can be identified programmatically.

## Fake Data Markers (Invisible)

- **RAs**: Dorm names start with zero-width non-joiner (U+200C) - completely invisible
- **Reviews**: TextBody starts with zero-width space (U+200B) - completely invisible

## How to Remove Fake Data

### Option 1: Using the Script (Recommended)

```bash
cd server
npm run db:remove:fake
```

### Option 2: On Railway

**Using Railway Dashboard Terminal:**
1. Railway Dashboard → Your Service
2. Click "Deployments" → Latest deployment
3. Click "View Logs" → Open Terminal
4. Run:
```bash
cd server
npm run db:remove:fake
```

**Using Railway CLI:**
```bash
railway run "cd server && npm run db:remove:fake"
```

### Option 3: Manual SQL (Advanced)

If you need to remove fake data manually using SQL:

```sql
-- Find fake RAs
SELECT * FROM "RA" WHERE dorm LIKE E'\u200C%';

-- Find fake reviews
SELECT * FROM "Review" WHERE "textBody" LIKE E'\u200B%';

-- Delete fake reviews first
DELETE FROM "Review" WHERE "textBody" LIKE E'\u200B%';

-- Delete fake RAs (this will cascade delete related data)
DELETE FROM "RA" WHERE dorm LIKE E'\u200C%';
```

## What Gets Removed?

The script will remove:
- ✅ All fake RAs (with invisible marker in dorm name)
- ✅ All fake reviews (with invisible marker in review text)
- ✅ Orphaned tag statistics (automatically cleaned up)

## Safety

- The script shows a preview of what will be deleted before removing
- It only removes data with the invisible markers
- Real user data is never affected

## Verification

After running the script, you can verify all fake data is gone:

```bash
# Check for remaining fake RAs (should return 0)
cd server
npx prisma studio
# Then search for RAs with dorm starting with the invisible character
```

## Notes

- Fake data markers are **completely invisible** to users
- The markers are only visible when viewing raw database data
- The script is safe to run multiple times (idempotent)
