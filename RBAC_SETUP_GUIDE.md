# Role-Based Access Control (RBAC) Setup Guide

## Overview
This application implements a comprehensive Role-Based Access Control system with the following roles:
- **Admin**: Full system access, user management
- **Store Manager**: Store inventory management
- **Inventory Analyst**: Analytics and reporting
- **Warehouse Staff**: Warehouse operations

## 🔐 How It Works

### 1. **User Creation Flow**
- Only **admins** can create users through the Admin Panel
- When creating a user, admin assigns a role immediately
- Users are created with their email and assigned role in the database
- No password is set (they will use Google OAuth to log in)

### 2. **Login Flow**
- Users log in via **Google OAuth**
- System checks if user's email exists in database
- If user exists: Links Google account and allows login
- If user doesn't exist: **Rejects login** with error message
- Users without assigned roles cannot log in

### 3. **Access Control**
- Each route is protected by role-based middleware
- Users are automatically redirected to their role-specific dashboard
- Unauthorized access attempts are blocked

## 📋 Setup Instructions

### Step 1: Database Setup

1. **Run the initial database setup:**
```bash
psql -U postgres -f backend/db_setup.sql
```

2. **(Optional) Clean up unauthorized users:**
```bash
psql -U postgres -d invt_db -f backend/cleanup_users.sql
```

### Step 2: Make Your Email an Admin

**Option A: If you haven't logged in yet**
```sql
-- Connect to database
psql -U postgres -d invt_db

-- Create admin user
INSERT INTO users (username, email, role, password) 
VALUES ('Your Name', 'abhishek.cd23@bitsathy.ac.in', 'admin', NULL);
```

**Option B: If you already logged in (and got rejected)**
```sql
-- Connect to database
psql -U postgres -d invt_db

-- Update your role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'abhishek.cd23@bitsathy.ac.in';
```

**Option C: Use the provided script**
```bash
psql -U postgres -d invt_db -f backend/make_admin.sql
```

### Step 3: Start the Application

1. **Start Backend:**
```bash
cd backend
npm install
npm start
```

2. **Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Step 4: First Login

1. Go to `http://localhost:5173/login`
2. Click "Login with Google"
3. Sign in with `abhishek.cd23@bitsathy.ac.in`
4. You'll be redirected to the Admin Panel

## 👥 Managing Users (Admin Only)

### Adding New Users

1. Go to **Admin Panel** → **Users** tab
2. Click **"Invite Member"**
3. Enter user's email address
4. Select their role:
   - Admin
   - Store Manager
   - Inventory Analyst
   - Warehouse Staff
5. Click **"Send Invitation"**
6. User is created immediately in the database
7. User can now log in with Google using that email

### Updating User Roles

1. In the **Users** tab, find the user
2. Use the dropdown to change their role
3. Changes are saved immediately

### Deleting Users

1. In the **Users** tab, find the user
2. Click the three dots menu
3. Click **"Remove"**
4. Confirm deletion

## 🚫 What Happens to Unauthorized Users?

### Before the Fix (Old Behavior)
- Anyone could log in via Google
- They were created with default 'user' role
- They couldn't access anything but were in the database

### After the Fix (Current Behavior)
- Only pre-created users can log in
- Unauthorized login attempts are rejected
- Error message: "Your email is not authorized. Please contact an administrator to get access."
- No database entry is created for unauthorized users

## 🔍 Role-Based Page Access

### Admin
- ✅ Admin Panel (User Management, Roles, Stores, Suppliers)
- ✅ Analytics Dashboard
- ✅ All other pages

### Store Manager
- ✅ Store Dashboard
- ✅ Inventory Management
- ✅ Low Stock Alerts
- ✅ Reorder Management
- ❌ Admin Panel
- ❌ Analytics (view only)

### Inventory Analyst
- ✅ Analytics Dashboard
- ✅ Forecast Reports
- ✅ Inventory Performance
- ❌ Admin Panel
- ❌ Inventory Modification

### Warehouse Staff
- ✅ Warehouse Dashboard
- ✅ Purchase Orders
- ✅ Shipments
- ❌ Admin Panel
- ❌ Analytics

## 🛠️ Technical Implementation

### Backend Protection

**Middleware Stack:**
```javascript
// Authentication Middleware
authMiddleware  // Verifies JWT token

// Role-Based Middleware
checkRole('admin', 'store_manager')  // Checks user role
```

**Example Protected Route:**
```javascript
router.get('/users', 
  authMiddleware,           // Must be logged in
  checkRole('admin'),       // Must be admin
  userController.getAllUsers
);
```

### Frontend Protection

**Route Protection:**
```tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

**Automatic Redirection:**
- Users are redirected to their role-specific dashboard on login
- Unauthorized route access redirects to appropriate page

## 📊 Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),           -- NULL for Google OAuth users
    google_id VARCHAR(255) UNIQUE,   -- Linked on first Google login
    avatar_url TEXT,
    role VARCHAR(50),                -- 'admin', 'store_manager', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Troubleshooting

### Issue: "Unauthorized Access" error when logging in
**Solution:** Your email needs to be added by an admin first
1. Contact the system administrator
2. They will add your email with appropriate role
3. Then you can log in with Google

### Issue: Can't see any users in Admin Panel
**Solution:** Make sure you're filtering correctly
- Only users with assigned roles are shown
- Users with 'user' role or NULL are hidden

### Issue: User created but can't log in
**Solution:** Check their role assignment
```sql
SELECT email, role FROM users WHERE email = 'user@example.com';
```
If role is 'user' or NULL, update it:
```sql
UPDATE users SET role = 'store_manager' WHERE email = 'user@example.com';
```

## 🔐 Security Features

1. **No Auto-Registration**: Users can't self-register
2. **Admin-Only User Creation**: Only admins can add users
3. **Role Validation**: All roles are validated on backend
4. **JWT Authentication**: Secure token-based auth
5. **Route Protection**: Both frontend and backend route guards
6. **Database Filtering**: Unauthorized users filtered at DB level

## 📝 API Endpoints

### User Management (Admin Only)

```
GET    /api/users              - Get all users with roles
GET    /api/users/:userId      - Get user by ID
POST   /api/users/invite       - Create new user with role
PUT    /api/users/:userId/role - Update user role
DELETE /api/users/:userId      - Delete user
```

### Authentication

```
POST   /api/auth/login         - Email/password login
POST   /api/auth/signup        - Register (disabled for now)
GET    /api/auth/google        - Initiate Google OAuth
GET    /api/auth/google/callback - Google OAuth callback
GET    /api/auth/me            - Get current user info
```

## 🎯 Next Steps

1. ✅ Set up your admin account
2. ✅ Log in and access Admin Panel
3. ✅ Add team members with appropriate roles
4. ✅ Test login with different roles
5. ✅ Verify role-based access control

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check backend logs for authentication errors
3. Verify database role assignments
4. Ensure environment variables are set correctly

---

**Created:** 2026-02-06  
**Version:** 1.0  
**System:** INVT - Inventory Management System
