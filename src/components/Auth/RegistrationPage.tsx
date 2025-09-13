import React, { useState } from 'react';
import { Shield, Mail, MessageCircle, Building, User, Phone, Car as IdCard, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  company: string;
  role: string;
  employeeId: string;
  password: string;
}

interface RegistrationPageProps {
  onBackToLogin: () => void;
  onRegistrationComplete: (data: RegistrationData) => void;
}

export function RegistrationPage({ onBackToLogin, onRegistrationComplete }: RegistrationPageProps) {
  const [step, setStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    company: '',
    role: '',
    employeeId: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'salesperson', label: 'Salesperson' },
    { value: 'manager', label: 'Sales Manager' },
    { value: 'credit-ops', label: 'Credit Operations' },
    { value: 'admin', label: 'System Administrator' }
  ];

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, whatsapp, company, role, employeeId, password } = registrationData;
    if (!firstName || !lastName || !email || !whatsapp || !company || !role || !employeeId || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!whatsapp.match(/^\+?[\d\s-()]+$/)) {
      setError('Please enter a valid WhatsApp number');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const sendOTPs = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API calls for sending OTPs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would call your backend APIs here
      console.log('Sending email OTP to:', registrationData.email);
      console.log('Sending WhatsApp OTP to:', registrationData.whatsapp);
      
      setStep(2);
    } catch (err) {
      setError('Failed to send verification codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit email OTP');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call for email OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, verify with backend
      if (emailOtp === '123456') { // Demo OTP
        setEmailVerified(true);
        setError('');
      } else {
        setError('Invalid email OTP. Please try again.');
      }
    } catch (err) {
      setError('Email verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyWhatsAppOTP = async () => {
    if (!whatsappOtp || whatsappOtp.length !== 6) {
      setError('Please enter a valid 6-digit WhatsApp OTP');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call for WhatsApp OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, verify with backend
      if (whatsappOtp === '654321') { // Demo OTP
        setWhatsappVerified(true);
        setError('');
      } else {
        setError('Invalid WhatsApp OTP. Please try again.');
      }
    } catch (err) {
      setError('WhatsApp verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!emailVerified || !whatsappVerified) {
      setError('Please verify both email and WhatsApp before proceeding');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call for account creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, create account in backend
      console.log('Creating account with data:', registrationData);
      
      setStep(3);
      setTimeout(() => {
        onRegistrationComplete(registrationData);
      }, 2000);
    } catch (err) {
      setError('Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = (provider: string) => {
    console.log(`Initiating SSO login with ${provider}`);
    // In a real implementation, redirect to SSO provider
    setError(`SSO with ${provider} would be implemented here`);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You will be redirected to the login page shortly.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✅ Email verified: {registrationData.email}</p>
              <p>✅ WhatsApp verified: {registrationData.whatsapp}</p>
              <p>✅ Company: {registrationData.company}</p>
              <p>✅ Role: {roles.find(r => r.value === registrationData.role)?.label}</p>
              <p>✅ Secure password created</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-sm text-gray-500 mt-1">Create Your Account</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Account Registration</CardTitle>
                <Button variant="outline" size="sm" onClick={onBackToLogin}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); sendOTPs(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={registrationData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={registrationData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your.email@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={registrationData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91-9876543210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={registrationData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Happy Bank of India"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={registrationData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={registrationData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="EMP001"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registrationData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Sending Verification Codes...' : 'Send Verification Codes'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSSOLogin('Google')}
                    className="w-full"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google SSO
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSSOLogin('Microsoft')}
                    className="w-full"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                      <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                    Microsoft SSO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Identity</CardTitle>
              <p className="text-sm text-gray-600">
                We've sent verification codes to your email and WhatsApp. Please enter them below.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email OTP Verification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Verification Code
                    </label>
                    {emailVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={emailVerified}
                      />
                    </div>
                    <Button
                      onClick={verifyEmailOTP}
                      disabled={emailVerified || loading || emailOtp.length !== 6}
                      size="sm"
                    >
                      {emailVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Code sent to: {registrationData.email} (Demo code: 123456)
                  </p>
                </div>

                {/* WhatsApp OTP Verification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      WhatsApp Verification Code
                    </label>
                    {whatsappVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={whatsappOtp}
                        onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={whatsappVerified}
                      />
                    </div>
                    <Button
                      onClick={verifyWhatsAppOTP}
                      disabled={whatsappVerified || loading || whatsappOtp.length !== 6}
                      size="sm"
                    >
                      {whatsappVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Code sent to: {registrationData.whatsapp} (Demo code: 654321)
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={completeRegistration}
                    disabled={!emailVerified || !whatsappVerified || loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • Dual OTP verification</p>
          <p className="mt-1">© 2025 Happy Bank of India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}