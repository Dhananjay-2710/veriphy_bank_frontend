import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function DatabaseStructureChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const checkStructure = async () => {
    setLoading(true);
    setResult('🔍 Checking actual database structure...\n\n');

    try {
      // Check users table structure
      setResult(prev => prev + '1️⃣ Checking users table...\n');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        setResult(prev => prev + `❌ Users table error: ${usersError.message}\n`);
      } else {
        setResult(prev => prev + `✅ Users table accessible\n`);
        if (users && users.length > 0) {
          setResult(prev => prev + `Users columns: ${Object.keys(users[0]).join(', ')}\n`);
          setResult(prev => prev + `Sample user data: ${JSON.stringify(users[0], null, 2)}\n\n`);
        } else {
          setResult(prev => prev + `No users found in table\n\n`);
        }
      }

      // Check roles table structure
      setResult(prev => prev + '2️⃣ Checking roles table...\n');
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(1);

      if (rolesError) {
        setResult(prev => prev + `❌ Roles table error: ${rolesError.message}\n`);
      } else {
        setResult(prev => prev + `✅ Roles table accessible\n`);
        if (roles && roles.length > 0) {
          setResult(prev => prev + `Roles columns: ${Object.keys(roles[0]).join(', ')}\n`);
          setResult(prev => prev + `Sample role data: ${JSON.stringify(roles[0], null, 2)}\n\n`);
        } else {
          setResult(prev => prev + `No roles found in table\n\n`);
        }
      }

      // Check user_roles table structure
      setResult(prev => prev + '3️⃣ Checking user_roles table...\n');
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      if (userRolesError) {
        setResult(prev => prev + `❌ User_roles table error: ${userRolesError.message}\n`);
      } else {
        setResult(prev => prev + `✅ User_roles table accessible\n`);
        if (userRoles && userRoles.length > 0) {
          setResult(prev => prev + `User_roles columns: ${Object.keys(userRoles[0]).join(', ')}\n`);
          setResult(prev => prev + `Sample user_role data: ${JSON.stringify(userRoles[0], null, 2)}\n\n`);
        } else {
          setResult(prev => prev + `No user_roles found in table\n\n`);
        }
      }

      // Check cases table structure
      setResult(prev => prev + '4️⃣ Checking cases table...\n');
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .limit(1);

      if (casesError) {
        setResult(prev => prev + `❌ Cases table error: ${casesError.message}\n`);
      } else {
        setResult(prev => prev + `✅ Cases table accessible\n`);
        if (cases && cases.length > 0) {
          setResult(prev => prev + `Cases columns: ${Object.keys(cases[0]).join(', ')}\n`);
          setResult(prev => prev + `Sample case data: ${JSON.stringify(cases[0], null, 2)}\n\n`);
        } else {
          setResult(prev => prev + `No cases found in table\n\n`);
        }
      }

      setResult(prev => prev + '🎯 Database structure check complete!');

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-indigo-900">🏗️ Database Structure Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-indigo-800">
            This will show you the actual structure of your database tables and columns.
          </p>

          <Button
            onClick={checkStructure}
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
