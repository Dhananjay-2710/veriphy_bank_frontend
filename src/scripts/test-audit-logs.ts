// Test script to insert sample audit log data
import { supabase } from '../supabase-client';

async function insertSampleAuditLogs() {
  console.log('Inserting sample audit log data...');

  const sampleAuditLogs = [
    {
      user_id: 1,
      action: 'login',
      resource_type: 'user',
      resource_id: 1,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date().toISOString()
    },
    {
      user_id: 1,
      action: 'case_created',
      resource_type: 'case',
      resource_id: 1,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
      user_id: 2,
      action: 'document_uploaded',
      resource_type: 'document',
      resource_id: 1,
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
    },
    {
      user_id: null,
      action: 'failed_login',
      resource_type: 'security',
      resource_id: null,
      ip_address: '203.45.67.89',
      user_agent: 'curl/7.68.0',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      user_id: 3,
      action: 'case_updated',
      resource_type: 'case',
      resource_id: 2,
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20 minutes ago
    },
    {
      user_id: null,
      action: 'system_backup',
      resource_type: 'system',
      resource_id: null,
      ip_address: 'localhost',
      user_agent: 'VERIPHY-System/1.0',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      user_id: 1,
      action: 'compliance_check',
      resource_type: 'compliance',
      resource_id: 1,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      user_id: 2,
      action: 'user_created',
      resource_type: 'user',
      resource_id: 4,
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    }
  ];

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(sampleAuditLogs)
      .select();

    if (error) {
      console.error('Error inserting audit logs:', error);
    } else {
      console.log('Successfully inserted audit logs:', data?.length || 0);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the script
insertSampleAuditLogs();
