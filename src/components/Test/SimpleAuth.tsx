import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function SimpleAuth() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [user, setUser] = useState<any>(null);

  const testSimpleLogin = async () => {
    setLoading(true);
    setResult('🔐 Testing simple login...\n\n');

    try {
      // First, let's see what's actually in the users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        setResult(prev => prev + `❌ Error fetching users: ${usersError.message}\n\n`);
        return;
      }

      setResult(prev => prev + `✅ Found ${users.length} users:\n`);
      users.forEach((user, index) => {
        setResult(prev => prev + `${index + 1}. ${JSON.stringify(user, null, 2)}\n\n`);
      });

      // Try to find a user with admin in the email
      const adminUser = users.find(u => 
        u.email && u.email.toLowerCase().includes('admin')
      );

      if (adminUser) {
        setResult(prev => prev + `🎯 Found admin user: ${adminUser.email}\n`);
        setResult(prev => prev + `User data: ${JSON.stringify(adminUser, null, 2)}\n\n`);

        // Try to get role information
        if (adminUser.id) {
          setResult(prev => prev + `🔍 Looking for role for user ID: ${adminUser.id}\n`);
          
          // Try different role lookup methods
          const { data: userRole1, error: roleError1 } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', adminUser.id)
            .single();

          if (roleError1) {
            setResult(prev => prev + `❌ user_roles lookup failed: ${roleError1.message}\n`);
          } else {
            setResult(prev => prev + `✅ user_roles data: ${JSON.stringify(userRole1, null, 2)}\n`);
          }

          // Try to get role name
          const { data: userRole2, error: roleError2 } = await supabase
            .from('user_roles')
            .select(`
              roles!inner(name)
            `)
            .eq('user_id', adminUser.id)
            .single();

          if (roleError2) {
            setResult(prev => prev + `❌ roles join failed: ${roleError2.message}\n`);
          } else {
            setResult(prev => prev + `✅ roles join data: ${JSON.stringify(userRole2, null, 2)}\n`);
          }
        }

        // Create a simple user object for testing
        const simpleUser = {
          id: adminUser.id.toString(),
          email: adminUser.email,
          role: 'admin', // Hardcode for now
          full_name: adminUser.full_name || adminUser.name || 'Admin User',
        };

        setUser(simpleUser);
        setResult(prev => prev + `\n✅ Created simple user object: ${JSON.stringify(simpleUser, null, 2)}\n`);
        setResult(prev => prev + `\n🎯 You can now use this user for testing!`);

      } else {
        setResult(prev => prev + `❌ No admin user found. Available users:\n`);
        users.forEach(u => {
          setResult(prev => prev + `- ${u.email || 'No email'}\n`);
        });
      }

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setResult('');
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-900">🔐 Simple Authentication Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-green-800">
            This will test authentication with the actual database structure.
          </p>

          {user ? (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-semibold mb-2">✅ Logged in as:</h3>
              <div className="text-sm space-y-1">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role}</div>
                <div><strong>Name:</strong> {user.full_name}</div>
              </div>
              <Button
                onClick={clearUser}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Clear User
              </Button>
            </div>
          ) : (
            <Button
              onClick={testSimpleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : '🔐 Test Simple Login'}
            </Button>
          )}

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {result || 'Click the button to test simple login...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
