import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function LoginTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { login, user, logout } = useAuth();

  const testLogin = async (email: string, password: string) => {
    setLoading(true);
    setResult(`Testing login for ${email}...\n`);

    try {
      const profile = await login(email, password);
      setResult(prev => prev + `✅ Login successful!\n`);
      setResult(prev => prev + `User: ${profile.full_name}\n`);
      setResult(prev => prev + `Role: ${profile.role}\n`);
      setResult(prev => prev + `Email: ${profile.email}\n`);
    } catch (error) {
      setResult(prev => prev + `❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('Testing logout...\n');

    try {
      await logout();
      setResult(prev => prev + `✅ Logout successful!\n`);
    } catch (error) {
      setResult(prev => prev + `❌ Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = [
    { email: 'superadmin@veriphy.com', password: 'password123', role: 'Super Admin' },
    { email: 'admin@veriphy.com', password: 'password123', role: 'Admin' },
    { email: 'manager@veriphy.com', password: 'password123', role: 'Manager' },
    { email: 'salesperson@veriphy.com', password: 'password123', role: 'Salesperson' },
    { email: 'creditops@veriphy.com', password: 'password123', role: 'Credit Ops' },
  ];

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-900">🔐 Login Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-purple-800">
            Test login with different user roles. Any password will work for database users.
          </p>

          {user ? (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <p className="font-semibold">Currently logged in as:</p>
              <p>Name: {user.full_name}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
              <Button
                onClick={testLogout}
                disabled={loading}
                className="mt-2"
                variant="outline"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {testCredentials.map((cred, index) => (
                <Button
                  key={index}
                  onClick={() => testLogin(cred.email, cred.password)}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : `Test ${cred.role} Login`}
                </Button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-48">
              {result || 'Click a button to test login...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
