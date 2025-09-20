# SYSTEM SETTINGS TABLE FIX

## Issue
The application is showing a 404 error when trying to access the `system_settings` table:
```
Could not find the table 'public.system_settings' in the schema cache
```

## Root Cause
The `system_settings` table doesn't exist in your Supabase database yet. The table definition exists in the migration files, but the migration hasn't been executed.

## Solution

### Option 1: Execute Migration via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Execute the Migration**
   - Copy the contents of `database/run_system_settings_migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify Success**
   - You should see the tables created successfully
   - The script will show sample data from the system_settings table

### Option 2: Execute Migration via Command Line

1. **Install Dependencies** (if not already installed)
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Set Environment Variables**
   ```bash
   export VITE_SUPABASE_URL="your-supabase-url"
   export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

3. **Run the Migration Script**
   ```bash
   node database/execute-system-settings-migration.js
   ```

### Option 3: Manual Table Creation

If the above options don't work, you can manually create the tables:

1. **Create system_settings table:**
   ```sql
   CREATE TABLE system_settings (
       id BIGSERIAL PRIMARY KEY,
       key VARCHAR(100) NOT NULL UNIQUE,
       value TEXT,
       description TEXT,
       category VARCHAR(50) DEFAULT 'general',
       is_encrypted BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Create organization_settings table:**
   ```sql
   CREATE TABLE organization_settings (
       id BIGSERIAL PRIMARY KEY,
       organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
       key VARCHAR(100) NOT NULL,
       value TEXT,
       description TEXT,
       category VARCHAR(50) DEFAULT 'general',
       is_encrypted BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(organization_id, key)
   );
   ```

3. **Add Row Level Security:**
   ```sql
   ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
   ```

4. **Insert Default Settings:**
   ```sql
   INSERT INTO system_settings (key, value, description, category) VALUES
   ('app_name', 'Veriphy Bank', 'Application name', 'general'),
   ('app_version', '1.0.0', 'Application version', 'general'),
   ('maintenance_mode', 'false', 'Maintenance mode status', 'system');
   ```

## Verification

After executing the migration, you can verify it worked by:

1. **Check the tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('system_settings', 'organization_settings');
   ```

2. **Check the data:**
   ```sql
   SELECT * FROM system_settings LIMIT 5;
   ```

3. **Refresh your application** - the error should be resolved

## Files Created

- `database/migrations/007_create_system_settings_tables.sql` - Complete migration file
- `database/run_system_settings_migration.sql` - Simple execution script
- `database/execute-system-settings-migration.js` - Node.js migration executor

## Expected Result

After running the migration, your application should:
- ✅ Load system settings without errors
- ✅ Display the system settings page properly
- ✅ Show default configuration values
- ✅ Allow admin users to manage settings

## Troubleshooting

If you still encounter issues:

1. **Check Supabase Logs** - Look for any error messages in the Supabase dashboard
2. **Verify RLS Policies** - Make sure Row Level Security policies are set up correctly
3. **Check User Permissions** - Ensure your user has admin role to access system settings
4. **Clear Browser Cache** - Sometimes cached errors persist

## Next Steps

Once the migration is complete:
1. The system settings page should load without errors
2. You can configure application settings through the admin interface
3. The caching and performance features will be fully functional
4. All database operations should work smoothly

Let me know if you need help with any of these steps!
