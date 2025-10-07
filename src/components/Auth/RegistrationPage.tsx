import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  Mail,
  MessageCircle,
  Building,
  User,
  Car as IdCard,
  ArrowLeft,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  ValidatedInput, 
  ValidatedPasswordInput, 
  ValidatedSelect, 
  ValidationSummary,
  FormSection,
  IndianMobileInput
} from "../ui/FormField";
import { useFormValidation, usePasswordValidation } from "../../hooks/useFormValidation";
import { VALIDATION_RULES } from "../../utils/validation";
import { supabase } from "../../supabase-client";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import veriphyLogo from "../../assets/images/veriphy.io.png";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // company: string;
  role: string;
  // employeeId: string;
  password: string;
}

interface RegistrationPageProps {
  onBackToLogin: () => void;
  onRegistrationComplete: (data: RegistrationData) => void;
}

export function RegistrationPage({
  onBackToLogin,
  onRegistrationComplete,
}: RegistrationPageProps) {
  const [step, setStep] = useState(1);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(true);

  // Form validation - disable onChange validation to prevent re-renders
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setSubmitting
  } = useFormValidation({
    validationRules: {
      firstName: VALIDATION_RULES.firstName,
      lastName: VALIDATION_RULES.lastName,
      email: VALIDATION_RULES.email,
      phone: VALIDATION_RULES.phone,
      role: {
        required: true,
        message: 'Please select a role'
      }
    },
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: ""
    },
    validateOnChange: false, // Disable validation on change to prevent re-renders
    validateOnBlur: true,    // Only validate on blur
    sanitizeOnChange: true   // Keep sanitization on change
  });

  // Password validation with confirmation - disable onChange validation
  const {
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    isValid: passwordsValid,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePasswordBlur,
    handleConfirmPasswordBlur,
    validatePasswords
  } = usePasswordValidation({
    validateOnChange: false, // Disable validation on change to prevent re-renders
    validateOnBlur: true     // Only validate on blur
  });

  const roles = useMemo(() => [
    { value: "salesperson", label: "Salesperson" },
    { value: "manager", label: "Sales Manager" },
    { value: "credit-ops", label: "Credit Operations" },
    { value: "admin", label: "System Administrator" },
    { value: "auditor", label: "Auditor" },
    { value: "compliance", label: "Compliance Officer" },
  ], []);

  const completeRegistration = useCallback(async (formValues: Record<string, string>) => {
    // Validate passwords separately
    if (!validatePasswords()) {
      toast.error("⚠️ Please check your password requirements", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // All form data is valid, proceed with registration
    const registrationData: RegistrationData = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      role: formValues.role,
      password: password
    };

    try {
      const {
        email,
        firstName,
        lastName,
        phone,
        role,
      } = registrationData;

      // Show loading toast
      toast.info("🔄 Creating your account...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // 1. Sign up in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            phone,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("SignUp error:", error.message);
        
        // Show specific error messages
        let errorMessage = "Registration failed. Please try again.";
        
        if (error.message.includes("already registered")) {
          errorMessage = "❌ This email is already registered. Please use a different email or try logging in.";
        } else if (error.message.includes("invalid email")) {
          errorMessage = "❌ Please enter a valid email address.";
        } else if (error.message.includes("password")) {
          errorMessage = "❌ Password does not meet requirements. Please check and try again.";
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        throw new Error(error.message);
      }

      // 2. Insert into public.users table
      if (data.user) {
        console.log("Supabase Auth user created:", data.user);
        
        // Insert user with proper Supabase schema fields
        const { data: userData, error: insertError } = await supabase.from("users").insert([
          {
            full_name: `${firstName} ${lastName}`.trim(),
            email: email,
            mobile: phone,
            auth_id: data.user.id, // Link to Supabase Auth user
            role: role, // Set role directly in users table
            status: 'active',
          },
        ]).select().single();

        if (insertError) {
          console.error("Insert error:", insertError.message);
          
          toast.error("❌ Failed to create user profile. Please try again.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          throw new Error(insertError.message);
        }

        console.log("User inserted:", userData);
      }

      console.log("✅ User created and synced to public.users:", data);

      // Show success notification
      toast.success("✅ Account created successfully! Redirecting...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // 3. Check if email confirmation is required
      // Supabase will only return session if confirm email is disabled
      if (data.session) {
        setEmailConfirmRequired(false);
      } else {
        setEmailConfirmRequired(true);
      }

      // 4. Show success screen
      setStep(2);
      setTimeout(() => {
        onRegistrationComplete(registrationData);
      }, 2000);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      
      toast.error("❌ Account creation failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      throw new Error("Account creation failed. Please try again.");
    }
  }, [validatePasswords, password]);

  // ✅ Success Screen
  if (step === 2) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500 hidden sm:block"></div>
          {/* Mobile-optimized background elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-pulse sm:hidden"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000 sm:hidden"></div>
        </div>

        <div className="max-w-md w-full space-y-4 relative z-10">
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Registration Successful!
              </h1>
              {emailConfirmRequired ? (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    We've sent a confirmation email to{" "}
                    <span className="font-medium text-blue-600">{registrationData.email}</span>.{" "}
                    Please check your inbox and confirm your account before logging in.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💌 Check your email and click the confirmation link to activate your account.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  Your account has been created and you are ready to log in immediately.
                </p>
              )}
              
              <div className="mt-4">
                <Button
                  onClick={onBackToLogin}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Continue to Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer - Compact */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 text-green-300/80 text-xs">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Account created successfully • Secure & Encrypted</span>
              <span className="sm:hidden">Account Created</span>
            </div>
            <p className="text-blue-400/60 text-xs">
              © 2025 Happy Bank of India
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if all validations are met
  const isFormValid = isValid && passwordsValid;

  // Add entrance animation
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Registration Form
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500 hidden sm:block"></div>
        {/* Mobile-optimized background elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse sm:hidden"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000 sm:hidden"></div>
      </div>

      <div className={`w-full max-w-4xl relative z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Header - Compact */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center">
            <img 
              src={veriphyLogo} 
              alt="Veriphy Logo" 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain transform hover:scale-105 transition-transform duration-300 animate-float"
            />
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white">Create Account</h1>
          <p className="text-blue-200/80 text-xs sm:text-sm">Join Veriphy Bank of India</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Account Registration</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={onBackToLogin} className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm px-2 sm:px-3">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Back to Login</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSubmit(completeRegistration)} className="space-y-3">
              {/* Validation Summary - Compact */}
              <ValidationSummary 
                errors={{
                  ...errors,
                  ...(passwordError && { password: passwordError }),
                  ...(confirmPasswordError && { confirmPassword: confirmPasswordError })
                }} 
              />

              {/* Compact Form Layout - All in one row on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ValidatedInput
                      label="First Name"
                      type="text"
                      value={values.firstName}
                      onChange={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={errors.firstName}
                      required
                      icon={<User className="h-3 w-3 sm:h-4 sm:w-4" />}
                      placeholder="First name"
                      className="text-sm"
                    />
                    
                    <ValidatedInput
                      label="Last Name"
                      type="text"
                      value={values.lastName}
                      onChange={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={errors.lastName}
                      required
                      icon={<User className="h-3 w-3 sm:h-4 sm:w-4" />}
                      placeholder="Last name"
                      className="text-sm"
                    />
                  </div>

                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                    required
                    icon={<Mail className="h-3 w-3 sm:h-4 sm:w-4" />}
                    placeholder="Enter email address"
                    className="text-sm"
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile Number
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <IndianMobileInput
                      value={values.phone}
                      onChange={(value) => handleChange('phone')({ target: { value } })}
                      onBlur={handleBlur('phone')}
                      error={errors.phone}
                      required
                      placeholder="Enter 10-digit mobile number"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <ValidatedSelect
                    label="Role"
                    value={values.role}
                    onChange={handleChange('role')}
                    onBlur={handleBlur('role')}
                    error={errors.role}
                    required
                    options={roles}
                    placeholder="Select your role"
                    className="text-sm"
                  />

                  <ValidatedPasswordInput
                    label="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    error={passwordError}
                    required
                    placeholder="Create strong password"
                    className="text-sm"
                  />

                  <ValidatedPasswordInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={handleConfirmPasswordBlur}
                    error={confirmPasswordError}
                    required
                    placeholder="Confirm password"
                    className="text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                size="lg" 
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer - Compact */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-2 text-blue-300/80 text-xs">
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Bank-grade security • Email confirmation</span>
            <span className="sm:hidden">Secure & Encrypted</span>
          </div>
          <p className="text-blue-400/60 text-xs">
            © 2025 Happy Bank of India
          </p>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
        }}
      />
    </div>
  );
}