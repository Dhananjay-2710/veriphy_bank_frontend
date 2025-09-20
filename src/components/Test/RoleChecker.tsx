import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function RoleChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const checkRoles = async () => {
    setLoading(true);
    setResult('🔍 Checking role assignments...\n\n');

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .order('id');

      if (usersError) {
        setResult(prev => prev + `❌ Error fetching users: ${usersError.message}\n\n`);
        return;
      }

      setResult(prev => prev + `✅ Found ${users.length} users\n\n`);

      // Check each user's role
      for (const user of users) {
        setResult(prev => prev + `👤 User: ${user.email} (ID: ${user.id})\n`);
        
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles!inner(name, description)
          `)
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          setResult(prev => prev + `  ❌ Role lookup failed: ${roleError.message}\n`);
        } else if (userRole?.roles) {
          setResult(prev => prev + `  ✅ Role: ${userRole.roles.name} (${userRole.roles.description})\n`);
        } else {
          setResult(prev => prev + `  ⚠️ No role assigned\n`);
        }
        setResult(prev => prev + `\n`);
      }

      // Also check all roles
      setResult(prev => prev + `📋 Available roles:\n`);
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('id');

      if (rolesError) {
        setResult(prev => prev + `❌ Error fetching roles: ${rolesError.message}\n\n`);
      } else {
        roles.forEach(role => {
          setResult(prev => prev + `  - ${role.name} (ID: ${role.id}): ${role.description}\n`);
        });
      }

      setResult(prev => prev + `\n🎯 Role check complete!`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const fixRoles = async () => {
    setLoading(true);
    setResult('🔧 Fixing role assignments...\n\n');

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .order('id');

      if (usersError) {
        setResult(prev => prev + `❌ Error fetching users: ${usersError.message}\n\n`);
        return;
      }

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('id');

      if (rolesError) {
        setResult(prev => prev + `❌ Error fetching roles: ${rolesError.message}\n\n`);
        return;
      }

      // Assign roles based on email pattern
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const roleId = i + 1; // super_admin=1, admin=2, etc.
        const role = roles.find(r => r.id === roleId);

        if (!role) {
          setResult(prev => prev + `⚠️ No role found for ID ${roleId}\n`);
          continue;
        }

        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existingRole) {
          setResult(prev => prev + `ℹ️ User ${user.email} already has a role, skipping\n`);
          continue;
        }

        // Assign role
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: roleId,
            assigned_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

        if (assignError) {
          setResult(prev => prev + `❌ Error assigning role to ${user.email}: ${assignError.message}\n`);
        } else {
          setResult(prev => prev + `✅ Assigned ${role.name} to ${user.email}\n`);
        }
      }

      setResult(prev => prev + `\n🎯 Role fixing complete!`);

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">🎭 Role Assignment Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-orange-800">
            This will check and fix role assignments for all users.
          </p>

          <div className="space-y-2">
            <Button
              onClick={checkRoles}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Checking...' : '🔍 Check Role Assignments'}
            </Button>

            <Button
              onClick={fixRoles}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Fixing...' : '🔧 Fix Role Assignments'}
            </Button>
          </div>

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {result || 'Click "Check Role Assignments" to start...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
