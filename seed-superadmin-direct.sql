-- Simple SQL to seed super-admin role
-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk user ID (starts with 'user_')
-- Example: 'user_2abc123def456'

INSERT INTO global_roles ("userId", role) 
VALUES ('YOUR_CLERK_USER_ID', 'superadmin') 
ON CONFLICT ("userId") 
DO UPDATE SET role = 'superadmin';

-- To check what's currently in the database:
-- SELECT * FROM global_roles;





