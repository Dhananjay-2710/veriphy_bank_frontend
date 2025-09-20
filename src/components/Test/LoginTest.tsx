import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function LoginTest() {
  const { login, user, loading } = useAuth();
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testLogin = async (email: string, password: string) => {
    setTestLoading(true);
    setResult('Attempting login...');
    
    try {
      const user = await login(email, password);
      setResult(`✅ Login successful! User: ${user.email}, Role: ${user.role}`);
    } catch (error) {
      setResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Current User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => testLogin('superadmin@veriphy.com', 'password123')}
              disabled={testLoading}
              className="w-full"
            >
              {testLoading ? 'Testing...' : 'Test Super Admin Login'}
            </Button>
            
            <Button 
              onClick={() => testLogin('admin@veriphy.com', 'password123')}
              disabled={testLoading}
              variant="outline"
              className="w-full"
            >
              {testLoading ? 'Testing...' : 'Test Admin Login'}
            </Button>
          </div>
          
          {result && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
