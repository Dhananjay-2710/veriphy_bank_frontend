// =============================================================================
// CHECK SCHEMA AND INSERT MOCK DATA
// =============================================================================
// This script checks your Supabase schema and inserts compatible data

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase schema...');
  
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('⚠️  Could not check tables via information_schema, trying direct approach...');
      return await checkTablesDirectly();
    }
    
    console.log('📋 Available tables:', tables?.map(t => t.table_name) || []);
    return tables?.map(t => t.table_name) || [];
    
  } catch (error) {
    console.log('⚠️  Schema check failed, trying direct table access...');
    return await checkTablesDirectly();
  }
}

async function checkTablesDirectly() {
  const commonTables = [
    'users', 'customers', 'cases', 'loan_applications', 'documents', 
    'organizations', 'departments', 'notifications', 'audit_logs',
    'whatsapp_messages', 'workflow_history', 'loan_products'
  ];
  
  const existingTables = [];
  
  for (const table of commonTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        existingTables.push(table);
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' does not exist or not accessible`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - Error: ${err.message}`);
    }
  }
  
  return existingTables;
}

async function insertBasicData(existingTables) {
  console.log('\n🚀 Inserting basic mock data...');
  
  // Insert users if table exists
  if (existingTables.includes('users')) {
    console.log('📝 Inserting users...');
    
    const users = [
      {
        email: 'superadmin@veriphy.com',
        password_hash: 'hashed_password_123',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+91-9876543214',
        is_active: true
      },
      {
        email: 'priya.sharma@happybank.in',
        password_hash: 'hashed_password_123',
        first_name: 'Priya',
        last_name: 'Sharma',
        phone: '+91-9876543210',
        is_active: true
      },
      {
        email: 'rajesh.kumar@happybank.in',
        password_hash: 'hashed_password_123',
        first_name: 'Rajesh',
        last_name: 'Kumar',
        phone: '+91-9876543211',
        is_active: true
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(users, { onConflict: 'email' })
        .select();
      
      if (error) {
        console.error('❌ Error inserting users:', error);
      } else {
        console.log('✅ Users inserted successfully:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Users insertion failed:', err.message);
    }
  }
  
  // Insert customers if table exists
  if (existingTables.includes('customers')) {
    console.log('📝 Inserting customers...');
    
    const customers = [
      {
        customer_number: 'CUST001',
        first_name: 'Ramesh',
        last_name: 'Gupta',
        email: 'ramesh.gupta@email.com',
        phone: '+91-9876543210',
        date_of_birth: '1970-01-15',
        marital_status: 'married',
        employment_type: 'self-employed',
        monthly_income: 75000,
        risk_profile: 'medium',
        kyc_status: 'verified'
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert(customers, { onConflict: 'customer_number' })
        .select();
      
      if (error) {
        console.error('❌ Error inserting customers:', error);
      } else {
        console.log('✅ Customers inserted successfully:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Customers insertion failed:', err.message);
    }
  }
  
  // Insert cases if table exists
  if (existingTables.includes('cases')) {
    console.log('📝 Inserting cases...');
    
    const cases = [
      {
        case_number: 'HBI-HL-2025-001',
        title: 'Home Loan Application - Ramesh Gupta',
        description: 'Home purchase in Mumbai',
        status: 'in_progress',
        priority: 'high',
        customer_id: 1, // Assuming customer ID 1 from above
        assigned_to: 2, // Assuming user ID 2 from above
        metadata: {
          requested_amount: 5000000,
          property_value: 6500000,
          loan_to_value: 0.77,
          processing_fee: 5000
        }
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .upsert(cases, { onConflict: 'case_number' })
        .select();
      
      if (error) {
        console.error('❌ Error inserting cases:', error);
      } else {
        console.log('✅ Cases inserted successfully:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Cases insertion failed:', err.message);
    }
  }
  
  // Insert documents if table exists
  if (existingTables.includes('documents')) {
    console.log('📝 Inserting documents...');
    
    const documents = [
      {
        name: 'Aadhaar Card',
        type: 'identity',
        status: 'verified',
        required: true,
        uploaded_at: '2025-01-09T10:30:00Z',
        verified_at: '2025-01-09T11:15:00Z',
        case_id: 1, // Assuming case ID 1
        metadata: {
          file_path: '/documents/HBI-HL-2025-001/aadhaar_card.pdf',
          file_size: 2048576,
          file_type: 'pdf'
        }
      },
      {
        name: 'PAN Card',
        type: 'identity',
        status: 'verified',
        required: true,
        uploaded_at: '2025-01-09T10:45:00Z',
        verified_at: '2025-01-09T11:20:00Z',
        case_id: 1,
        metadata: {
          file_path: '/documents/HBI-HL-2025-001/pan_card.pdf',
          file_size: 1536000,
          file_type: 'pdf'
        }
      },
      {
        name: 'Bank Statements (6 months)',
        type: 'financial',
        status: 'received',
        required: true,
        uploaded_at: '2025-01-09T11:00:00Z',
        case_id: 1,
        metadata: {
          file_path: '/documents/HBI-HL-2025-001/bank_statements.pdf',
          file_size: 5242880,
          file_type: 'pdf'
        }
      }
    ];
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .upsert(documents)
        .select();
      
      if (error) {
        console.error('❌ Error inserting documents:', error);
      } else {
        console.log('✅ Documents inserted successfully:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Documents insertion failed:', err.message);
    }
  }
}

async function main() {
  console.log('🎯 Veriphy Bank - Schema Check & Data Insertion');
  console.log('================================================');
  console.log('Target Supabase URL:', supabaseUrl);
  console.log('');
  
  // Check what tables exist
  const existingTables = await checkSchema();
  
  if (existingTables.length === 0) {
    console.log('❌ No compatible tables found. Please check your database schema.');
    return;
  }
  
  console.log(`\n📊 Found ${existingTables.length} compatible tables`);
  
  // Insert data based on available tables
  await insertBasicData(existingTables);
  
  console.log('\n✅ Data insertion process completed!');
  console.log('🎯 Test credentials:');
  console.log('   Email: superadmin@veriphy.com');
  console.log('   Password: password123');
  console.log('');
  console.log('🔍 Check your Supabase dashboard to verify the data was inserted.');
}

main().catch(console.error);
