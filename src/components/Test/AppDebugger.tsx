import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function AppDebugger() {
  const [debugInfo, setDebugInfo] = useState('');
  const { user, loading } = useAuth();

  const runAppDebug = () => {
    const info = `
🔍 App Debug Information:

1. Loading State: ${loading ? 'YES' : 'NO'}
2. User State: ${user ? 'LOGGED IN' : 'NOT LOGGED IN'}
3. User Data: ${user ? JSON.stringify(user, null, 2) : 'null'}
4. localStorage veriphy_user: ${localStorage.getItem('veriphy_user') || 'null'}

🎯 Expected Behavior:
- If loading = true: Should show loading spinner
- If loading = false AND user = null: Should show login page
- If loading = false AND user = not null: Should show dashboard

🔧 Current State Analysis:
${loading ? '⏳ App is loading...' : ''}
${!loading && !user ? '🔐 Should show login page' : ''}
${!loading && user ? '🏠 Should show dashboard' : ''}
    `;
    
    setDebugInfo(info);
  };

  const clearAuth = () => {
    localStorage.removeItem('veriphy_user');
    window.location.reload();
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-900">🐛 App Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-red-800">
            This will help debug why the login page isn't appearing.
          </p>

          <div className="space-y-2">
            <Button
              onClick={runAppDebug}
              className="w-full"
            >
              🔍 Run App Debug
            </Button>

            <Button
              onClick={clearAuth}
              className="w-full"
              variant="outline"
            >
              🧹 Clear Auth & Reload
            </Button>
          </div>

          <div className="mt-4">
            <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
              {debugInfo || 'Click "Run App Debug" to start...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
