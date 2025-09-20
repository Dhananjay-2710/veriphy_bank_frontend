import React, { useState } from 'react';
import { Shield, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { RegistrationPage } from './RegistrationPage';
import { useNavigate } from 'react-router-dom';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const redirectByRole = (role?: string | null) => {
    console.log('User role:', role);
    // Just navigate to root - App.tsx will handle role-based rendering
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profile = await login(email.trim().toLowerCase(), password); 
      console.log("Profile after login:", profile);
      console.log("Role after login:", profile.role);
      redirectByRole(profile.role); 
    } catch (err: any) {
      console.error('LoginPage error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }

    // try {
    //   const user = await login(email.trim().toLowerCase(), password);
    //   console.log("user after login:", user);
    //   const role = (user as unknown as { role?: string | null })?.role ?? null;
    //   redirectByRole(role);
    // } catch (err: any) {
    //   console.error('LoginPage error:', err);
    //   setError(err?.message || 'Something went wrong. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log('Registration completed with data:', data);
    setRegistrationSuccess(true);
    setShowRegistration(false);
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Registration success */}
              {registrationSuccess && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">
                  Registration successful! You can now login with your credentials.
                </div>
              )}

              {/* Submit button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Registration link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegistration(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center w-full mt-3"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Account
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • End-to-end encryption</p>
          <p className="mt-1">© 2025 Happy Bank of India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}