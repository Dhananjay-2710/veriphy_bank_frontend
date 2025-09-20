import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Database, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../supabase-client';

export function DatabasePopulator() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const populateDatabase = async () => {
    setIsPopulating(true);
    setStatus('Starting database population...');
    setLogs([]);
    
    try {
      addLog('🚀 Starting comprehensive database population...');
      
      // Create all data in sequence
      await createOrganizations();
      await createDepartments();
      await createRolesAndPermissions();
      await createUsers();
      await createProducts();
      await createDocumentTypes();
      await createCustomers();
      await createLoanApplications();
      await createDocuments();
      await createTasks();
      await createAuditLogs();
      await createNotifications();
      
      setStatus('Database populated successfully!');
      addLog('✅ Database population completed successfully!');
      
    } catch (error) {
      console.error('Error populating database:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPopulating(false);
    }
  };

  const clearDatabase = async () => {
    setIsClearing(true);
    setStatus('Clearing database...');
    setLogs([]);
    
    try {
      addLog('🗑️ Clearing all database tables...');
      
      const tables = [
        'notifications', 'logs', 'tasks', 'documents', 'cases', 'customers',
        'users', 'user_roles', 'roles', 'permissions', 'document_types',
        'products', 'departments', 'organizations'
      ];

      for (const table of tables) {
        addLog(`Clearing table: ${table}`);
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 0);
        
        if (error) {
          console.error(`Error clearing table ${table}:`, error);
          addLog(`⚠️ Warning: Could not clear ${table}: ${error.message}`);
        } else {
          addLog(`✅ Cleared ${table}`);
        }
      }
      
      setStatus('Database cleared successfully!');
      addLog('✅ Database clearing completed!');
      
    } catch (error) {
      console.error('Error clearing database:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClearing(false);
    }
  };

  const checkTableCounts = async () => {
    setIsChecking(true);
    setLogs([]);
    
    try {
      addLog('📊 Checking table counts...');
      
      const tables = [
        'organizations', 'departments', 'roles', 'permissions', 'users', 'user_roles',
        'products', 'document_types', 'customers', 'cases', 'documents', 'tasks',
        'logs', 'notifications'
      ];

      const counts: Record<string, number> = {};

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`Error getting count for ${table}:`, error);
          addLog(`⚠️ Could not get count for ${table}: ${error.message}`);
          counts[table] = -1;
        } else {
          counts[table] = count || 0;
          addLog(`${table}: ${count || 0} records`);
        }
      }
      
      setTableCounts(counts);
      addLog('✅ Table count check completed!');
      
    } catch (error) {
      console.error('Error checking table counts:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Population System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={populateDatabase}
              disabled={isPopulating || isClearing}
              className="flex items-center gap-2"
            >
              {isPopulating ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isPopulating ? 'Populating...' : 'Populate Database'}
            </Button>
            
            <Button
              onClick={clearDatabase}
              disabled={isPopulating || isClearing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isClearing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isClearing ? 'Clearing...' : 'Clear Database'}
            </Button>
            
            <Button
              onClick={checkTableCounts}
              disabled={isChecking}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isChecking ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isChecking ? 'Checking...' : 'Check Counts'}
            </Button>
          </div>

          {status && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {status.includes('Error') ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {status}
            </div>
          )}

          {Object.keys(tableCounts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(tableCounts).map(([table, count]) => (
                <div key={table} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {table.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Operation Logs:</h4>
              <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for creating data
async function createOrganizations() {
  const organizations = [
    {
      id: 1,
      name: 'Veriphy Bank Mumbai',
      code: 'VBM',
      description: 'Mumbai Branch - Main Office',
      address: 'Nariman Point, Mumbai, Maharashtra',
      phone: '+91-22-1234-5678',
      email: 'mumbai@veriphy.com',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Veriphy Bank Delhi',
      code: 'VBD',
      description: 'Delhi Branch',
      address: 'Connaught Place, New Delhi',
      phone: '+91-11-9876-5432',
      email: 'delhi@veriphy.com',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const org of organizations) {
    const { error } = await supabase
      .from('organizations')
      .upsert(org, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating organization:', error);
      throw new Error(`Failed to create organization: ${error.message}`);
    }
  }
}

async function createDepartments() {
  const departments = [
    {
      id: 1,
      organization_id: 1,
      name: 'Sales',
      description: 'Sales and Customer Acquisition',
      department_type: 'sales',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      organization_id: 1,
      name: 'Credit Operations',
      description: 'Credit Analysis and Risk Assessment',
      department_type: 'credit_ops',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      organization_id: 1,
      name: 'Compliance',
      description: 'Compliance and Regulatory Affairs',
      department_type: 'compliance',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      organization_id: 1,
      name: 'Administration',
      description: 'Administrative Support',
      department_type: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const dept of departments) {
    const { error } = await supabase
      .from('departments')
      .upsert(dept, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error.message}`);
    }
  }
}

async function createRolesAndPermissions() {
  // Create roles
  const roles = [
    {
      id: 1,
      name: 'super_admin',
      description: 'Super Administrator - Full system access',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'admin',
      description: 'Administrator - System management',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'manager',
      description: 'Manager - Team oversight',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'salesperson',
      description: 'Sales Person - Customer acquisition',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'credit-ops',
      description: 'Credit Operations - Risk assessment',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const role of roles) {
    const { error } = await supabase
      .from('roles')
      .upsert(role, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating role:', error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  // Create permissions
  const permissions = [
    {
      id: 1,
      name: 'user_management',
      description: 'Manage users and roles',
      resource: 'users',
      action: 'all',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'case_management',
      description: 'Manage loan cases',
      resource: 'cases',
      action: 'all',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'document_management',
      description: 'Manage documents',
      resource: 'documents',
      action: 'all',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'task_management',
      description: 'Manage tasks',
      resource: 'tasks',
      action: 'all',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'system_settings',
      description: 'Manage system settings',
      resource: 'settings',
      action: 'all',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const permission of permissions) {
    const { error } = await supabase
      .from('permissions')
      .upsert(permission, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating permission:', error);
      throw new Error(`Failed to create permission: ${error.message}`);
    }
  }
}

async function createUsers() {
  const users = [
    {
      id: 1,
      email: 'superadmin@veriphy.com',
      full_name: 'Super Admin',
      mobile: '+91-98765-43210',
      role: 'super_admin',
      status: 'active',
      organization_id: 1,
      department_id: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      email: 'admin@veriphy.com',
      full_name: 'Admin User',
      mobile: '+91-98765-43211',
      role: 'admin',
      status: 'active',
      organization_id: 1,
      department_id: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      email: 'manager@veriphy.com',
      full_name: 'Manager User',
      mobile: '+91-98765-43212',
      role: 'manager',
      status: 'active',
      organization_id: 1,
      department_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      email: 'salesperson@veriphy.com',
      full_name: 'Sales Person',
      mobile: '+91-98765-43213',
      role: 'salesperson',
      status: 'active',
      organization_id: 1,
      department_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      email: 'creditops@veriphy.com',
      full_name: 'Credit Operations',
      mobile: '+91-98765-43214',
      role: 'credit-ops',
      status: 'active',
      organization_id: 1,
      department_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Create user role assignment
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: user.role === 'super_admin' ? 1 : 
                 user.role === 'admin' ? 2 :
                 user.role === 'manager' ? 3 :
                 user.role === 'salesperson' ? 4 : 5,
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (userRoleError) {
      console.error('Error creating user role:', userRoleError);
    }
  }
}

async function createProducts() {
  const products = [
    {
      id: 1,
      name: 'Home Loan',
      code: 'HL',
      description: 'Home loan for residential property purchase',
      category: 'home',
      interest_rate: 8.5,
      min_amount: 500000,
      max_amount: 50000000,
      min_tenure: 60,
      max_tenure: 360,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Personal Loan',
      code: 'PL',
      description: 'Personal loan for various purposes',
      category: 'personal',
      interest_rate: 12.0,
      min_amount: 50000,
      max_amount: 2000000,
      min_tenure: 12,
      max_tenure: 60,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Car Loan',
      code: 'CL',
      description: 'Car loan for vehicle purchase',
      category: 'vehicle',
      interest_rate: 9.5,
      min_amount: 100000,
      max_amount: 10000000,
      min_tenure: 12,
      max_tenure: 84,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Business Loan',
      code: 'BL',
      description: 'Business loan for commercial purposes',
      category: 'business',
      interest_rate: 10.5,
      min_amount: 1000000,
      max_amount: 100000000,
      min_tenure: 12,
      max_tenure: 120,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }
}

async function createDocumentTypes() {
  const documentTypes = [
    {
      id: 1,
      name: 'PAN Card',
      category: 'identity',
      description: 'Permanent Account Number card',
      is_required: true,
      priority: 'high',
      validity_period: 365,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Aadhaar Card',
      category: 'identity',
      description: 'Aadhaar identification card',
      is_required: true,
      priority: 'high',
      validity_period: 365,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Bank Statement',
      category: 'financial',
      description: 'Bank statement for last 6 months',
      is_required: true,
      priority: 'high',
      validity_period: 30,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Salary Certificate',
      category: 'employment',
      description: 'Salary certificate from employer',
      is_required: true,
      priority: 'medium',
      validity_period: 30,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Property Documents',
      category: 'property',
      description: 'Property ownership documents',
      is_required: false,
      priority: 'medium',
      validity_period: 365,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const docType of documentTypes) {
    const { error } = await supabase
      .from('document_types')
      .upsert(docType, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating document type:', error);
      throw new Error(`Failed to create document type: ${error.message}`);
    }
  }
}

async function createCustomers() {
  const customers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91-98765-12345',
      age: 35,
      marital_status: 'married',
      employment: 'salaried',
      loan_type: 'Home Loan',
      loan_amount: 2500000,
      risk_profile: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Priya Sharma',
      phone: '+91-98765-12346',
      age: 28,
      marital_status: 'single',
      employment: 'salaried',
      loan_type: 'Personal Loan',
      loan_amount: 500000,
      risk_profile: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Amit Patel',
      phone: '+91-98765-12347',
      age: 42,
      marital_status: 'married',
      employment: 'self-employed',
      loan_type: 'Business Loan',
      loan_amount: 5000000,
      risk_profile: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      phone: '+91-98765-12348',
      age: 31,
      marital_status: 'married',
      employment: 'salaried',
      loan_type: 'Car Loan',
      loan_amount: 800000,
      risk_profile: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Vikram Singh',
      phone: '+91-98765-12349',
      age: 45,
      marital_status: 'married',
      employment: 'self-employed',
      loan_type: 'Home Loan',
      loan_amount: 8000000,
      risk_profile: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const customer of customers) {
    const { error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }
}

async function createLoanApplications() {
  const cases = [
    {
      id: 1,
      case_number: 'CASE-001',
      customer_id: 1,
      assigned_to: 4,
      status: 'in-progress',
      priority: 'high',
      loan_amount: 2500000,
      loan_type: 'Home Loan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      case_number: 'CASE-002',
      customer_id: 2,
      assigned_to: 4,
      status: 'new',
      priority: 'medium',
      loan_amount: 500000,
      loan_type: 'Personal Loan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      case_number: 'CASE-003',
      customer_id: 3,
      assigned_to: 5,
      status: 'review',
      priority: 'high',
      loan_amount: 5000000,
      loan_type: 'Business Loan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      case_number: 'CASE-004',
      customer_id: 4,
      assigned_to: 4,
      status: 'approved',
      priority: 'low',
      loan_amount: 800000,
      loan_type: 'Car Loan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      case_number: 'CASE-005',
      customer_id: 5,
      assigned_to: 5,
      status: 'rejected',
      priority: 'medium',
      loan_amount: 8000000,
      loan_type: 'Home Loan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const case_ of cases) {
    const { error } = await supabase
      .from('cases')
      .upsert(case_, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating case:', error);
      throw new Error(`Failed to create case: ${error.message}`);
    }
  }
}

async function createDocuments() {
  const documents = [
    {
      id: 1,
      case_id: 1,
      name: 'PAN Card - Rajesh Kumar',
      type: 'PAN Card',
      status: 'verified',
      required: true,
      category: 'identity',
      priority: 'high',
      uploaded_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      case_id: 1,
      name: 'Aadhaar Card - Rajesh Kumar',
      type: 'Aadhaar Card',
      status: 'received',
      required: true,
      category: 'identity',
      priority: 'high',
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      case_id: 2,
      name: 'Bank Statement - Priya Sharma',
      type: 'Bank Statement',
      status: 'pending',
      required: true,
      category: 'financial',
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      case_id: 3,
      name: 'Business Registration - Amit Patel',
      type: 'Business Documents',
      status: 'verified',
      required: true,
      category: 'business',
      priority: 'high',
      uploaded_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      case_id: 4,
      name: 'Salary Certificate - Sneha Reddy',
      type: 'Salary Certificate',
      status: 'verified',
      required: true,
      category: 'employment',
      priority: 'medium',
      uploaded_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const document of documents) {
    const { error } = await supabase
      .from('documents')
      .upsert(document, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }
}

async function createTasks() {
  const tasks = [
    {
      id: 1,
      case_id: 1,
      title: 'Verify Customer Documents',
      description: 'Verify all submitted documents for Rajesh Kumar',
      status: 'in_progress',
      priority: 'high',
      assigned_to: 4,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      case_id: 2,
      title: 'Collect Missing Documents',
      description: 'Collect bank statement from Priya Sharma',
      status: 'pending',
      priority: 'medium',
      assigned_to: 4,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      case_id: 3,
      title: 'Credit Assessment',
      description: 'Perform credit assessment for Amit Patel',
      status: 'completed',
      priority: 'high',
      assigned_to: 5,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      case_id: 4,
      title: 'Final Approval',
      description: 'Final approval for Sneha Reddy car loan',
      status: 'completed',
      priority: 'low',
      assigned_to: 3,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      case_id: 5,
      title: 'Rejection Review',
      description: 'Review rejection reasons for Vikram Singh',
      status: 'pending',
      priority: 'medium',
      assigned_to: 5,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const task of tasks) {
    const { error } = await supabase
      .from('tasks')
      .upsert(task, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }
}

async function createAuditLogs() {
  const logs = [
    {
      id: 1,
      user_id: 1,
      action: 'login',
      resource_type: 'user',
      resource_id: '1',
      details: 'Super admin logged in',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 4,
      action: 'create',
      resource_type: 'case',
      resource_id: '1',
      details: 'Created new loan application for Rajesh Kumar',
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: 5,
      action: 'update',
      resource_type: 'case',
      resource_id: '3',
      details: 'Updated credit assessment for Amit Patel',
      ip_address: '192.168.1.3',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      user_id: 3,
      action: 'approve',
      resource_type: 'case',
      resource_id: '4',
      details: 'Approved car loan for Sneha Reddy',
      ip_address: '192.168.1.4',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      user_id: 5,
      action: 'reject',
      resource_type: 'case',
      resource_id: '5',
      details: 'Rejected home loan for Vikram Singh - insufficient income',
      ip_address: '192.168.1.5',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date().toISOString()
    }
  ];

  for (const log of logs) {
    const { error } = await supabase
      .from('logs')
      .upsert(log, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating log:', error);
      throw new Error(`Failed to create log: ${error.message}`);
    }
  }
}

async function createNotifications() {
  const notifications = [
    {
      id: 1,
      user_id: 4,
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: Verify Customer Documents',
      type: 'task_assignment',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 5,
      title: 'Credit Assessment Due',
      message: 'Credit assessment for Amit Patel is due soon',
      type: 'reminder',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: 3,
      title: 'Approval Required',
      message: 'Approval required for Sneha Reddy car loan',
      type: 'approval',
      is_read: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      user_id: 1,
      title: 'System Update',
      message: 'System will be updated tonight at 2 AM',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      user_id: 4,
      title: 'Document Received',
      message: 'New document received for Rajesh Kumar case',
      type: 'document',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  for (const notification of notifications) {
    const { error } = await supabase
      .from('notifications')
      .upsert(notification, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }
}