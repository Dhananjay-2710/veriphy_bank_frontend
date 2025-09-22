import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

export function SupabaseTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Get current user
      console.log('Testing getCurrentUser...');
      const currentUser = await SupabaseDatabaseService.getCurrentUser();
      results.currentUser = currentUser ? 'Success' : 'No user logged in';
      console.log('Current user:', currentUser);

      // Test 2: Get cases
      console.log('Testing getCases...');
      const cases = await SupabaseDatabaseService.getCases();
      results.cases = `${cases.length} cases found`;
      console.log('Cases:', cases);

      // Test 3: Get dashboard stats
      console.log('Testing getDashboardStats...');
      const stats = await SupabaseDatabaseService.getDashboardStats('test-user-id', 'salesperson');
      results.dashboardStats = `Stats loaded: ${stats.totalCases} total cases, ${stats.activeCases} active`;
      console.log('Dashboard stats:', stats);

      // Test 4: Get users
      console.log('Testing getUsers...');
      const users = await SupabaseDatabaseService.getUsers();
      results.users = `${users.length} users found`;
      console.log('Users:', users);

      // Test 5: Get team members
      console.log('Testing getTeamMembers...');
      const teamMembers = await SupabaseDatabaseService.getTeamMembers();
      results.teamMembers = `${teamMembers.length} team members found`;
      console.log('Team members:', teamMembers);

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
      results.error = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Integration Tests'}
            </Button>
            
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results:</h3>
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{key}:</span>
                    <span className={key === 'error' ? 'text-red-600' : 'text-green-600'}>
                      {String(value)}
                    </span>
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
