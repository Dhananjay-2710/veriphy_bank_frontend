// =============================================================================
// SMART DATA INSERTION BASED ON ACTUAL SCHEMA
// =============================================================================
// This script checks actual table structure and inserts compatible data

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure(tableName) {
  console.log(`🔍 Checking structure of table '${tableName}'...`);
  
  try {
    // Try to get one row to see the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Cannot access table '${tableName}': ${error.message}`);
      return null;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`✅ Table '${tableName}' columns:`, columns);
      return columns;
    } else {
      // Table is empty, try to insert a minimal record to see what columns are required
      console.log(`📝 Table '${tableName}' is empty, checking required columns...`);
      return await checkRequiredColumns(tableName);
    }
    
  } catch (err) {
    console.log(`❌ Error checking table '${tableName}': ${err.message}`);
    return null;
  }
}

async function checkRequiredColumns(tableName) {
  // Try inserting minimal data to see what columns are required
  const minimalData = { id: 1 };
  
  try {
    const { error } = await supabase
      .from(tableName)
      .insert(minimalData);
    
    if (error) {
      // Extract column names from error message
      const message = error.message;
      console.log(`📋 Required columns for '${tableName}':`, message);
      return extractColumnsFromError(message);
    }
  } catch (err) {
    console.log(`❌ Could not determine columns for '${tableName}'`);
  }
  
  return null;
}

function extractColumnsFromError(errorMessage) {
  // Try to extract column names from error messages
  const columns = [];
  
  if (errorMessage.includes('email')) columns.push('email');
  if (errorMessage.includes('name')) columns.push('name');
  if (errorMessage.includes('id')) columns.push('id');
  if (errorMessage.includes('created_at')) columns.push('created_at');
  if (errorMessage.includes('updated_at')) columns.push('updated_at');
  
  return columns.length > 0 ? columns : null;
}

async function insertUsers() {
  console.log('\n📝 Inserting users...');
  
  // Try different possible user structures
  const userVariants = [
    {
      email: 'superadmin@veriphy.com',
      name: 'Super Admin',
      role: 'super_admin',
      is_active: true
    },
    {
      email: 'priya.sharma@happybank.in',
      name: 'Priya Sharma',
      role: 'salesperson',
      is_active: true
    },
    {
      email: 'rajesh.kumar@happybank.in',
      name: 'Rajesh Kumar',
      role: 'manager',
      is_active: true
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(userVariants, { onConflict: 'email' })
      .select();
    
    if (error) {
      console.error('❌ Error inserting users:', error.message);
      
      // Try simpler structure
      const simpleUsers = userVariants.map(user => ({
        email: user.email,
        name: user.name
      }));
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('users')
        .upsert(simpleUsers, { onConflict: 'email' })
        .select();
      
      if (simpleError) {
        console.error('❌ Simple users also failed:', simpleError.message);
      } else {
        console.log('✅ Simple users inserted:', simpleData?.length || 0);
      }
    } else {
      console.log('✅ Users inserted successfully:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Users insertion failed:', err.message);
  }
}

async function insertCustomers() {
  console.log('\n📝 Inserting customers...');
  
  const customers = [
    {
      name: 'Ramesh Gupta',
      email: 'ramesh.gupta@email.com',
      phone: '+91-9876543210',
      metadata: {
        age: 55,
        marital_status: 'married',
        employment: 'self-employed',
        loan_amount: 5000000,
        risk_profile: 'medium'
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customers)
      .select();
    
    if (error) {
      console.error('❌ Error inserting customers:', error.message);
    } else {
      console.log('✅ Customers inserted successfully:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Customers insertion failed:', err.message);
  }
}

async function insertCases() {
  console.log('\n📝 Inserting cases...');
  
  const cases = [
    {
      case_number: 'HBI-HL-2025-001',
      title: 'Home Loan Application - Ramesh Gupta',
      description: 'Home purchase in Mumbai',
      status: 'in_progress',
      priority: 'high',
      metadata: {
        customer_name: 'Ramesh Gupta',
        customer_phone: '+91-9876543210',
        loan_amount: 5000000,
        property_value: 6500000,
        loan_to_value: 0.77
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('cases')
      .upsert(cases, { onConflict: 'case_number' })
      .select();
    
    if (error) {
      console.error('❌ Error inserting cases:', error.message);
    } else {
      console.log('✅ Cases inserted successfully:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Cases insertion failed:', err.message);
  }
}

async function insertDocuments() {
  console.log('\n📝 Inserting documents...');
  
  const documents = [
    {
      name: 'Aadhaar Card',
      type: 'identity',
      status: 'verified',
      required: true,
      metadata: {
        file_path: '/documents/HBI-HL-2025-001/aadhaar_card.pdf',
        file_size: 2048576,
        file_type: 'pdf',
        uploaded_at: '2025-01-09T10:30:00Z',
        verified_at: '2025-01-09T11:15:00Z'
      }
    },
    {
      name: 'PAN Card',
      type: 'identity',
      status: 'verified',
      required: true,
      metadata: {
        file_path: '/documents/HBI-HL-2025-001/pan_card.pdf',
        file_size: 1536000,
        file_type: 'pdf',
        uploaded_at: '2025-01-09T10:45:00Z',
        verified_at: '2025-01-09T11:20:00Z'
      }
    },
    {
      name: 'Bank Statements (6 months)',
      type: 'financial',
      status: 'received',
      required: true,
      metadata: {
        file_path: '/documents/HBI-HL-2025-001/bank_statements.pdf',
        file_size: 5242880,
        file_type: 'pdf',
        uploaded_at: '2025-01-09T11:00:00Z'
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('documents')
      .upsert(documents)
      .select();
    
    if (error) {
      console.error('❌ Error inserting documents:', error.message);
    } else {
      console.log('✅ Documents inserted successfully:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Documents insertion failed:', err.message);
  }
}

async function insertNotifications() {
  console.log('\n📝 Inserting notifications...');
  
  const notifications = [
    {
      type: 'case_assigned',
      title: 'New Case Assigned',
      message: 'You have been assigned a new case: HBI-HL-2025-001',
      data: {
        case_id: 'HBI-HL-2025-001',
        case_number: 'HBI-HL-2025-001',
        customer_name: 'Ramesh Gupta'
      },
      is_read: false
    },
    {
      type: 'document_uploaded',
      title: 'Document Uploaded',
      message: 'Aadhaar card has been uploaded for case HBI-HL-2025-001',
      data: {
        case_id: 'HBI-HL-2025-001',
        document_name: 'Aadhaar Card',
        document_type: 'identity'
      },
      is_read: false
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .upsert(notifications)
      .select();
    
    if (error) {
      console.error('❌ Error inserting notifications:', error.message);
    } else {
      console.log('✅ Notifications inserted successfully:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Notifications insertion failed:', err.message);
  }
}

async function main() {
  console.log('🎯 Veriphy Bank - Smart Data Insertion');
  console.log('=======================================');
  console.log('Target Supabase URL:', supabaseUrl);
  console.log('');
  
  // Check table structures
  const tables = ['users', 'customers', 'cases', 'documents', 'notifications'];
  
  for (const table of tables) {
    await checkTableStructure(table);
  }
  
  // Insert data
  await insertUsers();
  await insertCustomers();
  await insertCases();
  await insertDocuments();
  await insertNotifications();
  
  console.log('\n✅ Data insertion process completed!');
  console.log('🎯 Test credentials:');
  console.log('   Email: superadmin@veriphy.com');
  console.log('   Email: priya.sharma@happybank.in');
  console.log('   Email: rajesh.kumar@happybank.in');
  console.log('');
  console.log('🔍 Check your Supabase dashboard to verify the data was inserted.');
  console.log('📊 You can also check your frontend to see if the data appears in the dashboards.');
}

main().catch(console.error);
