-- Make abhishek.cd23@bitsathy.ac.in an admin
-- This script will update the role to 'admin' if the user exists, or insert a new admin user

-- Update existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishek.cd23@bitsathy.ac.in';

-- If the user doesn't exist yet (hasn't logged in via Google), 
-- they will be created during first Google login with default 'user' role
-- Then this script should be run again to make them admin

-- You can also manually insert if needed:
-- INSERT INTO users (username, email, role, google_id) 
-- VALUES ('Abhishek', 'abhishek.cd23@bitsathy.ac.in', 'admin', NULL)
-- ON CONFLICT (email) DO UPDATE SET role = 'admin';
