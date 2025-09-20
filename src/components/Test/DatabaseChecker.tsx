import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function DatabaseChecker() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    setResult('Checking database structure...\n\n');

    try {
      // Check what tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        setResult(prev => prev + `❌ Error getting tables: ${tablesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Tables found: ${tables?.map(t => t.table_name).join(', ')}\n\n`);
      }

      // Check users table structure
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        setResult(prev => prev + `❌ Users table error: ${usersError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Users table accessible\n`);
        if (users && users.length > 0) {
          setResult(prev => prev + `Sample user columns: ${Object.keys(users[0]).join(', ')}\n\n`);
        }
      }

      // Check customers table structure
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .limit(1);

      if (customersError) {
        setResult(prev => prev + `❌ Customers table error: ${customersError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Customers table accessible\n`);
        if (customers && customers.length > 0) {
          setResult(prev => prev + `Sample customer columns: ${Object.keys(customers[0]).join(', ')}\n\n`);
        }
      }

      // Check cases table structure
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .limit(1);

      if (casesError) {
        setResult(prev => prev + `❌ Cases table error: ${casesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Cases table accessible\n`);
        if (cases && cases.length > 0) {
          setResult(prev => prev + `Sample case columns: ${Object.keys(cases[0]).join(', ')}\n\n`);
        }
      }

      // Check roles table
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(5);

      if (rolesError) {
        setResult(prev => prev + `❌ Roles table error: ${rolesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ Roles table accessible\n`);
        if (roles && roles.length > 0) {
          setResult(prev => prev + `Sample roles: ${JSON.stringify(roles, null, 2)}\n\n`);
        }
      }

      // Check user_roles table
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);

      if (userRolesError) {
        setResult(prev => prev + `❌ User_roles table error: ${userRolesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ User_roles table accessible\n`);
        if (userRoles && userRoles.length > 0) {
          setResult(prev => prev + `Sample user roles: ${JSON.stringify(userRoles, null, 2)}\n\n`);
        }
      }

      setResult(prev => prev + `\n🎯 Database check completed!`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">🔍 Database Structure Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-blue-800">
            This will check what tables and columns actually exist in your database.
          </p>

          <Button
            onClick={checkDatabase}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Checking...' : '🔍 Check Database Structure'}
          </Button>

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {result || 'Click the button to check the database structure...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
