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
            <p><strong>After setup, you can login with:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Super Admin: superadmin@veriphy.com / password123</li>
              <li>Admin: admin@veriphy.com / password123</li>
              <li>Manager: manager@veriphy.com / password123</li>
              <li>Salesperson: salesperson@veriphy.com / password123</li>
              <li>Credit Ops: creditops@veriphy.com / password123</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
