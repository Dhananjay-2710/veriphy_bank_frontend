import React, { useState } from 'react';
import { supabase } from '../../supabase-client';

export function SimpleSchemaTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSchema = async () => {
    setLoading(true);
    setResult('Testing database schema...\n\n');

    try {
      // Test 1: Check if users table exists and has data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        setResult(prev => prev + `❌ Users table error: ${usersError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Users table: Found ${users?.length || 0} users\n`);
        if (users && users.length > 0) {
          setResult(prev => prev + `Sample user: ${JSON.stringify(users[0], null, 2)}\n\n`);
        }
      }

      // Test 2: Check if customers table exists
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .limit(1);

      if (customersError) {
        setResult(prev => prev + `❌ Customers table error: ${customersError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Customers table: Found ${customers?.length || 0} customers\n`);
        if (customers && customers.length > 0) {
          setResult(prev => prev + `Sample customer: ${JSON.stringify(customers[0], null, 2)}\n\n`);
        }
      }

      // Test 3: Check if cases table exists
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .limit(1);

      if (casesError) {
        setResult(prev => prev + `❌ Cases table error: ${casesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Cases table: Found ${cases?.length || 0} cases\n`);
        if (cases && cases.length > 0) {
          setResult(prev => prev + `Sample case: ${JSON.stringify(cases[0], null, 2)}\n\n`);
        }
      }

      // Test 4: Check if roles table exists
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(5);

      if (rolesError) {
        setResult(prev => prev + `❌ Roles table error: ${rolesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Roles table: Found ${roles?.length || 0} roles\n`);
        if (roles && roles.length > 0) {
          setResult(prev => prev + `Sample roles: ${JSON.stringify(roles, null, 2)}\n\n`);
        }
      }

      // Test 5: Check if user_roles table exists
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);

      if (userRolesError) {
        setResult(prev => prev + `❌ User_roles table error: ${userRolesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ User_roles table: Found ${userRoles?.length || 0} user roles\n`);
        if (userRoles && userRoles.length > 0) {
          setResult(prev => prev + `Sample user roles: ${JSON.stringify(userRoles, null, 2)}\n\n`);
        }
      }

      setResult(prev => prev + `\n🎯 Schema test completed!`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Simple Schema Test</h3>
      <button
        onClick={testSchema}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Schema'}
      </button>
      <div className="mt-4">
        <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
          {result || 'Click the button to test the database schema...'}
        </pre>
      </div>
    </div>
  );
}
