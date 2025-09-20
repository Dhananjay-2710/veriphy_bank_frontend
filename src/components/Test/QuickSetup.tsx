import React, { useState } from 'react';
import { supabase } from '../../supabase-client';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function QuickSetup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleQuickSetup = async () => {
    setLoading(true);
    setStatus('Setting up database...');

    try {
      // 1. Create roles
      console.log('👥 Creating roles...');
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
        } else {
          console.log(`✅ Created role: ${role.name}`);
        }
      }

      // 2. Create users
      console.log('👤 Creating users...');
      const users = [
        {
          email: 'superadmin@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Super',
          last_name: 'Admin',
          is_active: true,
        },
        {
          email: 'admin@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Admin',
          last_name: 'User',
          is_active: true,
        },
        {
          email: 'manager@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Manager',
          last_name: 'User',
          is_active: true,
        },
        {
          email: 'salesperson@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Sales',
          last_name: 'Person',
          is_active: true,
        },
        {
          email: 'creditops@veriphy.com',
          password_hash: 'hashed_password_placeholder',
          first_name: 'Credit',
          last_name: 'Operations',
          is_active: true,
        },
      ];

      const createdUsers = [];

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
          createdUsers.push(existingUser);
          continue;
        }

        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .insert({
            email: userData.email,
            password_hash: userData.password_hash,
            first_name: userData.first_name,
            last_name: userData.last_name,
            is_active: userData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (userError) {
          console.error(`❌ Error creating user ${userData.email}:`, userError);
        } else {
          console.log(`✅ Created user: ${userData.email}`);
          createdUsers.push(userRecord);
        }
      }

      // 3. Create user role assignments
      console.log('🔗 Creating user role assignments...');
      for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const roleId = i + 1; // super_admin=1, admin=2, etc.

        // Check if user role already exists
        const { data: existingUserRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role_id', roleId)
          .single();

        if (existingUserRole) {
          console.log(`⚠️ User role for ${user.email} already exists, skipping...`);
          continue;
        }

        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: roleId,
            assigned_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });

        if (userRoleError) {
          console.error(`❌ Error creating user role for ${user.email}:`, userRoleError);
        } else {
          console.log(`✅ Created user role for: ${user.email}`);
        }
      }

      setStatus('✅ Quick setup complete! You can now login with any of the test credentials.');
      console.log('✅ Quick setup completed successfully!');

    } catch (error) {
      console.error('❌ Error during quick setup:', error);
      setStatus(`❌ Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-900">🚀 Quick Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-green-800">
            This will create users, roles, and user role assignments needed for login to work.
          </p>

          <Button
            onClick={handleQuickSetup}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : '🚀 Quick Setup (Users + Roles)'}
          </Button>

          {status && (
            <div className="p-3 bg-white rounded-md border">
              <p className="text-sm text-gray-700">{status}</p>
            </div>
          )}

          <div className="text-sm text-green-700 space-y-1">
            <p><strong>After setup, you can login with:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Super Admin: superadmin@veriphy.com (any password)</li>
              <li>Admin: admin@veriphy.com (any password)</li>
              <li>Manager: manager@veriphy.com (any password)</li>
              <li>Salesperson: salesperson@veriphy.com (any password)</li>
              <li>Credit Ops: creditops@veriphy.com (any password)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
