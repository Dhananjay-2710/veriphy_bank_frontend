// Script to check what tables exist in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking available tables...');

  // Try to get a list of tables by querying information_schema
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.error('Error fetching tables:', error);
    } else {
      console.log('Available tables:', data?.map(t => t.table_name) || []);
    }
  } catch (err) {
    console.error('Error:', err);
  }

  // Try to check if audit_log table exists and what columns it has
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking audit_log table:', error);
    } else {
      console.log('audit_log table exists, sample data:', data);
    }
  } catch (err) {
    console.error('Error checking audit_log:', err);
  }

  // Try to check if logs table exists
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking logs table:', error);
    } else {
      console.log('logs table exists, sample data:', data);
    }
  } catch (err) {
    console.error('Error checking logs:', err);
  }
}

// Run the script
checkTables();
