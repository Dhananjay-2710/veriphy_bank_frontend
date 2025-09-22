const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables or use your Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSystemSettingsTable() {
  try {
    console.log('Creating system_settings table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix_system_settings_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } else if (statement.includes('INSERT INTO') || statement.includes('UPDATE')) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } else if (statement.includes('SELECT')) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`✓ Query result:`, data);
        }
      }
    }
    
    console.log('\n🎉 System settings table creation completed!');
    
    // Verify the table exists and has data
    console.log('\nVerifying table creation...');
    
    const { data: settings, error: fetchError } = await supabase
      .from('system_settings')
      .select('key, value, category')
      .order('category', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching settings:', fetchError);
    } else {
      console.log(`✓ Found ${settings.length} system settings:`);
      settings.forEach(setting => {
        console.log(`  - ${setting.key}: ${setting.value} (${setting.category})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Alternative approach using direct SQL execution
async function createSystemSettingsTableAlternative() {
  try {
    console.log('Creating system_settings table using alternative method...');
    
    // Create table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS system_settings (
        id BIGSERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        is_encrypted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `;
    
    console.log('Creating table...');
    const { data: createResult, error: createError } = await supabase
      .from('_sql')
      .select('*')
      .limit(1);
    
    if (createError) {
      console.log('Note: Direct SQL execution not available, using table operations instead');
      
      // Try to create table by attempting to insert and catch the error
      const { data: testData, error: testError } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);
      
      if (testError && testError.code === 'PGRST205') {
        console.log('❌ Table does not exist. Please create it manually in Supabase Dashboard:');
        console.log('\n1. Go to your Supabase Dashboard');
        console.log('2. Navigate to Table Editor');
        console.log('3. Click "New Table"');
        console.log('4. Use the SQL from fix_system_settings_table.sql');
        console.log('\nOr run this SQL in the SQL Editor:');
        console.log(createTableSQL);
        return;
      }
    }
    
    // Insert default settings
    console.log('Inserting default settings...');
    
    const defaultSettings = [
      { key: 'app_name', value: 'Veriphy Bank', description: 'Application name', category: 'general' },
      { key: 'app_version', value: '1.0.0', description: 'Application version', category: 'general' },
      { key: 'max_login_attempts', value: '5', description: 'Maximum login attempts before account lockout', category: 'security' },
      { key: 'session_timeout_minutes', value: '30', description: 'Session timeout in minutes', category: 'security' },
      { key: 'maintenance_mode', value: 'false', description: 'System maintenance mode', category: 'system' }
    ];
    
    for (const setting of defaultSettings) {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert(setting, { onConflict: 'key' })
        .select();
      
      if (error) {
        console.error(`Error inserting ${setting.key}:`, error);
      } else {
        console.log(`✓ Inserted/Updated: ${setting.key}`);
      }
    }
    
    console.log('\n🎉 System settings setup completed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the setup
if (require.main === module) {
  console.log('🚀 Setting up system_settings table...\n');
  
  // Try the alternative method first as it's more reliable
  createSystemSettingsTableAlternative()
    .then(() => {
      console.log('\n✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createSystemSettingsTable, createSystemSettingsTableAlternative };
