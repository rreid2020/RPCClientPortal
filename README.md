# RPC Associates Client Portal

A multi-tenant client portal for RPC Associates accounting firm, built with Next.js, Clerk, Prisma, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Organization-scoped data with tenant isolation
- **Authentication & Organizations**: Powered by Clerk with organization support
- **Role-Based Access Control**: 
  - Firm admins and staff (platform owners)
  - Organization admins and members (clients)
- **Plan Tiers**: Free, Standard, and Premium plans with feature flags
- **Documents Management**: Organization-scoped document storage
- **Admin Dashboard**: Manage organizations and plan tiers

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **UI**: Tailwind CSS + Headless UI
- **Authentication**: Clerk (hosted) with Organizations
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: DigitalOcean App Platform

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or managed)
- Clerk account (free tier works for development)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RPCClientPortal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `CLERK_WEBHOOK_SECRET`: Your Clerk webhook signing secret
- `DATABASE_URL`: PostgreSQL connection string

### 4. Set Up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Enable **Organizations** in Clerk Dashboard:
   - Go to **Organizations** in the sidebar
   - Enable organizations
   - Configure roles: `org:admin` and `org:member`
4. Get your API keys from **API Keys** section
5. Set up webhooks:
   - Go to **Webhooks** in the sidebar
   - Create a new endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events:
     - `organization.created`
     - `organization.updated`
     - `organization.deleted`
     - `user.created`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

### 5. Set Up Database

#### Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb rpc_portal
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/rpc_portal?schema=public"
   ```

#### DigitalOcean Managed Database

1. Create a managed PostgreSQL database in DigitalOcean
2. Get the connection string from the database dashboard
3. Update `DATABASE_URL` in your environment variables

### 6. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npm run prisma:migrate:dev
```

This will create the database schema with the following tables:
- `user_profiles`: User profile data linked to Clerk users
- `organizations`: Organization/tenant data linked to Clerk organizations
- `documents`: Organization-scoped documents

### 7. Create a Firm Admin User (Optional)

To access the admin area, you need to mark a user as a firm admin. You can do this via Prisma Studio:

```bash
npm run prisma:studio
```

1. Find your user in the `user_profiles` table
2. Set `is_firm_super_admin` to `true`

Or use a database query:

```sql
UPDATE user_profiles 
SET is_firm_super_admin = true 
WHERE clerk_user_id = 'your_clerk_user_id';
```

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
RPCClientPortal/
├── app/
│   ├── (public)/              # Public routes (landing, sign-in, sign-up)
│   ├── (protected)/
│   │   ├── app/               # Client portal (requires org)
│   │   └── admin/             # Firm admin area (requires firm role)
│   ├── api/                   # API routes
│   │   ├── documents/         # Document CRUD endpoints
│   │   ├── admin/             # Admin endpoints
│   │   └── webhooks/          # Clerk webhook handler
│   ├── layout.tsx             # Root layout with ClerkProvider
│   └── middleware.ts          # Route protection
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── layout/                # Layout components (Navbar, Sidebar)
│   └── features/              # Feature-specific components
├── lib/
│   ├── auth.ts                # Clerk auth helpers
│   ├── db.ts                  # Prisma client
│   ├── tenant.ts              # Tenant resolution & isolation
│   ├── featureFlags.ts        # Plan tier feature flags
│   └── utils.ts               # Utility functions
└── prisma/
    └── schema.prisma          # Database schema
```

## Key Concepts

### Tenant Isolation

All business data is scoped by `organization_id`. The `getCurrentTenant()` function in `lib/tenant.ts` ensures:
- Active organization is derived from Clerk session (never from request body)
- All database queries are automatically filtered by organization
- Organization records are synced between Clerk and the database

### Role System

- **Clerk-level roles**: `org:admin`, `org:member` (managed in Clerk)
- **App-level roles**: `FIRM_SUPER_ADMIN`, `FIRM_STAFF` (stored in `user_profiles` table)

### Plan Tiers

- **FREE**: Basic document exchange and messaging
- **STANDARD**: Advanced reports and secure chat
- **PREMIUM**: All features including API access and priority support

Feature flags in `lib/featureFlags.ts` control access based on plan tier.

## Deployment to DigitalOcean

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, etc.).

### 2. Create DigitalOcean App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your Git repository
4. Select the branch to deploy

### 3. Configure Build Settings

- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Environment**: Node.js
- **Node Version**: 20.x

### 4. Add Environment Variables

Add all required environment variables in the App Platform dashboard:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `DATABASE_URL` (from your managed database)
- `NODE_ENV=production`

### 5. Add Managed Database

1. In your app settings, go to **Resources**
2. Click **Create Database**
3. Choose PostgreSQL
4. The connection string will be automatically added as `DATABASE_URL`

### 6. Run Migrations

After deployment, run migrations:

```bash
# SSH into your app or use DigitalOcean console
npm run prisma:migrate:deploy
```

Or add a post-deploy script in your app settings.

### 7. Update Clerk Webhook URL

Update your Clerk webhook endpoint to point to your production URL:
```
https://your-app.ondigitalocean.app/api/webhooks/clerk
```

### 8. Deploy

Click **Deploy** and wait for the build to complete.

## Docker Deployment (Alternative)

If you prefer to use Docker directly:

```bash
# Build the image
docker build -t rpc-portal .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
  -e CLERK_SECRET_KEY=... \
  -e CLERK_WEBHOOK_SECRET=... \
  -e DATABASE_URL=... \
  rpc-portal
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run prisma:migrate:dev`: Create and apply migrations (development)
- `npm run prisma:migrate:deploy`: Apply migrations (production)
- `npm run prisma:studio`: Open Prisma Studio (database GUI)

## Troubleshooting

### Organization Not Found

If you see "No active organization" errors:
1. Ensure you've created an organization in Clerk
2. Make sure you've selected the organization in the Clerk UI
3. Check that the webhook handler is working (organization should sync to DB)

### Can't Access Admin Area

1. Ensure your user has `is_firm_super_admin` or `is_firm_staff` set to `true` in the database
2. Check that you're signed in with the correct Clerk account

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check that your database is accessible from your network
3. For DigitalOcean, ensure your app and database are in the same region

## Future Enhancements

- [ ] Stripe integration for plan upgrades
- [ ] File upload and storage (S3/DigitalOcean Spaces)
- [ ] Advanced reporting features
- [ ] Secure chat functionality
- [ ] API access for Premium plans
- [ ] Email notifications
- [ ] Audit logging

## License

Proprietary - RPC Associates

## Support

For issues or questions, contact the development team.


