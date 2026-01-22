# RateMyRA

A platform for students to rate and review their Resident Assistants (RAs), inspired by Rate My Professor.

## Features

- **Search & Discovery**: Find RAs by name, school, or dorm with smart ranking
- **Add RAs**: Students can submit new RAs to the database with duplicate detection
- **Rating System**: Weighted ratings with time decay (recent reviews matter more)
- **Review Submission**: Submit detailed reviews with tags and ratings
- **Abuse Prevention**: IP hashing, rate limiting, and duplicate detection
- **Moderation**: Flagging system for inappropriate content
- **Tag System**: Structured tags (not free-text) for better aggregation
- **Smart Ranking**: Search results ranked by rating, volume, and recency
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Performance**: Redis caching for fast response times
- **Pagination**: Efficient loading of reviews with "Load More"
- **Visualizations**: Star ratings, rating distributions, and tag displays

## Architecture

### Backend
- **Node.js + Express**: RESTful API
- **PostgreSQL**: Primary database
- **Prisma ORM**: Type-safe database access
- **Redis**: Caching layer (optional, for production)

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- (Optional) Redis for caching

### Installation

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up database:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   ```

3. **Run database migrations:**
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   ```

4. **Create an admin account:**
   ```bash
   cd server
   npm run create-admin <your-email> <your-password>
   ```
   Example:
   ```bash
   npm run create-admin admin@ratemyra.com mypassword123
   ```

5. **Start development servers:**
   ```bash
   # From project root
   npm run dev
   ```

   This starts:
   - Backend API on `http://localhost:3001`
   - Frontend on `http://localhost:3000`

## Project Structure

```
ratemyra/
├── server/              # Backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utilities (rating, abuse prevention, tags)
│   │   └── index.js     # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── package.json
└── package.json         # Root package.json
```

## API Endpoints

### RAs
- `GET /api/ras` - List RAs (with filters)
- `GET /api/ras/:id` - Get RA profile with stats
- `POST /api/ras` - Create a new RA (with duplicate detection)

### Reviews
- `POST /api/reviews` - Submit a review
- `GET /api/reviews/:raId` - Get reviews for an RA
- `POST /api/reviews/:id/flag` - Flag a review

### Schools
- `GET /api/schools` - List all schools
- `GET /api/schools/:id` - Get school details
- `POST /api/schools` - Create a school

### Search
- `GET /api/search?q=query` - Search for RAs

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Admin (requires authentication + admin role)
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/reviews` - Get all reviews with filters
- `PATCH /api/admin/reviews/:id/status` - Update review status
- `DELETE /api/admin/reviews/:id` - Delete a review
- `GET /api/admin/ras` - Get all RAs
- `DELETE /api/admin/ras/:id` - Delete an RA
- `PATCH /api/admin/ras/:id` - Update RA information

## Key Features Explained

### Weighted Rating Calculation
Ratings use time decay - recent reviews are weighted more heavily than older ones. This prevents review bombing and allows ratings to evolve.

### Abuse Prevention
- IP addresses are hashed (SHA256) before storage
- Device fingerprints are hashed
- Rate limiting: 5 reviews per hour per IP
- Duplicate detection using text similarity (Jaccard similarity)

### Tag System
Tags are predefined codes (not free-text) for:
- Fast aggregation
- No profanity moderation needed
- Trend visualization

### Search Ranking
Results are ranked by:
- Rating weight (60%)
- Review volume (30%)
- Recency (10%)

## Database Schema

### Core Models
- **School**: Universities/colleges
- **RA**: Resident Assistants
- **Review**: Student reviews
- **RATagStat**: Aggregated tag statistics
- **User**: (Future) User accounts

### Review Status Flow
```
ACTIVE → FLAGGED → HIDDEN → REMOVED
```

## Development

### Database Commands
```bash
cd server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio (GUI)
```

### Adding a New School/RA
You can use the API or Prisma Studio to add test data:

```bash
# Example: Create a school via API
curl -X POST http://localhost:3001/api/schools \
  -H "Content-Type: application/json" \
  -d '{"name": "Example University", "domain": "example.edu", "location": "City, State"}'
```

## Recent Improvements

- ✨ **Enhanced UI/UX**: Modern design system with CSS variables, smooth animations, and better visual hierarchy
- ⚡ **Performance**: Redis caching implemented for RA profiles, reviews, and search results
- 🎨 **Better Components**: Reusable LoadingSpinner, StarRating, and EmptyState components
- 📊 **Visualizations**: Rating distribution charts, better star displays, and tag visualizations
- 🔄 **Pagination**: "Load More" functionality for reviews with proper loading states
- 🛡️ **Error Handling**: Comprehensive error handling middleware with proper status codes
- 📱 **Responsive**: Fully responsive design that works on all devices
- ⚙️ **Code Quality**: Better code organization, error handling, and validation
- 🔐 **Authentication**: JWT-based authentication system with admin role support
- 👨‍💼 **Admin Dashboard**: Full admin control panel for moderating reviews and managing RAs
- ➕ **Add RAs**: Students can submit new RAs with duplicate detection

## Production Considerations

1. **Environment Variables**: Set secure `JWT_SECRET` and database credentials
2. **Redis**: Enable Redis caching for better performance (already implemented, just set REDIS_URL)
3. **CDN**: Use CDN for static assets
4. **Rate Limiting**: Adjust rate limits based on traffic
5. **Monitoring**: Add logging and error tracking (e.g., Sentry)
6. **Moderation Queue**: Implement a proper moderation dashboard
7. **Email Verification**: Add email verification for user accounts
8. **HTTPS**: Always use HTTPS in production

## Legal & Safety

- Reviews are never deleted instantly (status flow: ACTIVE → FLAGGED → HIDDEN → REMOVED)
- IP addresses are hashed, not stored in plaintext
- Content moderation preserves auditability
- No public replies to reviews (avoids flame wars)

## License

MIT
