# RPC Client Portal Backend

Express backend API for the RPC Client Portal with Role-Based Access Control (RBAC) using Clerk authentication.

## Features

- **Clerk Authentication**: Secure authentication using Clerk SDK
- **RBAC System**: Global roles (superadmin, support, auditor) stored in PostgreSQL
- **Multi-tenant Support**: Organization-scoped permissions
- **TypeScript**: Full type safety throughout the codebase
- **Prisma ORM**: Type-safe database access

## Architecture

This backend implements **Approach A** for admin access:

- Global super-admin roles are stored in PostgreSQL (`global_roles` table)
- Super-admin role is **not tied to any single Clerk organization**
- Backend enforces permissions via middleware (`requireAuth`, `requireSuperAdmin`)
- Fine-grained permissions can be stored in `user_permissions` table

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL database (shared with Next.js app)
- Clerk account with API keys

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```env
# Database (same as your Next.js app)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?sslmode=require"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS (frontend URL)
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Migration

The Prisma schema is located in the root `prisma/schema.prisma` file (shared with the Next.js app).

Run the migration to create the new RBAC tables:

```bash
# From the backend directory
npm run prisma:migrate:dev

# Or from the root directory
cd ..
npx prisma migrate dev --name add_rbac_tables
```

This will create:
- `global_roles` table
- `user_permissions` table
- `GlobalRoleType` enum

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Seed Super-Admin Role

Grant yourself the super-admin role:

```bash
# Set your Clerk user ID as an environment variable
FIRM_OWNER_CLERK_USER_ID=user_2abc123def456 npm run seed:superadmin

# Or edit backend/scripts/seed-superadmin.ts and replace the placeholder
```

**How to find your Clerk User ID:**
1. Sign in to your application
2. Check the Clerk Dashboard → Users
3. Or decode your JWT token (the `sub` claim is your user ID)

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Public Endpoints

- `GET /health` - Health check endpoint

### Authenticated Endpoints

#### `GET /api/me`
Returns current user information including global role.

**Headers:**
```
Authorization: Bearer <clerk_session_token>
```

**Response:**
```json
{
  "userId": "user_2abc123",
  "orgId": "org_2def456",
  "orgRole": "admin",
  "globalRole": "superadmin"
}
```

### Super-Admin Endpoints

All admin endpoints require the `superadmin` global role.

#### `GET /api/admin/tenants`
List all organizations/tenants.

**Response:**
```json
{
  "tenants": [
    {
      "id": "org_2def456",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "planTier": "PREMIUM",
      "createdAt": 1234567890,
      "memberCount": 5
    }
  ],
  "total": 1
}
```

#### `GET /api/admin/users`
List all users with their roles and organization memberships.

**Response:**
```json
{
  "users": [
    {
      "clerkUserId": "user_2abc123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "globalRole": "superadmin",
      "organizations": [
        {
          "id": "org_2def456",
          "name": "Acme Corp",
          "role": "admin"
        }
      ]
    }
  ],
  "total": 1
}
```

#### `POST /api/admin/roles/grant-superadmin`
Grant super-admin role to a user.

**Request Body:**
```json
{
  "userId": "user_2xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "globalRole": {
    "id": 1,
    "userId": "user_2xyz789",
    "role": "superadmin"
  },
  "message": "Super-admin role granted to user user_2xyz789"
}
```

## Authentication

All API endpoints (except `/health`) require authentication via Clerk.

### Getting a Session Token

In your frontend, use Clerk's `useAuth` hook:

```typescript
import { useAuth } from '@clerk/nextjs'

const { getToken } = useAuth()
const token = await getToken()

// Use token in Authorization header
fetch('http://localhost:3001/api/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Middleware

- **`requireAuth`**: Validates Clerk token and attaches `auth` object to request
- **`requireSuperAdmin`**: Requires authentication + `superadmin` role in database

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          # Environment variable configuration
│   │   ├── db.ts           # Prisma client instance
│   │   └── clerk.ts        # Clerk client instance
│   ├── middleware/
│   │   ├── auth.ts         # Authentication middleware
│   │   └── errorHandler.ts # Error handling middleware
│   ├── routes/
│   │   ├── index.ts        # Main router
│   │   ├── me.ts           # /api/me endpoint
│   │   └── admin/
│   │       ├── index.ts    # Admin router
│   │       ├── tenants.ts  # /api/admin/tenants
│   │       ├── users.ts    # /api/admin/users
│   │       └── roles.ts    # /api/admin/roles
│   ├── server.ts           # Express app configuration
│   └── index.ts            # Server bootstrap
├── scripts/
│   └── seed-superadmin.ts  # Seed script for super-admin
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Running in Development Mode

```bash
npm run dev
```

Uses `nodemon` to automatically restart on file changes.

### Building for Production

```bash
npm run build
```

Outputs compiled JavaScript to `dist/` directory.

### Running in Production

```bash
npm start
```

## Database Schema

### GlobalRole Model

```prisma
model GlobalRole {
  id     Int            @id @default(autoincrement())
  userId String         @unique // Clerk user ID
  role   GlobalRoleType
}
```

### UserPermission Model

```prisma
model UserPermission {
  id         Int    @id @default(autoincrement())
  userId     String // Clerk user ID
  orgId      String? // Clerk organization ID (nullable for global permissions)
  permission String

  @@unique([userId, orgId, permission])
}
```

## Troubleshooting

### "Missing required environment variable" Error

Make sure all required environment variables are set in `.env`:
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`

### "Invalid or expired token" Error

- Ensure you're passing a valid Clerk session token
- Check that `CLERK_SECRET_KEY` matches your Clerk application
- Token may have expired - get a new token from Clerk

### "Forbidden: Super-admin access required" Error

- Run the seed script to grant yourself super-admin role
- Verify your user ID is correct in the `global_roles` table
- Check that the role is set to `'superadmin'`

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network/firewall settings

## Integration with Frontend

See `frontend/components/SuperAdminBadge.tsx` for an example of how to:
- Call the backend API from a React component
- Check for super-admin role
- Display admin UI conditionally

## License

ISC


