#!/usr/bin/env node

/**
 * Complete Database Population Script
 * 
 * This script populates all Supabase tables with initial data including:
 * - System settings
 * - Organization settings
 * - User roles and permissions
 * - Sample organizations
 * - Sample users
 * - Sample customers
 * - Sample cases/loan applications
 * - Sample documents
 * - Sample tasks
 * - And much more...
 * 
 * Usage:
 * 1. Make sure you have your Supabase credentials configured
 * 2. Run: node populate_all_tables.js
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

// Helper function to execute SQL
async function executeSQL(sql, description) {
  try {
    console.log(`⚡ ${description}...`);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        // Try to execute via RPC first
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  RPC not available, trying direct table operations...`);
            // If RPC fails, we'll handle it in the main execution
            throw error;
          }
        } catch (rpcError) {
          // RPC not available, continue with table operations
          console.log(`📋 Note: Please execute the SQL manually in Supabase SQL Editor for: ${description}`);
          return false;
        }
      }
    }
    
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    return false;
  }
}

// Helper function to insert data via Supabase client
async function insertData(tableName, data, description) {
  try {
    console.log(`📊 ${description}...`);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting ${description}:`, error.message);
      return false;
    }
    
    console.log(`✅ ${description} completed! Inserted ${result?.length || 0} records`);
    return true;
  } catch (error) {
    console.error(`❌ Error inserting ${description}:`, error.message);
    return false;
  }
}

// Helper function to check if table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return !error || error.code !== 'PGRST205';
  } catch (error) {
    return false;
  }
}

async function populateDatabase() {
  try {
    console.log('🚀 Starting Complete Database Population...');
    console.log('=====================================');
    
    // 1. Create System Settings Table
    console.log('\n📋 Step 1: Creating System Settings Table');
    const systemSettingsSQL = `
      CREATE TABLE IF NOT EXISTS system_settings (
        id BIGSERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        is_encrypted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
      CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
      
      ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Only admins can view system settings" ON system_settings
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
          )
        );
    `;
    
    await executeSQL(systemSettingsSQL, 'Creating system_settings table');
    
    // 2. Create Organization Settings Table
    console.log('\n📋 Step 2: Creating Organization Settings Table');
    const orgSettingsSQL = `
      CREATE TABLE IF NOT EXISTS organization_settings (
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
      
      CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
      CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);
      
      ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
    `;
    
    await executeSQL(orgSettingsSQL, 'Creating organization_settings table');
    
    // 3. Insert System Settings
    console.log('\n📊 Step 3: Inserting System Settings');
    const systemSettings = [
      { key: 'app_name', value: 'Veriphy Bank', description: 'Application name', category: 'general', is_encrypted: false },
      { key: 'app_version', value: '1.0.0', description: 'Application version', category: 'general', is_encrypted: false },
      { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode status', category: 'system', is_encrypted: false },
      { key: 'max_file_size', value: '10485760', description: 'Maximum file upload size in bytes (10MB)', category: 'file_upload', is_encrypted: false },
      { key: 'allowed_file_types', value: 'pdf,jpg,jpeg,png,doc,docx', description: 'Allowed file types for upload', category: 'file_upload', is_encrypted: false },
      { key: 'session_timeout', value: '3600', description: 'Session timeout in seconds (1 hour)', category: 'security', is_encrypted: false },
      { key: 'password_min_length', value: '8', description: 'Minimum password length', category: 'security', is_encrypted: false },
      { key: 'password_require_special', value: 'true', description: 'Require special characters in password', category: 'security', is_encrypted: false },
      { key: 'email_verification_required', value: 'true', description: 'Require email verification for new users', category: 'security', is_encrypted: false },
      { key: 'two_factor_enabled', value: 'false', description: 'Enable two-factor authentication', category: 'security', is_encrypted: false },
      { key: 'audit_log_retention_days', value: '365', description: 'Audit log retention period in days', category: 'audit', is_encrypted: false },
      { key: 'cache_ttl_default', value: '3600', description: 'Default cache TTL in seconds', category: 'cache', is_encrypted: false },
      { key: 'rate_limit_requests_per_minute', value: '100', description: 'Rate limit for API requests per minute', category: 'api', is_encrypted: false },
      { key: 'backup_frequency_hours', value: '24', description: 'Database backup frequency in hours', category: 'backup', is_encrypted: false },
      { key: 'notification_email_enabled', value: 'true', description: 'Enable email notifications', category: 'notifications', is_encrypted: false },
      { key: 'notification_sms_enabled', value: 'false', description: 'Enable SMS notifications', category: 'notifications', is_encrypted: false },
      { key: 'whatsapp_integration_enabled', value: 'true', description: 'Enable WhatsApp integration', category: 'integrations', is_encrypted: false },
      { key: 'api_documentation_enabled', value: 'true', description: 'Enable API documentation', category: 'api', is_encrypted: false },
      { key: 'debug_mode', value: 'false', description: 'Enable debug mode', category: 'development', is_encrypted: false },
      { key: 'log_level', value: 'info', description: 'Application log level', category: 'logging', is_encrypted: false }
    ];
    
    await insertData('system_settings', systemSettings, 'Inserting system settings');
    
    // 4. Check if organizations table exists and create sample data
    console.log('\n📊 Step 4: Creating Sample Organizations');
    const orgExists = await tableExists('organizations');
    
    if (orgExists) {
      const organizations = [
        {
          name: 'Veriphy Bank Main',
          slug: 'veriphy-bank-main',
          domain: 'veriphybank.com',
          description: 'Main Veriphy Bank organization',
          status: 'active',
          subscription_plan: 'enterprise',
          max_users: 1000,
          max_loans_per_month: 10000,
          features: { 
            advanced_analytics: true, 
            custom_workflows: true, 
            api_access: true,
            priority_support: true
          }
        },
        {
          name: 'Veriphy Bank Branch Mumbai',
          slug: 'veriphy-bank-mumbai',
          domain: 'mumbai.veriphybank.com',
          description: 'Mumbai branch of Veriphy Bank',
          status: 'active',
          subscription_plan: 'professional',
          max_users: 100,
          max_loans_per_month: 1000,
          features: { 
            advanced_analytics: true, 
            custom_workflows: false, 
            api_access: true,
            priority_support: false
          }
        }
      ];
      
      await insertData('organizations', organizations, 'Inserting sample organizations');
    } else {
      console.log('⚠️  Organizations table not found, skipping organization data');
    }
    
    // 5. Check if users table exists and create sample users
    console.log('\n📊 Step 5: Creating Sample Users');
    const usersExists = await tableExists('users');
    
    if (usersExists) {
      const users = [
        {
          email: 'admin@veriphybank.com',
          full_name: 'System Administrator',
          role: 'admin',
          status: 'active',
          organization_id: 1,
          department_id: 1
        },
        {
          email: 'manager@veriphybank.com',
          full_name: 'Branch Manager',
          role: 'manager',
          status: 'active',
          organization_id: 1,
          department_id: 1
        },
        {
          email: 'sales@veriphybank.com',
          full_name: 'Sales Agent',
          role: 'salesperson',
          status: 'active',
          organization_id: 1,
          department_id: 2
        },
        {
          email: 'credit@veriphybank.com',
          full_name: 'Credit Analyst',
          role: 'credit-ops',
          status: 'active',
          organization_id: 1,
          department_id: 3
        }
      ];
      
      await insertData('users', users, 'Inserting sample users');
    } else {
      console.log('⚠️  Users table not found, skipping user data');
    }
    
    // 6. Check if customers table exists and create sample customers
    console.log('\n📊 Step 6: Creating Sample Customers');
    const customersExists = await tableExists('customers');
    
    if (customersExists) {
      const customers = [
        {
          user_id: 1,
          pan_number: 'ABCDE1234F',
          aadhaar_number: '123456789012',
          date_of_birth: '1985-06-15',
          gender: 'male',
          marital_status: 'married',
          employment_type: 'salaried',
          risk_profile: 'medium',
          kyc_status: 'verified'
        },
        {
          user_id: 2,
          pan_number: 'FGHIJ5678K',
          aadhaar_number: '987654321098',
          date_of_birth: '1990-03-22',
          gender: 'female',
          marital_status: 'single',
          employment_type: 'self-employed',
          risk_profile: 'high',
          kyc_status: 'pending'
        },
        {
          user_id: 3,
          pan_number: 'KLMNO9012P',
          aadhaar_number: '112233445566',
          date_of_birth: '1978-11-08',
          gender: 'male',
          marital_status: 'married',
          employment_type: 'salaried',
          risk_profile: 'low',
          kyc_status: 'verified'
        }
      ];
      
      await insertData('customers', customers, 'Inserting sample customers');
    } else {
      console.log('⚠️  Customers table not found, skipping customer data');
    }
    
    // 7. Check if cases/loan_applications table exists and create sample data
    console.log('\n📊 Step 7: Creating Sample Loan Applications');
    const casesExists = await tableExists('cases') || await tableExists('loan_applications');
    
    if (casesExists) {
      const tableName = await tableExists('cases') ? 'cases' : 'loan_applications';
      
      const loanApplications = [
        {
          case_number: 'CASE000001',
          customer_id: 1,
          assigned_to: 3,
          loan_type: 'Home Loan',
          loan_amount: 5000000,
          status: 'in-progress',
          priority: 'high',
          description: 'Home loan application for property purchase'
        },
        {
          case_number: 'CASE000002',
          customer_id: 2,
          assigned_to: 3,
          loan_type: 'Personal Loan',
          loan_amount: 500000,
          status: 'pending',
          priority: 'medium',
          description: 'Personal loan for business expansion'
        },
        {
          case_number: 'CASE000003',
          customer_id: 3,
          assigned_to: 4,
          loan_type: 'Car Loan',
          loan_amount: 800000,
          status: 'approved',
          priority: 'low',
          description: 'Car loan for vehicle purchase'
        }
      ];
      
      await insertData(tableName, loanApplications, `Inserting sample ${tableName}`);
    } else {
      console.log('⚠️  Cases/Loan Applications table not found, skipping loan application data');
    }
    
    // 8. Check if documents table exists and create sample data
    console.log('\n📊 Step 8: Creating Sample Documents');
    const documentsExists = await tableExists('documents');
    
    if (documentsExists) {
      const documents = [
        {
          case_id: 1,
          document_type_id: 1,
          file_name: 'pan_card.pdf',
          file_path: '/documents/case_1/pan_card.pdf',
          file_size: 1024000,
          file_type: 'pdf',
          status: 'verified',
          uploaded_at: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          reviewed_by: 2
        },
        {
          case_id: 1,
          document_type_id: 2,
          file_name: 'aadhaar_card.pdf',
          file_path: '/documents/case_1/aadhaar_card.pdf',
          file_size: 2048000,
          file_type: 'pdf',
          status: 'verified',
          uploaded_at: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          reviewed_by: 2
        },
        {
          case_id: 2,
          document_type_id: 1,
          file_name: 'pan_card_2.pdf',
          file_path: '/documents/case_2/pan_card_2.pdf',
          file_size: 1024000,
          file_type: 'pdf',
          status: 'pending',
          uploaded_at: new Date().toISOString()
        }
      ];
      
      await insertData('documents', documents, 'Inserting sample documents');
    } else {
      console.log('⚠️  Documents table not found, skipping document data');
    }
    
    // 9. Check if tasks table exists and create sample data
    console.log('\n📊 Step 9: Creating Sample Tasks');
    const tasksExists = await tableExists('tasks');
    
    if (tasksExists) {
      const tasks = [
        {
          case_id: 1,
          title: 'Verify PAN Card',
          description: 'Verify the submitted PAN card document',
          status: 'completed',
          priority: 'high',
          assigned_to: 2,
          created_by: 1,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString()
        },
        {
          case_id: 1,
          title: 'Credit Score Check',
          description: 'Perform credit score verification',
          status: 'in-progress',
          priority: 'high',
          assigned_to: 4,
          created_by: 1,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          started_at: new Date().toISOString()
        },
        {
          case_id: 2,
          title: 'Document Collection',
          description: 'Collect all required documents from customer',
          status: 'pending',
          priority: 'medium',
          assigned_to: 3,
          created_by: 1,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      await insertData('tasks', tasks, 'Inserting sample tasks');
    } else {
      console.log('⚠️  Tasks table not found, skipping task data');
    }
    
    // 10. Create Organization Settings for the sample organization
    console.log('\n📊 Step 10: Creating Organization Settings');
    const orgSettingsExists = await tableExists('organization_settings');
    
    if (orgSettingsExists) {
      const orgSettings = [
        {
          organization_id: 1,
          key: 'company_name',
          value: 'Veriphy Bank',
          description: 'Organization name',
          category: 'general',
          is_encrypted: false
        },
        {
          organization_id: 1,
          key: 'company_address',
          value: '123 Financial Street, Mumbai, India',
          description: 'Organization address',
          category: 'general',
          is_encrypted: false
        },
        {
          organization_id: 1,
          key: 'max_loan_amount',
          value: '10000000',
          description: 'Maximum loan amount allowed',
          category: 'loans',
          is_encrypted: false
        },
        {
          organization_id: 1,
          key: 'interest_rate_base',
          value: '8.5',
          description: 'Base interest rate percentage',
          category: 'loans',
          is_encrypted: false
        },
        {
          organization_id: 1,
          key: 'working_hours_start',
          value: '09:00',
          description: 'Working hours start time',
          category: 'operations',
          is_encrypted: false
        },
        {
          organization_id: 1,
          key: 'working_hours_end',
          value: '18:00',
          description: 'Working hours end time',
          category: 'operations',
          is_encrypted: false
        }
      ];
      
      await insertData('organization_settings', orgSettings, 'Inserting organization settings');
    } else {
      console.log('⚠️  Organization settings table not found, skipping organization settings data');
    }
    
    // 11. Verify the data was inserted
    console.log('\n🔍 Step 11: Verifying Data Insertion');
    
    const { data: systemSettingsCount } = await supabase
      .from('system_settings')
      .select('id', { count: 'exact' });
    
    const { data: orgSettingsCount } = await supabase
      .from('organization_settings')
      .select('id', { count: 'exact' });
    
    console.log(`✅ System Settings: ${systemSettingsCount?.length || 0} records`);
    console.log(`✅ Organization Settings: ${orgSettingsCount?.length || 0} records`);
    
    // 12. Test a sample query
    console.log('\n🧪 Step 12: Testing Sample Queries');
    
    const { data: sampleSettings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value, category')
      .limit(5);
    
    if (settingsError) {
      console.error('❌ Error testing system settings query:', settingsError.message);
    } else {
      console.log('✅ System settings query successful!');
      console.log('📊 Sample settings:', sampleSettings);
    }
    
    console.log('\n🎉 Database Population Completed Successfully!');
    console.log('=====================================');
    console.log('📝 Next steps:');
    console.log('   1. Refresh your application');
    console.log('   2. Check that the system settings page loads without errors');
    console.log('   3. Verify that all data is visible in the admin interface');
    console.log('   4. Test the caching and performance features');
    
  } catch (error) {
    console.error('❌ Database population failed:', error.message);
    console.log('\n📋 Manual Steps Required:');
    console.log('   1. Go to your Supabase SQL Editor');
    console.log('   2. Run the SQL from database/run_system_settings_migration.sql');
    console.log('   3. Insert the sample data manually if needed');
  }
}

// Run the population script
populateDatabase();
