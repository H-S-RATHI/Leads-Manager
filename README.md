# Next.js CRM System

A comprehensive Customer Relationship Management (CRM) system built with Next.js, featuring lead management, Facebook Lead Ads integration, user authentication, and activity tracking.

## Features

### 🔐 Authentication & Authorization
- Email/password authentication with NextAuth.js
- Role-based access control (Super Admin, Admin, Sales Rep)
- Secure password hashing with bcrypt

### 👥 User Management
- User profiles with photo upload capability
- Role-based permissions and access control
- User activity tracking

### 📊 Lead Management
- Facebook Lead Ads webhook integration
- Lead assignment with custom notes
- Status tracking (New → Contacted → Qualified → Purchased)
- Clickable phone numbers for direct dialing
- Lead filtering and pagination

### 📈 Analytics & Reporting
- Dashboard with key metrics
- Facebook Ads performance insights
- Conversion tracking with Facebook Conversions API
- Activity logging for Super Admins

### 💬 Social Features
- Company feed for team updates
- Like functionality on posts
- Disabled comment/share features (as requested)

### 🔧 Technical Features
- MongoDB Atlas integration with Mongoose
- Responsive design with Tailwind CSS
- API routes for all backend functionality
- Error handling and logging
- Privacy policy compliance

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Facebook Developer account (for Lead Ads integration)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd nextjs-crm
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables:

\`\`\`env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Facebook Integration
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token
FACEBOOK_VERIFY_TOKEN=your-verify-token
FACEBOOK_PIXEL_ID=your-pixel-id
FACEBOOK_CONVERSIONS_ACCESS_TOKEN=your-conversions-access-token
FACEBOOK_TEST_EVENT_CODE=your-test-event-code
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application will automatically create the necessary collections when you first run it. The main collections are:

- `users` - User accounts and profiles
- `leads` - Lead information from Facebook Lead Ads
- `posts` - Company feed posts
- `activities` - System activity logs
- `errors` - Error tracking

### Facebook Lead Ads Setup

1. Create a Facebook App in the Facebook Developer Console
2. Set up Lead Ads permissions
3. Configure webhook URL: `https://yourdomain.com/api/webhooks/facebook`
4. Add your verify token to environment variables
5. Subscribe to `leadgen` webhook events

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (handled by NextAuth)

### Leads
- `GET /api/leads` - Get leads with filtering and pagination
- `GET /api/leads/[id]` - Get specific lead details
- `POST /api/leads/[id]/assign` - Assign lead to user
- `PUT /api/leads/[id]/status` - Update lead status

### Users
- `GET /api/users` - Get all users (Admin+ only)

### Feed
- `GET /api/feed` - Get feed posts
- `POST /api/feed` - Create new post
- `POST /api/feed/[id]/like` - Like/unlike post

### Activity
- `GET /api/activity` - Get activity logs (Super Admin only)
- `POST /api/activity` - Log new activity

### Webhooks
- `POST /api/webhooks/facebook` - Facebook Lead Ads webhook
- `GET /api/webhooks/facebook` - Webhook verification

### Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/ads/insights` - Facebook Ads insights

## User Roles & Permissions

### Super Admin
- Full system access
- View activity logs
- Manage all users and leads
- Access to all features

### Admin  
- Manage leads and users
- Assign leads to any user
- Cannot access Super Admin activity logs

### Sales Rep
- View and update assigned leads only
- Can reassign own leads (with password confirmation)
- Limited dashboard access

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- Database connection string
- NextAuth configuration
- Facebook API credentials
- Any other service API keys

## Testing

Run the test suite:

\`\`\`bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires Playwright setup)
npm run test:e2e
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security Considerations

- All passwords are hashed using bcrypt
- API routes include authentication checks
- Role-based access control implemented
- Facebook webhook signature verification
- Input validation and sanitization
- HTTPS required for production

##
