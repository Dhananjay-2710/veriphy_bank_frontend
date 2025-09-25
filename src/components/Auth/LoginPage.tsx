import { useState } from 'react';
import { Shield, User, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ValidatedInput, ValidatedPasswordInput, ValidationSummary } from '../ui/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { VALIDATION_RULES } from '../../utils/validation';
import { RegistrationPage } from './RegistrationPage';
import { SuperAdminRegistration } from './SuperAdminRegistration';
import { RoleBasedRegistration } from './RoleBasedRegistration';
import { useNavigate } from 'react-router-dom';
import { UserDebugger } from '../Debug/UserDebugger';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export function LoginPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSuperAdminRegistration, setShowSuperAdminRegistration] = useState(false);
  const [showRoleBasedRegistration, setShowRoleBasedRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const { login, user } = useAuth();

  // Form validation
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useFormValidation({
    validationRules: {
      email: VALIDATION_RULES.email,
      password: {
        required: true,
        minLength: 1,
        message: 'Password is required'
      }
    },
    initialValues: {
      email: '',
      password: ''
    }
  });

  const redirectByRole = (role?: string | null) => {
    console.log('User role:', role);
    // Just navigate to root - App.tsx will handle role-based rendering
    navigate('/');
  };

  const onSubmit = async (formValues: Record<string, string>) => {
    try {
      const profile = await login(formValues.email.trim().toLowerCase(), formValues.password); 
      console.log("Profile after login:", profile);
      console.log("Role after login:", profile.role);
      redirectByRole(profile.role); 
    } catch (err: any) {
      console.error('LoginPage error:', err);
      // You could set form-level errors here if needed
      throw new Error(err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log('Registration completed with data:', data);
    setRegistrationSuccess(true);
    setShowRegistration(false);
    setShowSuperAdminRegistration(false);
    setShowRoleBasedRegistration(false);
  };


  if (showSuperAdminRegistration) {
    return (
      <SuperAdminRegistration
        onBackToLogin={() => setShowSuperAdminRegistration(false)}
        onRegistrationComplete={handleRegistrationComplete}
      />
    );
  }

  if (showRoleBasedRegistration) {
    return (
      <RoleBasedRegistration
        onBackToLogin={() => setShowRoleBasedRegistration(false)}
        onRegistrationComplete={handleRegistrationComplete}
        currentUserRole={user?.role || undefined}
      />
    );
  }

  if (showRegistration) {
    return (
      <RegistrationPage
        onBackToLogin={() => setShowRegistration(false)}
        onRegistrationComplete={handleRegistrationComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">VERIPHY</h1>
          <p className="text-gray-600 mt-2">Happy Bank of India</p>
          <p className="text-sm text-gray-500 mt-1">Secure Document Workflow Platform</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Validation Summary */}
              <ValidationSummary errors={errors} />

              {/* Email */}
              <ValidatedInput
                label="Email Address"
                type="email"
                value={values.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                required
                icon={<User className="h-5 w-5" />}
                placeholder="Enter your email"
              />

              {/* Password */}
              <ValidatedPasswordInput
                label="Password"
                value={values.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
                required
                placeholder="Enter your password"
                showToggle={false}
              />

              {/* Test Credentials */}
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">🧪 Test Credentials (any password works):</p>
                <div className="space-y-1">
                  <p>• <strong>Super Admin:</strong> superadmin@veriphy.com <span className="text-red-600 font-bold">(NEW!)</span></p>
                  <p>• <strong>Admin User:</strong> admin@veriphy.com</p>
                  <p>• <strong>Manager User:</strong> manager@veriphy.com</p>
                  <p>• <strong>Sales Person:</strong> sales@veriphy.com</p>
                  <p>• <strong>Credit Operations:</strong> credit@veriphy.com</p>
                  <p>• <strong>Compliance Officer:</strong> compliance@veriphy.com</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Note:</strong> Super Admin has access to system setup wizard and organization management.
                </p>
              </div>

              {/* Registration success */}
              {registrationSuccess && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">
                  Registration successful! You can now login with your credentials.
                </div>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Registration options */}
              <div className="space-y-3">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowRegistration(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Account
                  </button>
                </div>
                
                {/* Super Admin Setup */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/setup'}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-center w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Super Admin Setup
                  </button>
                </div>

                {/* Super Admin Registration (only if no super admin exists) */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowSuperAdminRegistration(true)}
                    className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center justify-center w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Super Admin (Alternative)
                  </button>
                </div>

                {/* Role-based Registration (only if user is logged in) */}
                {user && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowRoleBasedRegistration(true)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* User Debugger - Shows available users for login */}
        <UserDebugger />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • End-to-end encryption</p>
          <p className="mt-1">© 2025 Happy Bank of India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}