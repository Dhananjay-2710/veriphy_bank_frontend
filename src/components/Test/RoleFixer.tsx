import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function RoleFixer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const fixRoles = async () => {
    setLoading(true);
    setResult('🔧 Fixing role mappings...\n\n');

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        setResult(prev => prev + `❌ Error fetching users: ${usersError.message}\n\n`);
        return;
      }

      setResult(prev => prev + `✅ Found ${users.length} users\n\n`);

      // Check each user's role and fix if needed
      for (const user of users) {
        setResult(prev => prev + `👤 User: ${user.email}\n`);
        
        // Get current role
        let currentRole = user.role;
        if (!currentRole && user.role_id) {
          // Try to get role from roles table
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', user.role_id)
            .single();
          
          if (roleData?.name) {
            currentRole = roleData.name;
          }
        }

        setResult(prev => prev + `  Current role: ${currentRole || 'none'}\n`);

        // Normalize role
        const roleMapping: { [key: string]: string } = {
          'super-admin': 'super_admin',
          'super_admin': 'super_admin',
          'admin': 'admin',
          'manager': 'manager',
          'salesperson': 'salesperson',
          'sales-person': 'salesperson',
          'credit-ops': 'credit-ops',
          'credit_ops': 'credit-ops',
          'creditops': 'credit-ops',
        };

        const normalizedRole = roleMapping[currentRole] || currentRole;
        
        if (normalizedRole !== currentRole) {
          setResult(prev => prev + `  🔄 Normalizing: ${currentRole} → ${normalizedRole}\n`);
          
          // Update user role in database
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: normalizedRole })
            .eq('id', user.id);

          if (updateError) {
            setResult(prev => prev + `  ❌ Update failed: ${updateError.message}\n`);
          } else {
            setResult(prev => prev + `  ✅ Updated successfully\n`);
          }
        } else {
          setResult(prev => prev + `  ✅ Role already normalized\n`);
        }
        
        setResult(prev => prev + `\n`);
      }

      setResult(prev => prev + `🎯 Role fixing complete!`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    setResult('👤 Creating test super admin user...\n\n');

    try {
      // Create a test super admin user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: 'test-superadmin@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Test',
          last_name: 'Super Admin',
          role: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        setResult(prev => prev + `❌ Error creating user: ${userError.message}\n`);
      } else {
        setResult(prev => prev + `✅ Created test user: ${user.email}\n`);
        setResult(prev => prev + `User ID: ${user.id}\n`);
        setResult(prev => prev + `Role: ${user.role}\n\n`);
        setResult(prev => prev + `You can now login with: test-superadmin@veriphy.com\n`);
      }

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-900">🔧 Role Fixer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-purple-800">
            This will fix role mappings and create test users with correct roles.
          </p>

          <div className="space-y-2">
            <Button
              onClick={fixRoles}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Fixing...' : '🔧 Fix Role Mappings'}
            </Button>

            <Button
              onClick={createTestUser}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Creating...' : '👤 Create Test Super Admin'}
            </Button>
          </div>

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {result || 'Click a button to start...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
