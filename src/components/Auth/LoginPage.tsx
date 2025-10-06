import { useState, Suspense, lazy } from "react";
import { Shield, User, UserPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContextFixed";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useNavigate } from "react-router-dom";

// Lazy load heavy components
const RegistrationPage = lazy(() =>
  import("./RegistrationPage").then((m) => ({ default: m.RegistrationPage }))
);
const RoleBasedRegistration = lazy(() =>
  import("./RoleBasedRegistration").then((m) => ({
    default: m.RoleBasedRegistration,
  }))
);


interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export function LoginPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRoleBasedRegistration, setShowRoleBasedRegistration] =
    useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login, user } = useAuth();

  const redirectByRole = (role?: string | null) => {
    console.log("User role:", role);
    // Just navigate to root - App.tsx will handle role-based rendering
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const profile = await login(email.trim().toLowerCase(), password);
      console.log("Profile after login:", profile);
      console.log("Role after login:", profile.role);
      redirectByRole(profile.role);
    } catch (err: any) {
      console.error("LoginPage error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log("Registration completed with data:", data);
    setRegistrationSuccess(true);
    setShowRegistration(false);
    setShowRoleBasedRegistration(false);
  };

  if (showRoleBasedRegistration) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <RoleBasedRegistration
          onBackToLogin={() => setShowRoleBasedRegistration(false)}
          onRegistrationComplete={handleRegistrationComplete}
          currentUserRole={user?.role || undefined}
        />
      </Suspense>
    );
  }

  if (showRegistration) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <RegistrationPage
          onBackToLogin={() => setShowRegistration(false)}
          onRegistrationComplete={handleRegistrationComplete}
        />
      </Suspense>
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
          <p className="text-sm text-gray-500 mt-1">
            Secure Document Workflow Platform
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Registration success */}
              {registrationSuccess && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">
                  Registration successful! You can now login with your
                  credentials.
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !email.trim() || !password.trim()}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
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


        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 Bank-grade security • End-to-end encryption</p>
          <p className="mt-1">
            © 2025 Happy Bank of India. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
