import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  ValidatedInput, 
  ValidatedPasswordInput, 
  ValidatedSelect, 
  ValidationSummary,
  FormSection 
} from "../ui/FormField";
import { useFormValidation, usePasswordValidation } from "../../hooks/useFormValidation";
import { VALIDATION_RULES } from "../../utils/validation";
import { supabase } from "../../supabase-client";

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

  // Form validation
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
    }
  });

  // Password validation with confirmation
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
  } = usePasswordValidation();

  const roles = [
    { value: "salesperson", label: "Salesperson" },
    { value: "manager", label: "Sales Manager" },
    { value: "credit-ops", label: "Credit Operations" },
    { value: "admin", label: "System Administrator" },
    { value: "auditor", label: "Auditor" },
    { value: "compliance", label: "Compliance Officer" },
  ];

  const completeRegistration = async (formValues: Record<string, string>) => {
    // Validate passwords separately
    if (!validatePasswords()) {
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
          throw new Error(insertError.message);
        }

        console.log("User inserted:", userData);
      }

      console.log("✅ User created and synced to public.users:", data);

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
    } catch (err) {
      console.error("Unexpected error:", err);
      throw new Error("Account creation failed. Please try again.");
    }
  };

  // ✅ Success Screen
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Successful!
            </h1>
            {emailConfirmRequired ? (
              <p className="text-gray-600 mb-6">
                We’ve sent a confirmation email to{" "}
                <span className="font-medium">{registrationData.email}</span>.{" "}
                Please check your inbox and confirm your account before logging
                in.
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Your account has been created and you are ready to log in
                immediately.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if all validations are met
  const isFormValid = isValid && passwordsValid;

  // ✅ Registration Form
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
            <form onSubmit={handleSubmit(completeRegistration)} className="space-y-4">
              {/* Validation Summary */}
              <ValidationSummary 
                errors={{
                  ...errors,
                  ...(passwordError && { password: passwordError }),
                  ...(confirmPasswordError && { confirmPassword: confirmPasswordError })
                }} 
              />

              <FormSection title="Personal Information">
                <div className="grid grid-cols-2 gap-4">
                  <ValidatedInput
                    label="First Name"
                    type="text"
                    value={values.firstName}
                    onChange={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={errors.firstName}
                    required
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter first name"
                  />
                  
                  <ValidatedInput
                    label="Last Name"
                    type="text"
                    value={values.lastName}
                    onChange={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={errors.lastName}
                    required
                    icon={<User className="h-4 w-4" />}
                    placeholder="Enter last name"
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
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="Enter email address"
                />

                <ValidatedInput
                  label="WhatsApp Number"
                  type="tel"
                  value={values.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={errors.phone}
                  required
                  icon={<MessageCircle className="h-4 w-4" />}
                  placeholder="Enter WhatsApp number"
                  helpText="Enter 10-digit Indian mobile number"
                />

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={registrationData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div> */}

              </FormSection>

              <FormSection title="Role & Security">
                <ValidatedSelect
                  label="Role"
                  value={values.role}
                  onChange={handleChange('role')}
                  onBlur={handleBlur('role')}
                  error={errors.role}
                  required
                  options={roles}
                  placeholder="Select your role"
                  helpText="Choose your role in the organization"
                />
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={registrationData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div> */}

                <ValidatedPasswordInput
                  label="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  error={passwordError}
                  required
                  placeholder="Enter a strong password"
                  helpText="Must contain 8+ characters with uppercase, lowercase, number, and special character"
                />

                <ValidatedPasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  error={confirmPasswordError}
                  required
                  placeholder="Confirm your password"
                />

              </FormSection>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • Email confirmation</p>
          <p className="mt-1">© 2025 Happy Bank of India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}