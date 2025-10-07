import { useState, Suspense, lazy, useEffect } from "react";
import { UserPlus, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContextFixed";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useNavigate } from "react-router-dom";
import veriphyLogo from "../../assets/images/veriphy.io.png";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const { login, user, loading: authLoading } = useAuth();

  const redirectByRole = (role?: string | null) => {
    console.log("User role:", role);
    // Just navigate to root - App.tsx will handle role-based rendering
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("⚠️ Please enter both email and password", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setError("Please enter both email and password");
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting || authLoading) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setIsAnimating(true);

    try {
      const profile = await login(email.trim().toLowerCase(), password);
      console.log("Profile after login:", profile);
      console.log("Role after login:", profile.role);
      
      // Show success notification and redirect ONLY on successful login
      if (profile && profile.id) {
        toast.success("✅ Login successful! Redirecting to dashboard...", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Redirect only after successful login
        setTimeout(() => {
          redirectByRole(profile.role);
        }, 1000); // Small delay to show the success message
      }
    } catch (err: any) {
      console.error("LoginPage error:", err);
      
      // Show error notification based on error type
      let errorMessage = "Something went wrong. Please try again.";
      
      // Check for specific error types
      const errorMsg = err?.message?.toLowerCase() || '';
      
      if (errorMsg.includes("invalid login credentials") || 
          errorMsg.includes("wrong password") ||
          errorMsg.includes("invalid password") ||
          errorMsg.includes("authentication failed") ||
          errorMsg.includes("invalid credentials") ||
          errorMsg.includes("incorrect password")) {
        errorMessage = "❌ Invalid email or password. Please check your credentials and try again.";
      } else if (errorMsg.includes("user not found") || errorMsg.includes("email not found")) {
        errorMessage = "❌ No account found with this email address.";
      } else if (errorMsg.includes("account disabled") || errorMsg.includes("user disabled")) {
        errorMessage = "❌ Your account has been disabled. Please contact support.";
      } else if (errorMsg.includes("too many requests") || errorMsg.includes("rate limit")) {
        errorMessage = "❌ Too many login attempts. Please wait a moment and try again.";
      } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
        errorMessage = "❌ Network error. Please check your connection and try again.";
      } else if (err?.message) {
        errorMessage = `❌ ${err.message}`;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setError(errorMessage);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      // DO NOT redirect on error - stay on login page
      console.log("Login failed, staying on login page");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add entrance animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Remove automatic redirect - only redirect on successful login

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500 hidden sm:block"></div>
        {/* Mobile-optimized background elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse sm:hidden"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000 sm:hidden"></div>
      </div>

      <div className={`max-w-md w-full space-y-6 sm:space-y-8 relative z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Header */}
        <div className="text-center animate-fadeInUp">
          <div className="flex justify-center">
            <img 
              src={veriphyLogo} 
              alt="Veriphy Logo" 
              className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 object-contain transform hover:scale-105 transition-transform duration-300 animate-float"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            {/* <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-glow">
              VERIPHY
            </h1> */}
            <p className="text-blue-200 text-base sm:text-lg font-medium animate-slideInRight">Happy Bank of India</p>
            <p className="text-blue-300/80 text-xs sm:text-sm animate-slideInRight px-4">
              Secure Document Workflow Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl mx-2 sm:mx-0">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">Welcome Back</CardTitle>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 text-red-300 text-xs sm:text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30 animate-shake">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {/* Registration success */}
              {registrationSuccess && (
                <div className="flex items-center space-x-2 text-green-300 text-xs sm:text-sm bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">Registration successful! You can now login with your credentials.</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-blue-200 transition-colors duration-200"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${emailFocused ? 'text-blue-400 scale-110' : 'text-blue-300/60'}`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="block w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm hover:bg-white/15 group-hover:border-white/30 text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                  />
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 animate-fadeInUp" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-blue-200 transition-colors duration-200"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${passwordFocused ? 'text-blue-400 scale-110' : 'text-blue-300/60'}`} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm hover:bg-white/15 group-hover:border-white/30 text-sm sm:text-base"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-blue-300/60 hover:text-blue-300 transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                  {password && (
                    <div className="absolute inset-y-0 right-8 sm:right-12 pr-1 sm:pr-2 flex items-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                size="lg"
                disabled={isSubmitting || authLoading || !email.trim() || !password.trim()}
              >
                {(isSubmitting || authLoading) ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
              </Button>

              {/* Registration options */}
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowRegistration(true)}
                    className="text-blue-300 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-center w-full py-2 px-3 sm:px-4 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                  >
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Create New Account
                  </button>
                </div>

                {/* Role-based Registration (only if user is logged in) */}
                {user && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowRoleBasedRegistration(true)}
                      className="text-green-300 hover:text-green-200 text-xs sm:text-sm font-medium flex items-center justify-center w-full py-2 px-3 sm:px-4 rounded-lg hover:bg-green-500/10 transition-all duration-200 group"
                    >
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Add New User
                    </button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center space-x-2 text-blue-300/80 text-xs sm:text-sm">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Bank-grade security • End-to-end encryption</span>
            <span className="sm:hidden">Secure & Encrypted</span>
          </div>
          <p className="text-blue-400/60 text-xs">
            © 2025 Happy Bank of India. All rights reserved.
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
