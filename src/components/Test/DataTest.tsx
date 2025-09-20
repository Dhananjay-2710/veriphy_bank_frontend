import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { SupabaseDatabaseService } from '../../services/supabase-database';

export function DataTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDataTest = async () => {
    setLoading(true);
    try {
      console.log('Running data test...');
      
      // Test dashboard stats
      const stats = await SupabaseDatabaseService.getDashboardStats('test-user', 'admin');
      console.log('Dashboard stats:', stats);
      
      // Test cases
      const cases = await SupabaseDatabaseService.getCases();
      console.log('Cases:', cases);
      
      // Test team members
      const teamMembers = await SupabaseDatabaseService.getTeamMembers();
      console.log('Team members:', teamMembers);
      
      // Test documents
      const documents = await SupabaseDatabaseService.getDocuments('1');
      console.log('Documents:', documents);
      
      // Test tasks
      const tasks = await SupabaseDatabaseService.getWorkloadTasks('test-user');
      console.log('Tasks:', tasks);
      
      setTestResults({
        stats,
        cases: cases.length,
        teamMembers: teamMembers.length,
        documents: documents.length,
        tasks: tasks.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Data test error:', error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Fetching Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDataTest} disabled={loading}>
            {loading ? 'Testing...' : 'Run Data Test'}
          </Button>
          
          {testResults && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
