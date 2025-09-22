import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DatabasePopulator } from '../../scripts/populate-database';
import { ConnectionTest } from './ConnectionTest';
import { useState } from 'react';

export function SetupInstructions() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleQuickSetup = async () => {
    setLoading(true);
    setStatus('Setting up database...');
    
    try {
      await DatabasePopulator.populateAll();
      setStatus('✅ Database setup complete! You can now login with superadmin@veriphy.com / password123');
    } catch (error) {
      setStatus(`❌ Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ConnectionTest />
      
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">🚀 Quick Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-800">
              It looks like this is your first time running the app. You need to populate the database with sample data before you can login.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={handleQuickSetup}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up...' : '🚀 Quick Setup Database'}
              </Button>
            </div>
          
          {status && (
            <div className="p-3 bg-white rounded-md border">
              <p className="text-sm text-gray-700">{status}</p>
            </div>
          )}
          
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>You can login with these existing users (any password works for testing):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Admin User: admin@veriphy.com / any password</li>
              <li>Manager User: manager@veriphy.com / any password</li>
              <li>Sales Person: sales@veriphy.com / any password</li>
              <li>Credit Operations: credit@veriphy.com / any password</li>
              <li>Compliance Officer: compliance@veriphy.com / any password</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Note:</strong> Password validation is disabled for testing. In production, proper authentication should be implemented.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
