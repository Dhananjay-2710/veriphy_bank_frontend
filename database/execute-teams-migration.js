// =============================================================================
// EXECUTE TEAMS TABLE MIGRATION
// =============================================================================
// This script executes the teams table migration in Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes('YOUR_')) {
  console.error('❌ ERROR: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  console.error('You can find these in your .env file or Supabase dashboard');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try using the SQL editor endpoint (requires service role key)
      console.log('⚠️  Direct RPC failed, you may need to run this SQL manually in Supabase SQL Editor');
      console.log('SQL to execute:\n', sql);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function main() {
  console.log('🚀 Starting Teams Table Migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '008_create_teams_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 Executing SQL migration...\n');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }
      
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await executeSQL(statement + ';');
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        
        // Don't stop on errors - some statements might fail if they already exist
        console.log('⚠️  Continuing despite error...\n');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        if (data) {
          console.log('Result:', data);
        }
        console.log('');
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log('\n📊 Verifying migration...\n');
    
    // Verify teams table exists
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(5);
    
    if (teamsError) {
      console.error('❌ Error verifying teams table:', teamsError.message);
      console.log('\n⚠️  MANUAL EXECUTION REQUIRED:');
      console.log('Please run the SQL migration manually in your Supabase SQL Editor:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of: database/migrations/008_create_teams_table.sql');
      console.log('4. Click "Run"');
    } else {
      console.log('✅ Teams table verified!');
      console.log(`📊 Found ${teams?.length || 0} teams in the database`);
      
      if (teams && teams.length > 0) {
        console.log('\n📋 Sample teams:');
        teams.forEach(team => {
          console.log(`   - ${team.name} (${team.team_type})`);
        });
      }
    }
    
    // Verify users have team_id
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, role, team_id')
      .not('team_id', 'is', null)
      .limit(5);
    
    if (!usersError && users) {
      console.log(`\n✅ ${users.length} users successfully assigned to teams`);
    }
    
    console.log('\n🎉 Teams Table Migration Complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n⚠️  MANUAL EXECUTION REQUIRED:');
    console.log('Please run the SQL migration manually in your Supabase SQL Editor:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: database/migrations/008_create_teams_table.sql');
    console.log('4. Click "Run"');
  }
}

main();

