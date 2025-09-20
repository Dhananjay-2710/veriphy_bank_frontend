import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function LoginDebugger() {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { user, login, logout } = useAuth();

  const runFullDebug = async () => {
    setLoading(true);
    setDebugInfo('🔍 Starting comprehensive login debug...\n\n');

    try {
      // Step 1: Check if we have any users in the database
      setDebugInfo(prev => prev + '1️⃣ Checking users in database...\n');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        setDebugInfo(prev => prev + `❌ Error fetching users: ${usersError.message}\n\n`);
      } else {
        setDebugInfo(prev => prev + `✅ Found ${users?.length || 0} users in database\n`);
        if (users && users.length > 0) {
          setDebugInfo(prev => prev + `Sample user: ${JSON.stringify(users[0], null, 2)}\n\n`);
        }
      }

      // Step 2: Check roles table
      setDebugInfo(prev => prev + '2️⃣ Checking roles table...\n');
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) {
        setDebugInfo(prev => prev + `❌ Error fetching roles: ${rolesError.message}\n\n`);
      } else {
        setDebugInfo(prev => prev + `✅ Found ${roles?.length || 0} roles\n`);
        if (roles && roles.length > 0) {
          setDebugInfo(prev => prev + `Roles: ${roles.map(r => r.name).join(', ')}\n\n`);
        }
      }

      // Step 3: Check user_roles table
      setDebugInfo(prev => prev + '3️⃣ Checking user_roles table...\n');
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) {
        setDebugInfo(prev => prev + `❌ Error fetching user_roles: ${userRolesError.message}\n\n`);
      } else {
        setDebugInfo(prev => prev + `✅ Found ${userRoles?.length || 0} user role assignments\n`);
        if (userRoles && userRoles.length > 0) {
          setDebugInfo(prev => prev + `Sample user role: ${JSON.stringify(userRoles[0], null, 2)}\n\n`);
        }
      }

      // Step 4: Test direct database query for a specific user
      setDebugInfo(prev => prev + '4️⃣ Testing direct user lookup...\n');
      const testEmail = 'superadmin@veriphy.com';
      const { data: testUser, error: testUserError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testEmail)
        .single();

      if (testUserError) {
        setDebugInfo(prev => prev + `❌ Error finding test user: ${testUserError.message}\n\n`);
      } else {
        setDebugInfo(prev => prev + `✅ Found test user: ${JSON.stringify(testUser, null, 2)}\n\n`);
      }

      // Step 5: Test role lookup for test user
      if (testUser) {
        setDebugInfo(prev => prev + '5️⃣ Testing role lookup for test user...\n');
        const { data: testUserRole, error: testUserRoleError } = await supabase
          .from('user_roles')
          .select(`
            roles!inner(name)
          `)
          .eq('user_id', testUser.id)
          .single();

        if (testUserRoleError) {
          setDebugInfo(prev => prev + `❌ Error finding user role: ${testUserRoleError.message}\n\n`);
        } else {
          setDebugInfo(prev => prev + `✅ Found user role: ${JSON.stringify(testUserRole, null, 2)}\n\n`);
        }
      }

      // Step 6: Test Supabase Auth
      setDebugInfo(prev => prev + '6️⃣ Testing Supabase Auth...\n');
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setDebugInfo(prev => prev + `❌ Supabase Auth error: ${authError.message}\n\n`);
      } else {
        setDebugInfo(prev => prev + `✅ Supabase Auth user: ${authUser?.user ? 'Logged in' : 'Not logged in'}\n\n`);
      }

      // Step 7: Check localStorage
      setDebugInfo(prev => prev + '7️⃣ Checking localStorage...\n');
      const storedUser = localStorage.getItem('veriphy_user');
      if (storedUser) {
        setDebugInfo(prev => prev + `✅ Found stored user: ${storedUser}\n\n`);
      } else {
        setDebugInfo(prev => prev + `❌ No stored user in localStorage\n\n`);
      }

      // Step 8: Current auth state
      setDebugInfo(prev => prev + '8️⃣ Current auth state...\n');
      setDebugInfo(prev => prev + `Current user: ${user ? JSON.stringify(user, null, 2) : 'null'}\n\n`);

      setDebugInfo(prev => prev + '🎯 Debug complete! Check the information above to identify the issue.\n');

    } catch (error) {
      setDebugInfo(prev => prev + `❌ Debug error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setDebugInfo('🔐 Testing login with superadmin@veriphy.com...\n\n');

    try {
      const result = await login('superadmin@veriphy.com', 'password123');
      setDebugInfo(prev => prev + `✅ Login successful!\n`);
      setDebugInfo(prev => prev + `Result: ${JSON.stringify(result, null, 2)}\n`);
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Login failed: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    setLoading(true);
    setDebugInfo('🧹 Clearing authentication...\n\n');

    try {
      await logout();
      localStorage.removeItem('veriphy_user');
      setDebugInfo(prev => prev + `✅ Authentication cleared!\n`);
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Error clearing auth: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-900">🐛 Login Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-red-800">
            This will help us debug exactly why login isn't working.
          </p>

          <div className="space-y-2">
            <Button
              onClick={runFullDebug}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Debugging...' : '🔍 Run Full Debug'}
            </Button>

            <Button
              onClick={testLogin}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Testing...' : '🔐 Test Login'}
            </Button>

            <Button
              onClick={clearAuth}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Clearing...' : '🧹 Clear Auth'}
            </Button>
          </div>

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {debugInfo || 'Click "Run Full Debug" to start...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
