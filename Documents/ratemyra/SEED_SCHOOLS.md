# 🌱 Seed Schools Database

## How to Add Schools to the Database

### Option 1: Run the Seed Script Locally

```bash
cd server
npm run db:seed:schools
```

### Option 2: Run on Railway

1. Go to Railway Dashboard → Your Service
2. Click on "Deployments" → Latest deployment
3. Click "View Logs" → Open Terminal
4. Run:
```bash
cd server
npm run db:seed:schools
```

Or use Railway CLI:
```bash
railway run "cd server && npm run db:seed:schools"
```

## What Schools Are Included?

The seed script includes **100+ major US colleges and universities**:

- **Ivy League** (8 schools)
- **Top Public Universities** (UC system, Big Ten, etc.)
- **Top Private Universities** (Stanford, MIT, etc.)
- **Liberal Arts Colleges** (Williams, Amherst, etc.)
- **State Universities** (all major state systems)

## Adding More Schools

To add more schools, edit `server/scripts/seed-schools.js` and add to the `schools` array:

```javascript
{ name: 'Your School Name', location: 'City, State', domain: 'school.edu' }
```

Then run the seed script again. It will skip schools that already exist.

## Notes

- The script is idempotent - safe to run multiple times
- Duplicate schools are automatically skipped
- Schools are added with name, location, and domain
