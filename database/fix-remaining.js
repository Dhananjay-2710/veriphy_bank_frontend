// =============================================================================
// FIX REMAINING DATA INSERTION ISSUES
// =============================================================================
// This script fixes the cases and notifications insertion

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getExistingData() {
  console.log('🔍 Getting existing data...');
  
  // Get users
  const { data: users } = await supabase
    .from('users')
    .select('*');
  
  // Get customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*');
  
  console.log(`📊 Found ${users?.length || 0} users and ${customers?.length || 0} customers`);
  
  return { users, customers };
}

async function insertCases(users, customers) {
  console.log('\n📝 Inserting cases with product_id...');
  
  if (!customers || customers.length === 0) {
    console.log('⚠️  No customers found');
    return null;
  }
  
  const customer = customers[0];
  const salesperson = users?.find(u => u.role === 'salesperson');
  
  const cases = [
    {
      case_number: 'HBI-HL-2025-001',
      title: 'Home Loan Application - Ramesh Gupta',
      description: 'Home purchase in Mumbai',
      status: 'in_progress',
      priority: 'high',
      organization_id: 1,
      customer_id: customer.id,
      product_id: 1, // Adding required product_id
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

async function insertNotifications() {
  console.log('\n📝 Inserting notifications with notifiable_type...');
  
  const notifications = [
    {
      type: 'whatsapp_message',
      notifiable_type: 'User', // Adding required notifiable_type
      notifiable_id: 1, // Adding required notifiable_id
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Welcome to Happy Bank! We\'ve received your home loan application.',
        sender: 'system',
        timestamp: '2025-01-09T09:00:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      notifiable_type: 'User',
      notifiable_id: 2,
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Hello! Thank you for reaching out. We are excited to help you with your home loan.',
        sender: 'customer',
        timestamp: '2025-01-09T09:05:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      notifiable_type: 'User',
      notifiable_id: 2,
      data: {
        case_id: 'HBI-HL-2025-001',
        content: 'Please upload your Aadhaar card to proceed with verification.',
        sender: 'system',
        timestamp: '2025-01-09T09:10:00Z'
      }
    },
    {
      type: 'whatsapp_message',
      notifiable_type: 'User',
      notifiable_id: 2,
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
      notifiable_type: 'User',
      notifiable_id: 2,
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

async function insertTasks(users, cases) {
  console.log('\n📝 Inserting tasks...');
  
  if (!cases || cases.length === 0) {
    console.log('⚠️  No cases found, skipping tasks');
    return null;
  }
  
  const case_ = cases[0];
  const salesperson = users?.find(u => u.role === 'salesperson');
  
  const tasks = [
    {
      title: 'Document Collection - Aadhaar Card',
      description: 'Collect and verify Aadhaar card for case HBI-HL-2025-001',
      status: 'completed',
      priority: 'high',
      assigned_to: salesperson?.id || null,
      due_date: '2025-01-09T10:00:00Z',
      organization_id: 1,
      metadata: {
        case_id: case_.id,
        case_number: case_.case_number,
        customer_name: 'Ramesh Gupta',
        task_type: 'document_collection'
      }
    },
    {
      title: 'Document Collection - PAN Card',
      description: 'Collect and verify PAN card for case HBI-HL-2025-001',
      status: 'completed',
      priority: 'high',
      assigned_to: salesperson?.id || null,
      due_date: '2025-01-09T10:30:00Z',
      organization_id: 1,
      metadata: {
        case_id: case_.id,
        case_number: case_.case_number,
        customer_name: 'Ramesh Gupta',
        task_type: 'document_collection'
      }
    },
    {
      title: 'Document Collection - Bank Statements',
      description: 'Collect and review bank statements for case HBI-HL-2025-001',
      status: 'in_progress',
      priority: 'medium',
      assigned_to: salesperson?.id || null,
      due_date: '2025-01-10T12:00:00Z',
      organization_id: 1,
      metadata: {
        case_id: case_.id,
        case_number: case_.case_number,
        customer_name: 'Ramesh Gupta',
        task_type: 'document_collection'
      }
    },
    {
      title: 'Credit Analysis',
      description: 'Perform credit analysis for Ramesh Gupta home loan application',
      status: 'pending',
      priority: 'high',
      assigned_to: users?.find(u => u.role === 'credit-ops')?.id || null,
      due_date: '2025-01-12T17:00:00Z',
      organization_id: 1,
      metadata: {
        case_id: case_.id,
        case_number: case_.case_number,
        customer_name: 'Ramesh Gupta',
        task_type: 'credit_analysis',
        loan_amount: 5000000
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .upsert(tasks)
      .select();
    
    if (error) {
      console.error('❌ Error inserting tasks:', error.message);
      return null;
    } else {
      console.log('✅ Tasks inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Tasks insertion failed:', err.message);
    return null;
  }
}

async function main() {
  console.log('🎯 Veriphy Bank - Fix Remaining Data');
  console.log('====================================');
  
  // Get existing data
  const { users, customers } = await getExistingData();
  
  // Insert remaining data
  const caseData = await insertCases(users, customers);
  const notificationData = await insertNotifications();
  const taskData = await insertTasks(users, caseData);
  
  console.log('\n✅ Data insertion process completed!');
  console.log('');
  console.log('📊 Final data summary:');
  console.log(`   - ${users?.length || 0} users`);
  console.log(`   - ${customers?.length || 0} customers`);
  console.log(`   - ${caseData?.length || 0} cases`);
  console.log(`   - ${notificationData?.length || 0} notifications`);
  console.log(`   - ${taskData?.length || 0} tasks`);
  console.log('');
  console.log('🎯 You can now test your application with real data!');
  console.log('🔍 Login with any of these emails to see the data in action:');
  console.log('   - superadmin@veriphy.com');
  console.log('   - priya.sharma@happybank.in');
  console.log('   - rajesh.kumar@happybank.in');
}

main().catch(console.error);
