@echo off
REM =============================================================================
REM BATCH SCRIPT TO INSERT MOCK DATA INTO SUPABASE DATABASE
REM =============================================================================

echo 🚀 Veriphy Bank - Mock Data Insertion Script
echo ==============================================

echo.
echo 📋 Method 1: Supabase Dashboard (Easiest)
echo ------------------------------------------
echo 1. Go to your Supabase project dashboard
echo 2. Navigate to SQL Editor
echo 3. Copy and paste the contents of database/insert_mock_data.sql
echo 4. Click 'Run' to execute the script
echo.

echo 📋 Method 2: Using Supabase CLI
echo --------------------------------
echo For local development:
echo   supabase start
echo   type database\insert_mock_data.sql ^| supabase db reset
echo.
echo For remote database:
echo   type database\insert_mock_data.sql ^| supabase db push --db-url "your-remote-database-url"
echo.

echo 📋 Method 3: Direct PostgreSQL connection
echo ------------------------------------------
echo If you have psql installed:
echo   psql -h your-db-host -p 5432 -U postgres -d postgres -f database/insert_mock_data.sql
echo.
echo For local Supabase:
echo   psql -h localhost -p 54322 -U postgres -d postgres -f database/insert_mock_data.sql
echo.

echo 🎯 Test Credentials
echo ===================
echo After insertion, you can login with these test credentials:
echo.
echo   Email: superadmin@veriphy.com
echo   Password: password123
echo.
echo   Email: priya.sharma@happybank.in
echo   Password: password123
echo.
echo   Email: rajesh.kumar@happybank.in
echo   Password: password123
echo.

echo ✅ Script completed! Choose one of the methods above to execute the SQL script.
pause
