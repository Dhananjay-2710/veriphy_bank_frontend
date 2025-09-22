import React, { useState } from 'react';
import { 
  Shield, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Database
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { supabase } from '../../supabase-client';

export function SuperAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);

  // Check if super admin already exists
  const checkSuperAdminExists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'superadmin@veriphy.com')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setSuperAdminExists(!!data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check super admin status');
    } finally {
      setLoading(false);
    }
  };

  // Create super admin user
  const createSuperAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            full_name: 'Super Admin',
            email: 'superadmin@veriphy.com',
            mobile: '+91-9999999999',
            role: 'super_admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setSuccess(true);
      setSuperAdminExists(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create super admin');
    } finally {
      setLoading(false);
    }
  };

  // Check on component mount
  React.useEffect(() => {
    checkSuperAdminExists();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 p-4 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Setup</h1>
        <p className="text-gray-600 mt-2">Create the initial super admin user for system setup</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Super Admin Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Checking status...</span>
            </div>
          ) : superAdminExists ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">Super Admin Ready!</h3>
              <p className="text-gray-600 mb-4">
                Super admin user already exists in the database.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Email:</strong> superadmin@veriphy.com<br />
                  <strong>Password:</strong> Any password (authentication is bypassed for testing)
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="mt-4"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Super Admin Not Found</h3>
              <p className="text-gray-600 mb-4">
                No super admin user exists. Create one to access the system setup wizard.
              </p>
              <Button 
                onClick={createSuperAdmin}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Super Admin
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Success!</span>
              </div>
              <p className="text-green-700 mt-1">
                Super admin user created successfully. You can now login with superadmin@veriphy.com
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Create Super Admin</h4>
              <p className="text-gray-600 text-sm">
                Click "Create Super Admin" to add the initial super admin user to your database.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Login as Super Admin</h4>
              <p className="text-gray-600 text-sm">
                Use the credentials: <strong>superadmin@veriphy.com</strong> with any password.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Access System Setup</h4>
              <p className="text-gray-600 text-sm">
                Once logged in, click "System Setup" in the dashboard to configure your organization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Complete Setup Wizard</h4>
              <p className="text-gray-600 text-sm">
                Follow the step-by-step wizard to create organizations, departments, and products.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
