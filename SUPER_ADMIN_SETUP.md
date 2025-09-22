# 🚀 Super Admin Setup Guide

This guide will help you set up the super admin user and access the system setup wizard for your VERIPHY banking application.

## 📋 Prerequisites

- Supabase project configured and running
- Database tables created (users, organizations, departments, products, etc.)
- Frontend application running (`npm run dev`)

## 🔧 Setup Methods

### Method 1: Using the Setup Page (Recommended)

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Navigate to the setup page:**
   - Go to `http://localhost:5173/setup`
   - Or click "Super Admin Setup" on the login page

3. **Create Super Admin:**
   - Click "Create Super Admin" button
   - Wait for success confirmation

4. **Login as Super Admin:**
   - Go to `http://localhost:5173/`
   - Email: `superadmin@veriphy.com`
   - Password: Any password (authentication is bypassed for testing)

### Method 2: Direct Database Insert

1. **Open your Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to Table Editor
   - Select the `users` table

2. **Insert Super Admin Record:**
   ```sql
   INSERT INTO users (
     full_name,
     email,
     mobile,
     role,
     status,
     created_at,
     updated_at
   ) VALUES (
     'Super Admin',
     'superadmin@veriphy.com',
     '+91-9999999999',
     'super_admin',
     'active',
     NOW(),
     NOW()
   );
   ```

### Method 3: Using Browser Console

1. **Open your application in browser**
2. **Open Developer Tools (F12)**
3. **Go to Console tab**
4. **Run this code:**
   ```javascript
   // Replace with your actual Supabase credentials
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   
   fetch(`${SUPABASE_URL}/rest/v1/users`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'apikey': SUPABASE_ANON_KEY,
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
       'Prefer': 'return=minimal'
     },
     body: JSON.stringify({
       full_name: 'Super Admin',
       email: 'superadmin@veriphy.com',
       mobile: '+91-9999999999',
       role: 'super_admin',
       status: 'active',
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
     })
   }).then(response => {
     if (response.ok) {
       console.log('✅ Super Admin created!');
     } else {
       console.error('❌ Error:', response.statusText);
     }
   });
   ```

## 🎯 After Super Admin Setup

### 1. Login as Super Admin
- **URL:** `http://localhost:5173/`
- **Email:** `superadmin@veriphy.com`
- **Password:** Any password

### 2. Access System Setup Wizard
- Click **"System Setup"** in the dashboard
- Follow the step-by-step wizard:
  1. **Organizations** - Create your first organization
  2. **Departments** - Set up department structure
  3. **Products** - Configure loan products
  4. **Workflows** - Set up approval workflows (coming soon)

### 3. Create Additional Users
- Use the **"Create New Account"** button to add regular users
- Assign them to organizations and departments
- Set appropriate roles (admin, manager, salesperson, etc.)

## 🔐 Super Admin Features

### Dashboard Access
- **System Overview** - Complete system statistics
- **Quick Actions** - Direct access to all management tools
- **Real-time Data** - Live updates from Supabase

### Management Tools
- **Organization Management** - Create/edit organizations
- **Department Management** - Set up hierarchical departments
- **Product Management** - Configure loan products
- **User Management** - Manage all users
- **System Settings** - Configure system parameters

### Setup Wizard
- **Step-by-step guidance** for initial setup
- **Progress tracking** with visual indicators
- **Validation** to ensure proper configuration
- **Real-time updates** as you complete each step

## 🛠️ Troubleshooting

### Common Issues

1. **"Super Admin not found" error:**
   - Make sure the user was created in the `users` table
   - Check that the role is exactly `super_admin`
   - Verify the email is `superadmin@veriphy.com`

2. **Login not working:**
   - Check browser console for errors
   - Verify Supabase connection
   - Make sure authentication is properly configured

3. **Setup wizard not accessible:**
   - Ensure you're logged in as super admin
   - Check that the role is properly set
   - Refresh the page and try again

### Database Verification

Check if super admin exists:
```sql
SELECT * FROM users WHERE email = 'superadmin@veriphy.com';
```

Expected result:
```
id | full_name   | email                    | role        | status
---|-------------|--------------------------|-------------|--------
1  | Super Admin | superadmin@veriphy.com   | super_admin | active
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all database tables are created
4. Check the network tab for failed requests

## 🎉 Next Steps

Once super admin is set up:
1. **Complete the setup wizard** to configure your system
2. **Create your first organization** and departments
3. **Add loan products** for your business
4. **Create additional users** with appropriate roles
5. **Start using the system** for loan processing

---

**Happy Banking! 🏦✨**
