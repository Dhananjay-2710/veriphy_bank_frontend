import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { supabase } from '../../supabase-client';

export function ConnectionTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('organizations').select('count').limit(1);
      
      if (error) {
        setResult(`❌ Connection failed: ${error.message}`);
      } else {
        setResult('✅ Connection successful! Database is accessible.');
      }
    } catch (err) {
      setResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-900">🔧 Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-yellow-800">
            Test if the database connection is working before running the full setup.
          </p>
          
          <Button 
            onClick={testConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : '🔧 Test Database Connection'}
          </Button>
          
          {result && (
            <div className="p-3 bg-white rounded-md border">
              <p className="text-sm text-gray-700">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
