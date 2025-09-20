import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

export function DatabaseTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      const results: any = {
        userProfile: null,
        cases: null,
        documents: null,
        messages: null,
        complianceLogs: null,
        dashboardStats: null,
        workloadTasks: null,
        approvalQueue: null,
        teamMembers: null,
      };

      // Test 1: Get current user
      try {
        results.userProfile = await SupabaseDatabaseService.getCurrentUser();
      } catch (error) {
        results.userProfile = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test 2: Get cases
      try {
        results.cases = await SupabaseDatabaseService.getCases({ assignedTo: user?.id });
      } catch (error) {
        results.cases = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test 3: Get dashboard stats
      try {
        results.dashboardStats = await SupabaseDatabaseService.getDashboardStats(user?.id || '', user?.role || '');
      } catch (error) {
        results.dashboardStats = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test 4: Get workload tasks
      try {
        results.workloadTasks = await SupabaseDatabaseService.getWorkloadTasks(user?.id || '');
      } catch (error) {
        results.workloadTasks = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test 5: Get approval queue
      try {
        results.approvalQueue = await SupabaseDatabaseService.getApprovalQueue();
      } catch (error) {
        results.approvalQueue = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test 6: Get team members
      try {
        results.teamMembers = await SupabaseDatabaseService.getTeamMembers();
      } catch (error) {
        results.teamMembers = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      setTestResults(results);
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              This component tests the database integration by calling various Supabase functions.
              Use this to verify that your database connection is working properly.
            </p>
            
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Database Tests'}
            </Button>

            {testResults && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </h4>
                    <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
