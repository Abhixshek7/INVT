-- Optional cleanup script for users table
-- Run this ONLY if you want to clean up existing unauthorized users

-- 1. Delete any users with default 'user' role (unauthorized users who logged in before the fix)
DELETE FROM users WHERE role = 'user';

-- 2. (Optional) Change the default role to NULL instead of 'user'
-- This makes it clearer when someone doesn't have an assigned role
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- 3. Make abhishek.cd23@bitsathy.ac.in an admin
-- This will update if exists, or you can manually insert if needed
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishek.cd23@bitsathy.ac.in';

-- If the user doesn't exist yet, uncomment and run this:
-- INSERT INTO users (username, email, role, password) 
-- VALUES ('Abhishek', 'abhishek.cd23@bitsathy.ac.in', 'admin', NULL)
-- ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 4. Verify the changes
SELECT id, username, email, role, created_at 
FROM users 
ORDER BY created_at DESC;
