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
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(true);

  const roles = [
    { value: "salesperson", label: "Salesperson" },
    { value: "manager", label: "Sales Manager" },
    { value: "credit-ops", label: "Credit Operations" },
    { value: "admin", label: "System Administrator" },
    { value: "super-admin", label: "Super Admin" },
  ];

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      password,
    } = registrationData;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !role ||
      !password
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const completeRegistration = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    setError("");

    try {
      const {
        email,
        password,
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
        setError(error.message);
        return;
      }

      // 2. Insert into public.users table
      if (data.user) {
        console.log("Supabase Auth user created:", data.user);
        const { error: insertError } = await supabase.from("users").insert([
          {
            auth_id: data.user.id,
            full_name: firstName + " " + lastName,
            email: email,
            mobile: phone,
            role,
          },
        ]);

        if (insertError) {
          console.error("Insert error:", insertError.message);
          setError(insertError.message);
          return;
        }
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
      setError("Account creation failed. Please try again.");
    } finally {
      setLoading(false);
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                completeRegistration();
              }}
              className="space-y-4"
            >
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
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    type="text"
                    value={registrationData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={registrationData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                {loading ? "Creating Account..." : "Register"}
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