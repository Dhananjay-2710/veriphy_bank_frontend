import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function RegistrationTest() {
  const { register, registerSuperAdmin, user } = useAuth();
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSuperAdminRegistration = async () => {
    setTestLoading(true);
    setResult('Testing Super Admin registration...');
    
    try {
      const user = await registerSuperAdmin({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@veriphy.com',
        phone: '+91-9876543210',
        role: 'super_admin',
        password: 'SuperAdmin123!'
      });
      setResult(`✅ Super Admin registration successful! User: ${user.email}, Role: ${user.role}`);
    } catch (error) {
      setResult(`❌ Super Admin registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  const testUserRegistration = async () => {
    setTestLoading(true);
    setResult('Testing user registration...');
    
    try {
      const user = await register({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@veriphy.com',
        phone: '+91-9876543211',
        role: 'salesperson',
        password: 'TestUser123!'
      });
      setResult(`✅ User registration successful! User: ${user.email}, Role: ${user.role}`);
    } catch (error) {
      setResult(`❌ User registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Current User:</strong> {user ? `${user.full_name} (${user.role})` : 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={testSuperAdminRegistration}
            disabled={testLoading}
            className="w-full"
          >
            {testLoading ? 'Testing...' : 'Test Super Admin Registration'}
          </Button>

          <Button 
            onClick={testUserRegistration}
            disabled={testLoading}
            variant="outline"
            className="w-full"
          >
            {testLoading ? 'Testing...' : 'Test User Registration'}
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
