// =============================================================================
// FINAL DATA INSERTION WITH CORRECT COLUMN NAMES
// =============================================================================
// This script uses the actual column structure discovered from your database

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertUsers() {
  console.log('📝 Inserting users with correct schema...');
  
  const users = [
    {
      full_name: 'Super Admin',
      email: 'superadmin@veriphy.com',
      mobile: '+91-9876543214',
      role: 'super_admin',
      status: 'active',
      organization_id: 1,
      metadata: {
        avatar: null,
        permissions: ['all']
      }
    },
    {
      full_name: 'Priya Sharma',
      email: 'priya.sharma@happybank.in',
      mobile: '+91-9876543210',
      role: 'salesperson',
      status: 'active',
      organization_id: 1,
      metadata: {
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        permissions: ['view_cases', 'update_cases']
      }
    },
    {
      full_name: 'Rajesh Kumar',
      email: 'rajesh.kumar@happybank.in',
      mobile: '+91-9876543211',
      role: 'manager',
      status: 'active',
      organization_id: 1,
      metadata: {
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        permissions: ['manage_team', 'view_all_cases']
      }
    },
    {
      full_name: 'Anita Patel',
      email: 'anita.patel@happybank.in',
      mobile: '+91-9876543212',
      role: 'credit-ops',
      status: 'active',
      organization_id: 1,
      metadata: {
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        permissions: ['approve_cases', 'view_credit_data']
      }
    },
    {
      full_name: 'Suresh Krishnamurthy',
      email: 'suresh.krishnamurthy@happybank.in',
      mobile: '+91-9876543213',
      role: 'admin',
      status: 'active',
      organization_id: 1,
      metadata: {
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        permissions: ['manage_users', 'system_settings']
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'email' })
      .select();
    
    if (error) {
      console.error('❌ Error inserting users:', error.message);
      return null;
    } else {
      console.log('✅ Users inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Users insertion failed:', err.message);
    return null;
  }
}

async function insertCustomers() {
  console.log('\n📝 Inserting customers with correct schema...');
  
  const customers = [
    {
      full_name: 'Ramesh Gupta',
      email: 'ramesh.gupta@email.com',
      mobile: '+91-9876543210',
      dob: '1970-01-15',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      external_customer_code: 'CUST001',
      kyc_status: 'verified',
      organization_id: 1,
      metadata: {
        age: 55,
        marital_status: 'married',
        employment: 'self-employed',
        monthly_income: 75000,
        risk_profile: 'medium',
        loan_amount: 5000000
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
      return null;
    } else {
      console.log('✅ Customers inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Customers insertion failed:', err.message);
    return null;
  }
}

async function insertCases(customerData, userData) {
  console.log('\n📝 Inserting cases with correct schema...');
  
  if (!customerData || customerData.length === 0) {
    console.log('⚠️  No customer data available, skipping cases');
    return null;
  }
  
  const customer = customerData[0];
  const salesperson = userData?.find(u => u.role === 'salesperson');
  
  const cases = [
    {
      case_number: 'HBI-HL-2025-001',
      title: 'Home Loan Application - Ramesh Gupta',
      description: 'Home purchase in Mumbai',
      status: 'in_progress',
      priority: 'high',
      organization_id: 1,
      customer_id: customer.id,
      assigned_to: salesperson?.id || null,
      metadata: {
        customer_name: customer.full_name,
        customer_phone: customer.mobile,
        loan_amount: 5000000,
        property_value: 6500000,
        loan_to_value: 0.77,
        processing_fee: 5000,
        loan_type: 'Home Loan',
        requested_amount: 5000000
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
      return null;
    } else {
      console.log('✅ Cases inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Cases insertion failed:', err.message);
    return null;
  }
}

async function insertDocuments(caseData) {
  console.log('\n📝 Inserting documents with correct schema...');
  
  if (!caseData || caseData.length === 0) {
    console.log('⚠️  No case data available, skipping documents');
    return null;
  }
  
  const case_ = caseData[0];
  
  const documents = [
    {
      document_type_id: 1,
      status: 'verified',
      submitted_at: '2025-01-09T10:30:00Z',
      review_started_at: '2025-01-09T10:45:00Z',
      review_completed_at: '2025-01-09T11:15:00Z',
      verified_by: case_.assigned_to,
      verified_on: '2025-01-09T11:15:00Z',
      organization_id: 1,
      metadata: {
        name: 'Aadhaar Card',
        type: 'identity',
        file_path: '/documents/HBI-HL-2025-001/aadhaar_card.pdf',
        file_size: 2048576,
        file_type: 'pdf',
        required: true,
        notes: 'Aadhaar card verified successfully'
      }
    },
    {
      document_type_id: 2,
      status: 'verified',
      submitted_at: '2025-01-09T10:45:00Z',
      review_started_at: '2025-01-09T11:00:00Z',
      review_completed_at: '2025-01-09T11:20:00Z',
      verified_by: case_.assigned_to,
      verified_on: '2025-01-09T11:20:00Z',
      organization_id: 1,
      metadata: {
        name: 'PAN Card',
        type: 'identity',
        file_path: '/documents/HBI-HL-2025-001/pan_card.pdf',
        file_size: 1536000,
        file_type: 'pdf',
        required: true,
        notes: 'PAN card verified successfully'
      }
    },
    {
      document_type_id: 3,
      status: 'submitted',
      submitted_at: '2025-01-09T11:00:00Z',
      organization_id: 1,
      metadata: {
        name: 'Bank Statements (6 months)',
        type: 'financial',
        file_path: '/documents/HBI-HL-2025-001/bank_statements.pdf',
        file_size: 5242880,
        file_type: 'pdf',
        required: true
      }
    },
    {
      document_type_id: 4,
      status: 'pending',
      organization_id: 1,
      metadata: {
        name: 'GST Returns',
        type: 'business',
        required: true
      }
    },
    {
      document_type_id: 5,
      status: 'submitted',
      submitted_at: '2025-01-09T14:30:00Z',
      organization_id: 1,
      metadata: {
        name: 'ITR Documents',
        type: 'business',
        file_path: '/documents/HBI-HL-2025-001/itr_documents.pdf',
        file_size: 3145728,
        file_type: 'pdf',
        required: true
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
      return null;
    } else {
      console.log('✅ Documents inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Documents insertion failed:', err.message);
    return null;
  }
}

async function insertNotifications() {
  console.log('\n📝 Inserting notifications with correct schema...');
  
  const notifications = [
    {
      type: 'whatsapp_message',
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Welcome to Happy Bank! We\'ve received your home loan application.',
        sender: 'system',
        timestamp: '2025-01-09T09:00:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Hello! Thank you for reaching out. We are excited to help you with your home loan.',
        sender: 'customer',
        timestamp: '2025-01-09T09:05:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Please upload your Aadhaar card to proceed with verification.',
        sender: 'system',
        timestamp: '2025-01-09T09:10:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Aadhaar card uploaded successfully',
        sender: 'customer',
        timestamp: '2025-01-09T10:30:00Z',
        document_id: 'doc1'
      }
    },
    {
      type: 'whatsapp_message',
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'PAN card uploaded successfully',
        sender: 'customer',
        timestamp: '2025-01-09T10:45:00Z',
        document_id: 'doc2'
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .upsert(notifications)
      .select();
    
    if (error) {
      console.error('❌ Error inserting notifications:', error.message);
      return null;
    } else {
      console.log('✅ Notifications inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Notifications insertion failed:', err.message);
    return null;
  }
}

async function main() {
  console.log('🎯 Veriphy Bank - Final Data Insertion');
  console.log('======================================');
  console.log('Target Supabase URL:', supabaseUrl);
  console.log('');
  
  // Insert data in correct order with dependencies
  const userData = await insertUsers();
  const customerData = await insertCustomers();
  const caseData = await insertCases(customerData, userData);
  const documentData = await insertDocuments(caseData);
  const notificationData = await insertNotifications();
  
  console.log('\n✅ Data insertion process completed!');
  console.log('');
  console.log('🎯 Test credentials (you can now login with these):');
  console.log('   Email: superadmin@veriphy.com');
  console.log('   Email: priya.sharma@happybank.in');
  console.log('   Email: rajesh.kumar@happybank.in');
  console.log('   Email: anita.patel@happybank.in');
  console.log('   Email: suresh.krishnamurthy@happybank.in');
  console.log('');
  console.log('📊 Data inserted:');
  console.log(`   - ${userData?.length || 0} users`);
  console.log(`   - ${customerData?.length || 0} customers`);
  console.log(`   - ${caseData?.length || 0} cases`);
  console.log(`   - ${documentData?.length || 0} documents`);
  console.log(`   - ${notificationData?.length || 0} notifications`);
  console.log('');
  console.log('🚀 Your Veriphy Bank application should now show real data instead of mock data!');
  console.log('🔍 Check your dashboards to see the integration in action.');
}

main().catch(console.error);
