import React from 'react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function AuthStatus() {
  const { user, loading } = useAuth();

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-900">🔐 Current Authentication Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Loading:</span>
            <span className={loading ? 'text-red-600' : 'text-green-600'}>
              {loading ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold">User:</span>
            <span className={user ? 'text-green-600' : 'text-red-600'}>
              {user ? 'Logged In' : 'Not Logged In'}
            </span>
          </div>

          {user && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">User Details:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email || 'N/A'}</div>
                <div><strong>Role:</strong> {user.role || 'N/A'}</div>
                <div><strong>Full Name:</strong> {user.full_name || 'N/A'}</div>
              </div>
            </div>
          )}

          {!user && !loading && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold">Not Authenticated</p>
              <p className="text-sm">You need to login to access the application.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
