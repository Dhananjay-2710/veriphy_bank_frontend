// Test script to insert sample audit log data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleAuditLogs() {
  console.log('Inserting sample audit log data...');

  const sampleAuditLogs = [
    {
      organization_id: 1,
      user_id: 1,
      action: 'login',
      entity_type: 'user',
      entity_id: 1,
      description: 'User successfully logged into the system',
      metadata: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_1'
      },
      created_at: new Date().toISOString()
    },
    {
      organization_id: 1,
      user_id: 1,
      action: 'case_created',
      entity_type: 'case',
      entity_id: 1,
      description: 'Created new loan application case',
      metadata: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_1'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
      organization_id: 1,
      user_id: 2,
      action: 'document_uploaded',
      entity_type: 'document',
      entity_id: 1,
      description: 'Uploaded new document to case',
      metadata: {
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_2'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
    },
    {
      organization_id: 1,
      user_id: null,
      action: 'failed_login',
      entity_type: 'security',
      entity_id: null,
      description: 'Multiple failed login attempts from external IP',
      metadata: {
        ip_address: '203.45.67.89',
        user_agent: 'curl/7.68.0',
        session_id: 'session_unknown'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      organization_id: 1,
      user_id: 3,
      action: 'case_updated',
      entity_type: 'case',
      entity_id: 2,
      description: 'Updated case status or details',
      metadata: {
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_3'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20 minutes ago
    },
    {
      organization_id: 1,
      user_id: null,
      action: 'system_backup',
      entity_type: 'system',
      entity_id: null,
      description: 'Automated daily backup completed successfully',
      metadata: {
        ip_address: 'localhost',
        user_agent: 'VERIPHY-System/1.0',
        session_id: 'system_session'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      organization_id: 1,
      user_id: 1,
      action: 'compliance_check',
      entity_type: 'compliance',
      entity_id: 1,
      description: 'Automated compliance verification completed',
      metadata: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_1'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      organization_id: 1,
      user_id: 2,
      action: 'user_created',
      entity_type: 'user',
      entity_id: 4,
      description: 'Created new user account in the system',
      metadata: {
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session_2'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    }
  ];

  try {
    const { data, error } = await supabase
      .from('logs')
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
