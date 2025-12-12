# Layout Files Structure

This document explains the purpose of each `layout.tsx` file in the Next.js App Router structure.

## Next.js App Router Layout Hierarchy

In Next.js App Router, layouts are nested and wrap child routes. Each layout wraps its children, creating a hierarchy.

## Layout Files Overview

### 1. `app/layout.tsx` - **Root Layout** (Required)
**Path:** `/` (root of app)

**Purpose:** 
- The root layout that wraps ALL pages in the application
- Sets up global providers (ClerkProvider for authentication)
- Defines HTML structure, metadata, and global styles
- This is the outermost wrapper

**What it does:**
- Wraps everything in `<ClerkProvider>` for authentication
- Provides the basic HTML structure (`<html>`, `<body>`)
- Loads global CSS (`globals.css`)
- Sets page metadata (title, description)

**Routes it affects:** ALL routes (`/`, `/sign-in`, `/app/*`, `/admin/*`, etc.)

---

### 2. `app/(protected)/select-org/layout.tsx` - **Organization Selection Layout**
**Path:** `/select-org`

**Purpose:**
- Wraps the organization selection page
- **Redirects super-admins** to `/admin` before the page renders
- Allows regular users to see the organization selection UI

**What it does:**
- Checks if user is super-admin → redirects to `/admin`
- If not super-admin, shows the organization selection page
- Minimal wrapper (no Navbar/Sidebar - the page has its own header)

**Routes it affects:** `/select-org` only

**Key Logic:**
```typescript
if (await isFirmSuperAdmin()) {
  redirect('/admin')  // Super-admins skip org selection
}
```

---

### 3. `app/(protected)/app/layout.tsx` - **Client Portal Layout**
**Path:** `/app/*` (all client portal routes)

**Purpose:**
- Wraps all client portal pages (documents, settings, etc.)
- **Redirects super-admins** to `/admin` (they shouldn't access client portal)
- Ensures user has an active organization
- Provides the main client portal UI (Navbar, Sidebar, tenant info)

**What it does:**
- Checks if user is super-admin → redirects to `/admin`
- Validates user has an active organization → redirects to `/select-org` if not
- Displays Navbar with organization switcher
- Displays Sidebar (client portal navigation)
- Shows tenant name and plan tier badge

**Routes it affects:** `/app/*` (e.g., `/app/documents`, `/app/settings`)

**Key Logic:**
```typescript
if (await isFirmSuperAdmin()) {
  redirect('/admin')  // Super-admins go to admin, not client portal
}
// Ensure user has organization
tenant = await getCurrentTenant()  // Throws if no org → redirects to /select-org
```

---

### 4. `app/(protected)/admin/layout.tsx` - **Admin Dashboard Layout**
**Path:** `/admin/*` (all admin routes)

**Purpose:**
- Wraps all admin dashboard pages
- **Requires firm admin/super-admin role** (redirects to `/app` if not authorized)
- Provides the admin UI (Navbar, Admin Sidebar)

**What it does:**
- Checks if user has firm admin or super-admin role
- If not authorized → redirects to `/app`
- Displays Navbar (without organization switcher - admins don't need it)
- Displays Admin Sidebar (different navigation than client portal)

**Routes it affects:** `/admin/*` (e.g., `/admin/users`, `/admin/settings`)

**Key Logic:**
```typescript
await requireFirmAdmin()  // Throws if not admin → redirects to /app
```

---

## Route Groups: `(protected)` and `(public)`

The parentheses `()` create **route groups** in Next.js - they organize files but don't affect the URL structure.

- `app/(protected)/` - Routes that require authentication
- `app/(public)/` - Routes that are publicly accessible (sign-in, sign-up)

**Note:** Route groups are just for organization. They don't appear in URLs:
- `app/(protected)/app/page.tsx` → URL is `/app` (not `/protected/app`)
- `app/(public)/sign-in/page.tsx` → URL is `/sign-in` (not `/public/sign-in`)

---

## Layout Hierarchy (Visual)

```
app/layout.tsx (Root - wraps everything)
  │
  ├─ app/(public)/sign-in/page.tsx
  │   └─ Uses: Root Layout only
  │
  ├─ app/(protected)/select-org/
  │   ├─ layout.tsx (Select Org Layout)
  │   └─ page.tsx
  │       └─ Uses: Root Layout → Select Org Layout
  │
  ├─ app/(protected)/app/
  │   ├─ layout.tsx (Client Portal Layout)
  │   ├─ page.tsx
  │   ├─ documents/page.tsx
  │   └─ settings/page.tsx
  │       └─ Uses: Root Layout → Client Portal Layout
  │
  └─ app/(protected)/admin/
      ├─ layout.tsx (Admin Layout)
      ├─ page.tsx
      └─ users/page.tsx
          └─ Uses: Root Layout → Admin Layout
```

---

## Summary Table

| Layout File | Route | Purpose | Redirects |
|------------|-------|---------|-----------|
| `app/layout.tsx` | All routes | Root layout, ClerkProvider | None |
| `app/(protected)/select-org/layout.tsx` | `/select-org` | Org selection wrapper | Super-admins → `/admin` |
| `app/(protected)/app/layout.tsx` | `/app/*` | Client portal wrapper | Super-admins → `/admin`, No org → `/select-org` |
| `app/(protected)/admin/layout.tsx` | `/admin/*` | Admin dashboard wrapper | Non-admins → `/app` |

---

## Key Takeaways

1. **Root Layout** (`app/layout.tsx`) wraps everything - it's always active
2. **Select Org Layout** redirects super-admins away (they don't need to select orgs)
3. **App Layout** redirects super-admins away (they use admin dashboard, not client portal)
4. **Admin Layout** requires admin role (redirects non-admins away)
5. Route groups `(protected)` and `(public)` are just for file organization, not URLs

