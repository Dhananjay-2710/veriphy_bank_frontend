import React, { useState } from 'react';
import { Shield, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { RegistrationPage } from './RegistrationPage';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  company: string;
  role: string;
  employeeId: string;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log('Registration completed with data:', data);
    setRegistrationSuccess(true);
    setShowRegistration(false);
    // In a real implementation, you might want to auto-login the user
    // or show a success message and redirect to login
  };

  if (showRegistration) {
    return <RegistrationPage 
      onBackToLogin={() => setShowRegistration(false)}
      onRegistrationComplete={handleRegistrationComplete}
    />;
  }

  const demoAccounts = [
    { role: 'Salesperson', email: 'priya.sharma@happybank.in', password: 'demo123' },
    { role: 'Sales Manager', email: 'rajesh.kumar@happybank.in', password: 'demo123' },
    { role: 'Credit Operations', email: 'anita.patel@happybank.in', password: 'demo123' },
    { role: 'System Administrator', email: 'suresh.krishnamurthy@happybank.in', password: 'demo123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {registrationSuccess && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">
                  Registration successful! You can now login with your credentials.
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>

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

        <Card padding="sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <p className="font-medium text-gray-800">{account.role}</p>
                  <p className="text-gray-600">{account.email}</p>
                  <p className="text-gray-500">Password: {account.password}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • End-to-end encryption</p>
          <p className="mt-1">© 2025 Happy Bank of India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}