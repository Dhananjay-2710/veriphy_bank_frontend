# Veriphy Bank Database Setup Scripts

This directory contains scripts to set up and populate your Supabase database with all the necessary tables and sample data.

## 🚀 Quick Start

### Option 1: SQL Editor (Recommended - Easiest)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Complete Setup**
   - Copy the contents of `complete_database_setup.sql`
   - Paste it into the SQL Editor
   - Click "Run"

3. **Done!** ✅
   - All tables will be created
   - Sample data will be inserted
   - Your application will work without errors

### Option 2: Node.js Script

1. **Install Dependencies**
   ```bash
   cd database
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   export VITE_SUPABASE_URL="your-supabase-url"
   export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

3. **Run the Script**
   ```bash
   npm run setup
   ```

## 📁 Files Overview

### SQL Scripts
- **`complete_database_setup.sql`** - Complete setup script (run in SQL Editor)
- **`run_system_settings_migration.sql`** - System settings only
- **`007_create_system_settings_tables.sql`** - Migration file

### Node.js Scripts
- **`populate_all_tables.js`** - Complete database population script
- **`execute-system-settings-migration.js`** - System settings migration executor

### Configuration
- **`package.json`** - Node.js dependencies and scripts
- **`README.md`** - This file

## 🗄️ What Gets Created

### Tables Created
- ✅ `system_settings` - Global application settings
- ✅ `organization_settings` - Per-tenant settings
- ✅ All existing tables get sample data

### Sample Data Included
- **System Settings** (20+ configuration values)
- **Organizations** (2 sample organizations)
- **Users** (4 sample users with different roles)
- **Customers** (3 sample customers)
- **Loan Applications** (3 sample applications)
- **Documents** (3 sample documents)
- **Tasks** (3 sample tasks)
- **Organization Settings** (6 configuration values)

### Security Features
- ✅ Row Level Security (RLS) enabled
- ✅ Proper access policies configured
- ✅ Admin-only access to system settings
- ✅ Organization-scoped access to organization settings

## 🔧 Configuration Values

### System Settings
- App name, version, maintenance mode
- File upload limits and allowed types
- Security settings (password requirements, 2FA)
- Cache and performance settings
- Notification preferences
- API rate limits
- Audit and logging configurations

### Organization Settings
- Company name and address
- Loan limits and interest rates
- Working hours
- Custom configurations

## 🚨 Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Run the complete setup script
   - Check that you're using the correct Supabase project

2. **Permission denied errors**
   - Make sure you're using the service role key, not the anon key
   - Check that RLS policies are set up correctly

3. **Data not showing up**
   - Refresh your application
   - Check the Supabase logs for errors
   - Verify that the data was inserted correctly

### Manual Verification

Check if the setup worked:

```sql
-- Check system settings
SELECT COUNT(*) FROM system_settings;

-- Check organization settings
SELECT COUNT(*) FROM organization_settings;

-- Check sample data
SELECT * FROM system_settings LIMIT 5;
```

## 📊 Expected Results

After running the setup:

✅ **No more 404 errors**  
✅ **System settings page loads**  
✅ **Admin interface works**  
✅ **Sample data visible**  
✅ **All features functional**  

## 🔄 Re-running the Script

The scripts are idempotent, meaning you can run them multiple times safely:
- Existing data won't be duplicated
- New data will be added
- Settings will be updated if needed

## 📝 Next Steps

1. **Refresh your application**
2. **Test the system settings page**
3. **Verify admin functionality**
4. **Customize settings as needed**
5. **Add your own data**

## 🆘 Need Help?

If you encounter any issues:

1. Check the Supabase logs
2. Verify your environment variables
3. Make sure you have the correct permissions
4. Try running the SQL script manually in the SQL Editor

## 🎯 What This Fixes

This setup resolves:
- ❌ `Could not find the table 'public.system_settings'` error
- ❌ 404 errors when loading system settings
- ❌ Missing configuration data
- ❌ Empty admin interfaces
- ❌ Database connection issues

After running this, your Veriphy Bank application will be fully functional! 🎉