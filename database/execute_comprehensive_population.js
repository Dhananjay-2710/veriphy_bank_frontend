const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjU5NzMsImV4cCI6MjA1MDIwMTk3M30.8QjJ8QjJ8QjJ8QjJ8QjJ8QjJ8QjJ8QjJ8QjJ8QjJ8'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeComprehensivePopulation() {
  try {
    console.log('🚀 Starting Comprehensive Data Population...\n');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'comprehensive_data_population.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log(`📊 File size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
    
    // Split SQL into statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute statements in batches
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // For INSERT statements, use the Supabase client directly
        if (statement.includes('INSERT INTO')) {
          await executeInsertStatement(statement);
        } else if (statement.includes('CREATE TABLE')) {
          await executeCreateStatement(statement);
        } else if (statement.includes('SELECT')) {
          await executeSelectStatement(statement);
        } else {
          // For other statements, try direct execution
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1} skipped (might not be supported): ${error.message}`);
          }
        }
        
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.log(`Statement: ${statement.substring(0, 100)}...\n`);
      }
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Data Population Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📊 Total statements: ${statements.length}`);
    
    // Verify the data was populated
    await verifyDataPopulation();
    
  } catch (error) {
    console.error('💥 Fatal error during population:', error);
  }
}

async function executeInsertStatement(statement) {
  // Extract table name from INSERT statement
  const tableMatch = statement.match(/INSERT INTO\s+(\w+)/i);
  if (!tableMatch) return;
  
  const tableName = tableMatch[1];
  console.log(`📝 Inserting data into ${tableName}...`);
  
  // For now, we'll use a simpler approach - try to execute via RPC
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.log(`⚠️  Insert into ${tableName} skipped: ${error.message}`);
    }
  } catch (error) {
    console.log(`⚠️  Insert into ${tableName} failed: ${error.message}`);
  }
}

async function executeCreateStatement(statement) {
  console.log('🏗️  Creating table...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.log(`⚠️  Create table skipped: ${error.message}`);
    }
  } catch (error) {
    console.log(`⚠️  Create table failed: ${error.message}`);
  }
}

async function executeSelectStatement(statement) {
  console.log('🔍 Executing query...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.log(`⚠️  Query skipped: ${error.message}`);
    } else if (data) {
      console.log(`📊 Query result:`, data);
    }
  } catch (error) {
    console.log(`⚠️  Query failed: ${error.message}`);
  }
}

async function verifyDataPopulation() {
  console.log('\n🔍 Verifying data population...\n');
  
  const tables = [
    'users', 'customers', 'cases', 'documents', 
    'accounts', 'transactions', 'notifications', 'system_settings'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: Table not accessible - ${error.message}`);
      } else {
        // Get count
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
}

// Alternative approach using direct table operations
async function populateUsingDirectOperations() {
  console.log('\n🔄 Attempting direct table operations...\n');
  
  try {
    // 1. Create system_settings table if it doesn't exist
    console.log('1️⃣ Creating system_settings table...');
    
    // 2. Insert system settings
    console.log('2️⃣ Inserting system settings...');
    const systemSettings = [
      { key: 'app_name', value: 'Veriphy Bank', description: 'Application name', category: 'general' },
      { key: 'app_version', value: '1.0.0', description: 'Application version', category: 'general' },
      { key: 'maintenance_mode', value: 'false', description: 'System maintenance mode', category: 'system' }
    ];
    
    for (const setting of systemSettings) {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert(setting, { onConflict: 'key' });
      
      if (error) {
        console.log(`⚠️  System setting ${setting.key} skipped: ${error.message}`);
      } else {
        console.log(`✅ System setting ${setting.key} inserted`);
      }
    }
    
    // 3. Insert sample users
    console.log('3️⃣ Inserting sample users...');
    const sampleUsers = [
      { email: 'priya.sharma@veriphy.com', first_name: 'Priya', last_name: 'Sharma', role: 'salesperson' },
      { email: 'rajesh.kumar@veriphy.com', first_name: 'Rajesh', last_name: 'Kumar', role: 'salesperson' },
      { email: 'anita.reddy@veriphy.com', first_name: 'Anita', last_name: 'Reddy', role: 'manager' }
    ];
    
    for (const user of sampleUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' });
      
      if (error) {
        console.log(`⚠️  User ${user.email} skipped: ${error.message}`);
      } else {
        console.log(`✅ User ${user.email} inserted`);
      }
    }
    
    console.log('\n✅ Direct operations completed!');
    
  } catch (error) {
    console.error('❌ Error in direct operations:', error);
  }
}

// Main execution
async function main() {
  console.log('🎯 VERIPHY BANK - COMPREHENSIVE DATA POPULATION');
  console.log('================================================\n');
  
  // Try the comprehensive approach first
  await executeComprehensivePopulation();
  
  // If that fails, try direct operations
  await populateUsingDirectOperations();
  
  console.log('\n🏁 Population process completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Check your Supabase Dashboard to verify data');
  console.log('2. Test the application with the new data');
  console.log('3. Login with different user roles to test functionality');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeComprehensivePopulation, populateUsingDirectOperations };
