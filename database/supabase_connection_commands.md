# Supabase Database Connection Commands

## 🔧 Option 1: Direct PostgreSQL Connection (Recommended)

Supabase provides a direct PostgreSQL connection. Here's how to connect:

### Get Database Credentials
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `ztdkreblmgscvdnzvzeh`
3. Go to **Settings** → **Database**
4. Copy the connection details

### Connection Command
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ztdkreblmgscvdnzvzeh.supabase.co:5432/postgres"
```

### Alternative Connection Format
```bash
psql -h db.ztdkreblmgscvdnzvzeh.supabase.co -p 5432 -U postgres -d postgres
```

## 🚀 Option 2: Install Supabase CLI

### Windows Installation Methods:

#### Method A: Using Chocolatey
```powershell
# Install Chocolatey first if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Supabase CLI
choco install supabase
```

#### Method B: Download Binary
1. Go to: https://github.com/supabase/cli/releases
2. Download the Windows binary
3. Add to PATH

#### Method C: Using PowerShell (Direct Download)
```powershell
# Download and install Supabase CLI
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip" -OutFile "supabase.zip"
Expand-Archive -Path "supabase.zip" -DestinationPath "C:\supabase"
$env:PATH += ";C:\supabase"
```

### After Installation - Login and Connect
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ztdkreblmgscvdnzvzeh

# Start local development (optional)
supabase start

# Connect to database
supabase db connect
```

## 🔍 Option 3: Using Supabase Dashboard SQL Editor

1. Go to: https://supabase.com/dashboard/project/ztdkreblmgscvdnzvzeh
2. Navigate to **SQL Editor**
3. Run your queries directly in the browser

## 📊 Sample Queries to Test Connection

```sql
-- Check if tables exist
\dt

-- Count records in main tables
SELECT 'organizations' as table_name, count(*) as record_count FROM organizations
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'customers' as table_name, count(*) as record_count FROM customers
UNION ALL
SELECT 'cases' as table_name, count(*) as record_count FROM cases;

-- Show sample data
SELECT * FROM organizations LIMIT 5;
SELECT * FROM users LIMIT 5;
SELECT * FROM customers LIMIT 5;
```

## 🎯 Run Your Comprehensive Data Insertion

Once connected, run these commands in order:

```sql
-- Execute the comprehensive data insertion
\i comprehensive_mock_data_insert.sql
\i comprehensive_mock_data_insert_part2.sql
\i comprehensive_mock_data_insert_final.sql
```

## 🔑 Your Supabase Project Details
- **Project URL**: https://ztdkreblmgscvdnzvzeh.supabase.co
- **Project Reference**: ztdkreblmgscvdnzvzeh
- **Database Host**: db.ztdkreblmgscvdnzvzeh.supabase.co
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres

## 🛠️ Troubleshooting

### If psql is not found:
```powershell
# Install PostgreSQL client
winget install PostgreSQL.PostgreSQL
```

### If connection fails:
1. Check your Supabase project is active
2. Verify database password in Supabase dashboard
3. Ensure your IP is whitelisted (or use 0.0.0.0/0 for testing)
4. Check firewall settings

### Test connection without credentials:
```bash
# Test if host is reachable
ping db.ztdkreblmgscvdnzvzeh.supabase.co
telnet db.ztdkreblmgscvdnzvzeh.supabase.co 5432
```
