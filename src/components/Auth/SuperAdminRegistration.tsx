import React, { useState } from "react";
import {
  Shield,
  Mail,
  MessageCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  ValidatedInput, 
  ValidatedPasswordInput, 
  ValidationSummary,
  FormSection 
} from "../ui/FormField";
import { useFormValidation, usePasswordValidation } from "../../hooks/useFormValidation";
import { VALIDATION_RULES } from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContextFixed";

interface SuperAdminRegistrationProps {
  onBackToLogin: () => void;
  onRegistrationComplete: (user: any) => void;
}

export function SuperAdminRegistration({
  onBackToLogin,
  onRegistrationComplete,
}: SuperAdminRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerSuperAdmin } = useAuth();

  // Password validation
  const {
    password,
    confirmPassword,
    passwordErrors,
    validatePasswords,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = usePasswordValidation();

  // Form validation
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    validationRules: {
      firstName: VALIDATION_RULES.firstName,
      lastName: VALIDATION_RULES.lastName,
      email: VALIDATION_RULES.email,
      phone: VALIDATION_RULES.phone,
    },
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }
  });

  const onSubmit = async (formValues: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate passwords
      if (!validatePasswords()) {
        return;
      }

      // All form data is valid, proceed with registration
      const registrationData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        role: 'super_admin',
        password: password
      };

      console.log("Registering Super Admin:", registrationData);

      const user = await registerSuperAdmin(registrationData);
      
      console.log("Super Admin registration successful:", user);
      setRegistrationSuccess(true);
      onRegistrationComplete(user);
    } catch (err: any) {
      console.error('Super Admin registration error:', err);
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Super Admin Created Successfully!
              </h2>
              <p className="text-gray-600">
                The super admin account has been created and you are now logged in.
              </p>
            </div>
            <Button 
              onClick={onBackToLogin}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Super Admin
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Set up the initial super administrator account for Veriphy Bank
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="First Name"
                  name="firstName"
                  type="text"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.firstName}
                  placeholder="Enter first name"
                  icon={<User className="h-4 w-4" />}
                />
                <ValidatedInput
                  label="Last Name"
                  name="lastName"
                  type="text"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.lastName}
                  placeholder="Enter last name"
                  icon={<User className="h-4 w-4" />}
                />
              </div>
            </FormSection>

            <FormSection title="Contact Information">
              <ValidatedInput
                label="Email Address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="Enter email address"
                icon={<Mail className="h-4 w-4" />}
              />
              <ValidatedInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                placeholder="Enter phone number"
                icon={<MessageCircle className="h-4 w-4" />}
              />
            </FormSection>

            <FormSection title="Security">
              <ValidatedPasswordInput
                label="Password"
                value={password}
                onChange={handlePasswordChange}
                error={passwordErrors.password}
                placeholder="Enter password"
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                icon={<Lock className="h-4 w-4" />}
              />
              <ValidatedPasswordInput
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm password"
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                icon={<Lock className="h-4 w-4" />}
              />
            </FormSection>

            <ValidationSummary errors={errors} />

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Super Admin...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Super Admin
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
