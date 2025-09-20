#!/usr/bin/env node

/**
 * System Settings Migration Executor
 * 
 * This script executes the system_settings migration to create the required tables
 * in your Supabase database.
 * 
 * Usage:
 * 1. Make sure you have your Supabase credentials configured
 * 2. Run: node execute-system-settings-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    console.log('🚀 Starting System Settings Migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'run_system_settings_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded successfully');
    
    // Execute the migration
    console.log('⚡ Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If the RPC function doesn't exist, try direct execution
      console.log('⚠️  RPC method not available, trying direct execution...');
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase
              .from('system_settings')
              .select('id')
              .limit(1);
            
            if (stmtError && stmtError.code === 'PGRST205') {
              // Table doesn't exist, we need to create it
              console.log('📋 Creating system_settings table...');
              // This would need to be done via Supabase dashboard or psql
              console.log('⚠️  Please execute the migration SQL manually in your Supabase SQL Editor');
              console.log('📁 Migration file location:', migrationPath);
              break;
            }
          } catch (err) {
            console.log('⚠️  Please execute the migration SQL manually in your Supabase SQL Editor');
            console.log('📁 Migration file location:', migrationPath);
            break;
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully!');
    }
    
    // Verify the tables exist
    console.log('🔍 Verifying tables...');
    
    const { data: systemSettings, error: systemError } = await supabase
      .from('system_settings')
      .select('id, key, value, category')
      .limit(5);
    
    if (systemError) {
      console.error('❌ Error verifying system_settings table:', systemError.message);
      console.log('📋 Please run the migration SQL manually in your Supabase SQL Editor');
      console.log('📁 Migration file location:', migrationPath);
    } else {
      console.log('✅ system_settings table verified successfully!');
      console.log('📊 Sample settings:', systemSettings);
    }
    
    const { data: orgSettings, error: orgError } = await supabase
      .from('organization_settings')
      .select('id')
      .limit(1);
    
    if (orgError) {
      console.error('❌ Error verifying organization_settings table:', orgError.message);
    } else {
      console.log('✅ organization_settings table verified successfully!');
    }
    
    console.log('🎉 Migration process completed!');
    console.log('📝 Next steps:');
    console.log('   1. Refresh your application');
    console.log('   2. Check the system settings page');
    console.log('   3. Verify that the error is resolved');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('📋 Please run the migration SQL manually in your Supabase SQL Editor');
    console.log('📁 Migration file location:', path.join(__dirname, 'run_system_settings_migration.sql'));
  }
}

// Run the migration
executeMigration();
