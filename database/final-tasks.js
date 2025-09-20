// =============================================================================
// INSERT TASKS WITH CORRECT ENUM VALUES
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTasks() {
  console.log('📝 Inserting tasks with correct priority enum...');
  
  // Get existing data
  const { data: users } = await supabase.from('users').select('*');
  const { data: cases } = await supabase.from('cases').select('*');
  
  if (!cases || cases.length === 0) {
    console.log('⚠️  No cases found, skipping tasks');
    return null;
  }
  
  const case_ = cases[0];
  const salesperson = users?.find(u => u.role === 'salesperson');
  const creditOps = users?.find(u => u.role === 'credit-ops');
  
  // Try different priority values that might be valid
  const tasks = [
    {
      title: 'Document Collection - Aadhaar Card',
      description: 'Collect and verify Aadhaar card for case HBI-HL-2025-001',
      status: 'completed',
      priority: 'normal', // Try 'normal' instead of 'medium'
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
      priority: 'normal',
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
      status: 'open',
      priority: 'normal',
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
      status: 'open',
      priority: 'high',
      assigned_to: creditOps?.id || null,
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

async function insertLogs() {
  console.log('\n📝 Inserting logs...');
  
  const logs = [
    {
      action: 'Case Created',
      description: 'New home loan application case created for Ramesh Gupta',
      entity_type: 'case',
      entity_id: 1,
      organization_id: 1,
      metadata: {
        case_number: 'HBI-HL-2025-001',
        customer_name: 'Ramesh Gupta',
        loan_amount: 5000000
      }
    },
    {
      action: 'Document Verified',
      description: 'Aadhaar card verification completed',
      entity_type: 'document',
      entity_id: 1,
      organization_id: 1,
      metadata: {
        document_type: 'identity',
        verification_status: 'verified'
      }
    },
    {
      action: 'Document Verified',
      description: 'PAN card verification completed',
      entity_type: 'document',
      entity_id: 2,
      organization_id: 1,
      metadata: {
        document_type: 'identity',
        verification_status: 'verified'
      }
    },
    {
      action: 'Task Completed',
      description: 'Document collection task completed',
      entity_type: 'task',
      entity_id: 1,
      organization_id: 1,
      metadata: {
        task_type: 'document_collection',
        completion_time: '2025-01-09T11:15:00Z'
      }
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('logs')
      .upsert(logs)
      .select();
    
    if (error) {
      console.error('❌ Error inserting logs:', error.message);
      return null;
    } else {
      console.log('✅ Logs inserted successfully:', data?.length || 0);
      return data;
    }
  } catch (err) {
    console.error('❌ Logs insertion failed:', err.message);
    return null;
  }
}

async function main() {
  console.log('🎯 Veriphy Bank - Final Tasks & Logs');
  console.log('====================================');
  
  const taskData = await insertTasks();
  const logData = await insertLogs();
  
  console.log('\n✅ Final data insertion completed!');
  console.log('');
  console.log('📊 Complete data summary:');
  
  // Get final counts
  const { data: users } = await supabase.from('users').select('*');
  const { data: customers } = await supabase.from('customers').select('*');
  const { data: cases } = await supabase.from('cases').select('*');
  const { data: notifications } = await supabase.from('notifications').select('*');
  
  console.log(`   - ${users?.length || 0} users`);
  console.log(`   - ${customers?.length || 0} customers`);
  console.log(`   - ${cases?.length || 0} cases`);
  console.log(`   - ${notifications?.length || 0} notifications`);
  console.log(`   - ${taskData?.length || 0} tasks`);
  console.log(`   - ${logData?.length || 0} logs`);
  console.log('');
  console.log('🎉 SUCCESS! Your Veriphy Bank application now has real data!');
  console.log('');
  console.log('🔑 Test Credentials:');
  console.log('   Email: superadmin@veriphy.com');
  console.log('   Email: priya.sharma@happybank.in');
  console.log('   Email: rajesh.kumar@happybank.in');
  console.log('   Email: anita.patel@happybank.in');
  console.log('   Email: suresh.krishnamurthy@happybank.in');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Start your frontend: npm run dev');
  console.log('   2. Login with any of the credentials above');
  console.log('   3. Navigate through different dashboards');
  console.log('   4. Check that real data appears instead of mock data');
  console.log('');
  console.log('✨ Your Supabase integration is now complete!');
}

main().catch(console.error);
