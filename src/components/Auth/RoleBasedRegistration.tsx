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
  Building,
  Users,
  CreditCard,
  FileCheck,
  UserCheck,
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
import { useAuth } from "../../contexts/AuthContextFixed";

interface RoleBasedRegistrationProps {
  onBackToLogin: () => void;
  onRegistrationComplete: (user: any) => void;
  currentUserRole?: string;
}

const roleOptions = [
  { 
    value: "admin", 
    label: "Administrator", 
    description: "Full system access and user management",
    icon: <Shield className="h-5 w-5" />,
    color: "text-red-600"
  },
  { 
    value: "manager", 
    label: "Manager", 
    description: "Team management and oversight",
    icon: <Users className="h-5 w-5" />,
    color: "text-blue-600"
  },
  { 
    value: "salesperson", 
    label: "Salesperson", 
    description: "Customer acquisition and case management",
    icon: <User className="h-5 w-5" />,
    color: "text-green-600"
  },
  { 
    value: "credit-ops", 
    label: "Credit Operations", 
    description: "Credit analysis and approval processes",
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-purple-600"
  },
  { 
    value: "compliance", 
    label: "Compliance Officer", 
    description: "Regulatory compliance and audit",
    icon: <FileCheck className="h-5 w-5" />,
    color: "text-orange-600"
  },
  { 
    value: "auditor", 
    label: "Auditor", 
    description: "System audit and review",
    icon: <UserCheck className="h-5 w-5" />,
    color: "text-indigo-600"
  },
];

export function RoleBasedRegistration({
  onBackToLogin,
  onRegistrationComplete,
  currentUserRole = 'super_admin',
}: RoleBasedRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const { register } = useAuth();

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

  // Filter available roles based on current user's permissions
  const getAvailableRoles = () => {
    switch (currentUserRole) {
      case 'super_admin':
        return roleOptions; // Super admin can create any role
      case 'admin':
        return roleOptions.filter(role => 
          ['manager', 'salesperson', 'credit-ops', 'compliance', 'auditor'].includes(role.value)
        );
      case 'manager':
        return roleOptions.filter(role => 
          ['salesperson'].includes(role.value)
        );
      default:
        return []; // No permission to create users
    }
  };

  const availableRoles = getAvailableRoles();

  const onSubmit = async (formValues: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate passwords
      if (!validatePasswords()) {
        return;
      }

      // Validate role selection
      if (!selectedRole) {
        setError('Please select a role for the user');
        return;
      }

      // All form data is valid, proceed with registration
      const registrationData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        role: selectedRole,
        password: password
      };

      console.log("Registering user:", registrationData);

      const user = await register(registrationData);
      
      console.log("User registration successful:", user);
      setRegistrationSuccess(true);
      onRegistrationComplete(user);
    } catch (err: any) {
      console.error('User registration error:', err);
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
                User Created Successfully!
              </h2>
              <p className="text-gray-600">
                The user account has been created and is ready to use.
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

  if (availableRoles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600">
                You don't have permission to create new users.
              </p>
            </div>
            <Button 
              onClick={onBackToLogin}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create New User
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Add a new user to the Veriphy Bank system
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

            <FormSection title="Role Assignment">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {availableRoles.map((role) => (
                    <div
                      key={role.value}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRole === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`${role.color} mt-0.5`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={selectedRole === role.value}
                              onChange={() => setSelectedRole(role.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-900">
                              {role.label}
                            </label>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                disabled={!isValid || !selectedRole || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating User...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Create User
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
                Back to Dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
