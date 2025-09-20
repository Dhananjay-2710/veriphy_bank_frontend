// =============================================================================
// DATABASE POPULATION SCRIPT
// =============================================================================
// This script populates the Supabase database with sample data

import { supabase } from '../supabase-client';
import {
  generateSampleCustomers,
  generateSampleCases,
  generateSampleTasks,
  generateSampleDocuments,
  generateSampleLogs,
} from '../services/supabase-schema-mapping';

export class DatabasePopulator {
  static async populateAll() {
    console.log('🚀 Starting database population...');
    
    try {
      // 1. Users (with auth integration)
      console.log('👥 Creating users...');
      await this.populateUsers();
      
      // 2. Customers
      console.log('👤 Creating customers...');
      await this.populateCustomers();
      
      // 3. Cases
      console.log('📋 Creating cases...');
      await this.populateCases();
      
      // 4. Documents
      console.log('📑 Creating documents...');
      await this.populateDocuments();
      
      // 5. Tasks
      console.log('✅ Creating tasks...');
      await this.populateTasks();
      
      // 6. Logs
      console.log('📝 Creating logs...');
      await this.populateLogs();
      
      console.log('✅ Database population completed successfully!');
      
    } catch (error) {
      console.error('❌ Error populating database:', error);
      throw error;
    }
  }


  static async populateUsers() {
    // Check if users already exist in the database
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email');

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return [];
    }

    // If users already exist, skip creation
    if (existingUsers && existingUsers.length > 0) {
      console.log('Users already exist, skipping user creation');
      return existingUsers;
    }

    // First, create roles if they don't exist
    const roles = [
      { id: 1, name: 'super_admin', description: 'Super Administrator' },
      { id: 2, name: 'admin', description: 'Administrator' },
      { id: 3, name: 'manager', description: 'Manager' },
      { id: 4, name: 'salesperson', description: 'Sales Person' },
      { id: 5, name: 'credit-ops', description: 'Credit Operations' },
    ];

    for (const role of roles) {
      const { error: roleError } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'id' });
      
      if (roleError) {
        console.error('Error creating role:', roleError);
      }
    }

    // Create users directly in the database (bypassing Supabase Auth for now)
    const users = [
      {
        email: 'superadmin@veriphy.com',
        password_hash: 'hashed_password_placeholder',
        first_name: 'Super',
        last_name: 'Admin',
        role_id: 1, // super_admin
      },
      {
        email: 'admin@veriphy.com',
        password_hash: 'hashed_password_placeholder',
        first_name: 'Admin',
        last_name: 'User',
        role_id: 2, // admin
      },
      {
        email: 'manager@veriphy.com',
        password_hash: 'hashed_password_placeholder',
        first_name: 'Manager',
        last_name: 'User',
        role_id: 3, // manager
      },
      {
        email: 'salesperson@veriphy.com',
        password_hash: 'hashed_password_placeholder',
        first_name: 'Sales',
        last_name: 'Person',
        role_id: 4, // salesperson
      },
      {
        email: 'creditops@veriphy.com',
        password_hash: 'hashed_password_placeholder',
        first_name: 'Credit',
        last_name: 'Operations',
        role_id: 5, // credit-ops
      },
    ];

    const createdUsers = [];

    for (const userData of users) {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: userData.password_hash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
      } else {
        console.log(`Created user: ${userData.email}`);
        
        // Create user role assignment
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userRecord.id,
            role_id: userData.role_id,
            assigned_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

        if (userRoleError) {
          console.error('Error creating user role:', userRoleError);
        }

        createdUsers.push(userRecord);
      }
    }

    return createdUsers;
  }

  static async populateCustomers() {
    // Get actual user IDs from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError || !users || users.length === 0) {
      console.log('No users found, skipping customers creation');
      return;
    }

    const userIds = users.map(u => u.id);
    const customers = generateSampleCustomers();
    
    for (const customer of customers) {
      // Use actual user IDs for foreign keys
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const customerData = {
        ...customer,
        user_id: randomUserId,
      };

      const { error } = await supabase
        .from('customers')
        .upsert(customerData, { onConflict: 'id' });
      
      if (error) {
        console.error('Error creating customer:', error);
      }
    }
  }


  static async populateCases() {
    // Get actual user IDs from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError || !users || users.length === 0) {
      console.log('No users found, skipping cases creation');
      return;
    }

    const userIds = users.map(u => u.id);
    const cases = generateSampleCases();
    
    for (const case_ of cases) {
      // Use actual user IDs for foreign keys
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const caseData = {
        ...case_,
        assigned_to: randomUserId,
      };

      const { error } = await supabase
        .from('cases')
        .upsert(caseData, { onConflict: 'id' });
      
      if (error) {
        console.error('Error creating case:', error);
      }
    }
  }

  static async populateDocuments() {
    // Get actual case IDs from the database
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id');

    if (casesError || !cases || cases.length === 0) {
      console.log('No cases found, skipping documents creation');
      return;
    }

    const caseIds = cases.map(c => c.id);
    const documents = generateSampleDocuments();
    
    for (const document of documents) {
      // Use actual case IDs for foreign keys
      const randomCaseId = caseIds[Math.floor(Math.random() * caseIds.length)];
      const documentData = {
        ...document,
        case_id: randomCaseId,
      };

      const { error } = await supabase
        .from('documents')
        .upsert(documentData, { onConflict: 'id' });
      
      if (error) {
        console.error('Error creating document:', error);
      }
    }
  }

  static async populateTasks() {
    // Get actual case IDs and user IDs from the database
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (casesError || !cases || cases.length === 0) {
      console.log('No cases found, skipping tasks creation');
      return;
    }

    if (usersError || !users || users.length === 0) {
      console.log('No users found, skipping tasks creation');
      return;
    }

    const caseIds = cases.map(c => c.id);
    const userIds = users.map(u => u.id);
    const tasks = generateSampleTasks();
    
    for (const task of tasks) {
      // Use actual case IDs and user IDs for foreign keys
      const randomCaseId = caseIds[Math.floor(Math.random() * caseIds.length)];
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const taskData = {
        ...task,
        case_id: randomCaseId,
        assigned_to: randomUserId,
        created_by: randomUserId,
      };

      const { error } = await supabase
        .from('tasks')
        .upsert(taskData, { onConflict: 'id' });
      
      if (error) {
        console.error('Error creating task:', error);
      }
    }
  }

  static async populateLogs() {
    console.log('Creating logs...');
    
    // Get actual user IDs from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError || !users || users.length === 0) {
      console.log('No users found, skipping logs creation');
      return;
    }
    
    const userIds = users.map(u => u.id);
    const logs = generateSampleLogs(userIds);
    
    for (const log of logs) {
      const { error } = await supabase
        .from('logs')
        .upsert(log, { onConflict: 'id' });
      
      if (error) {
        console.error('Error creating log:', error);
      }
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  static async clearAllData() {
    console.log('🗑️ Clearing all data...');
    
    const tables = [
      'logs',
      'tasks', 
      'documents',
      'files',
      'cases',
      'customers',
      'users',
      'document_types',
      'products',
      'departments',
      'organizations',
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 0); // Delete all records
      
      if (error) {
        console.error(`Error clearing table ${table}:`, error);
      }
    }
  }

  static async getTableCounts() {
    console.log('📊 Getting table counts...');
    
    const tables = [
      'organizations',
      'departments', 
      'products',
      'document_types',
      'users',
      'customers',
      'files',
      'cases',
      'documents',
      'tasks',
      'logs',
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error getting count for ${table}:`, error);
      } else {
        console.log(`${table}: ${count} records`);
      }
    }
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// To populate the database, run:
// DatabasePopulator.populateAll()

// To clear all data:
// DatabasePopulator.clearAllData()

// To check table counts:
// DatabasePopulator.getTableCounts()

export default DatabasePopulator;
