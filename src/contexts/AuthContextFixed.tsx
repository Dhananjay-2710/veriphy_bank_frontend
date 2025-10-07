import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase-client";

interface AppUser {
  id: string;
  email?: string | null;
  role?: string | null;
  full_name?: string | null;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  softLogout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (data: RegistrationData) => Promise<AppUser>;
  sessionTimeout: number | null;
  setSessionTimeout: (timeout: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);

  // ✅ Login - Works with both Supabase Auth and database users
  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    setLoading(true);
    try {
      // First try Supabase Auth
      console.log("Trying Supabase authentication...");
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authData?.user) {
        console.log("Supabase Auth successful:", authData.user.email);
        // User exists in Supabase Auth - fetch their profile from database
        const profile = await fetchProfile(authData.user);
        setUser(profile);
        setLoading(false);
        return profile;
      }

      // If Supabase Auth fails, try database-only authentication (for ex isting users)
      if (authError) {
        console.log("Supabase Auth failed, trying database-only authentication...");
        
        // Get user from database by email (using actual Supabase schema)
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (dbError || !dbUser) {
          console.log('User not found in database:', dbError?.message);
          throw new Error("Invalid email or password. Please check your credentials.");
        }

        console.log('Found user in database:', dbUser);

        // Validate password against password_hash in users table
        if (dbUser.password_hash) {
          // Simple password validation - in production, use proper hashing
          if (password !== dbUser.password_hash) {
            console.log('❌ Password mismatch');
            throw new Error("Invalid password.");
          }
          console.log('✅ Password validated successfully');
        } else {
          console.log('⚠️ No password hash found - accepting any password for testing');
        }

        // Get role directly from users table (actual Supabase schema)
        const role = dbUser.role || 'admin'; // Default role
        console.log('Found role from users.role:', role);

        // Normalize role names to match app expectations
        const roleMapping: { [key: string]: string } = {
          'super_admin': 'super_admin',
          'admin': 'admin',
          'manager': 'manager',
          'salesperson': 'salesperson',
          'sales-person': 'salesperson',
          'credit-ops': 'credit-ops',
          'credit_ops': 'credit-ops',
          'creditops': 'credit-ops',
          'auditor': 'auditor',
          'compliance': 'compliance',
        };

        const normalizedRole = roleMapping[role] || role;
        console.log('Normalized role:', normalizedRole);

        // Create user profile from database record (using actual Supabase schema)
        const profile: AppUser = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          role: normalizedRole,
          full_name: dbUser.full_name || 'User',
        };

        console.log('Created profile:', profile);

        // Store user in localStorage for persistence
        localStorage.setItem('veriphy_user', JSON.stringify(profile));
        setUser(profile);
        setLoading(false);
        return profile;
      }

      throw new Error("Login failed. Please check your email and password.");
    } catch (error) {
      console.error("Login error:", error);
      // Clear any stored user data on error
      localStorage.removeItem('veriphy_user');
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const fetchProfile = async (authUser: any): Promise<AppUser> => {
    // Try to get user from database using actual Supabase schema
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id) // Match by auth_id from Supabase Auth
      .single();

    if (error) {
      console.warn("⚠️ Error fetching profile:", error.message);
      // If no database user found, create a basic profile from auth user
      return {
        id: authUser.id,
        email: authUser.email,
        role: 'admin', // Default role
        full_name: authUser.user_metadata?.firstName ? 
          `${authUser.user_metadata.firstName} ${authUser.user_metadata.lastName || ''}`.trim() : 
          'User',
      };
    }

    // Get role directly from users table (actual Supabase schema)
    const role = dbUser.role || 'admin'; // Default role
    console.log('Found role from users.role in fetchProfile:', role);

    // Normalize role names to match app expectations
    const roleMapping: { [key: string]: string } = {
      'super_admin': 'super_admin',
      'admin': 'admin',
      'manager': 'manager',
      'salesperson': 'salesperson',
      'sales-person': 'salesperson',
      'credit-ops': 'credit-ops',
      'credit_ops': 'credit-ops',
      'creditops': 'credit-ops',
      'auditor': 'auditor',
      'compliance': 'compliance', // Add compliance role back
    };

    const normalizedRole = roleMapping[role] || role;

    return {
      id: authUser.id,
      email: authUser.email,
      role: normalizedRole,
      full_name: dbUser.full_name || 'User',
    };
  };

  // ✅ Hard Logout - Complete session termination
  const logout = async () => {
    console.log('Performing hard logout...');
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all local storage
    localStorage.clear();
    
    // Clear user context
    setUser(null);
  };

  // ✅ Soft Logout - Keep session data for quick re-login
  const softLogout = async () => {
    console.log('Performing soft logout...');
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    // Preserve user preferences
    const userPreferences = localStorage.getItem('user_preferences');
    
    // Clear local storage but keep session info
    localStorage.clear();
    
    if (userPreferences) {
      localStorage.setItem('user_preferences', userPreferences);
    }
    
    // Store session info for quick re-login
    if (user) {
      const sessionInfo = {
        email: user.email,
        lastLogin: new Date().toISOString(),
        softLogout: true
      };
      localStorage.setItem('veriphy_session_info', JSON.stringify(sessionInfo));
    }
    
    // Clear user context but don't sign out from Supabase
    setUser(null);
  };

  // ✅ Refresh profile manually
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const profile = await fetchProfile(data.user);
      setUser(profile);
    } else {
      // If no Supabase Auth user, check if we have a database user in localStorage
      const storedUser = localStorage.getItem('veriphy_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  // ✅ Register new user (standard registration)
  const register = async (data: RegistrationData) => {
    console.log("Attempting registration for:", data.email);
    setLoading(true);
    try {
      const { firstName, lastName, email, phone, role, password } = data;

      // 1. Sign up in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
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

      if (authError) {
        console.error("Supabase Auth signup error:", authError.message);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log("Supabase Auth user created:", authData.user);

      // 2. Insert into public.users table
      const { data: userData, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            full_name: `${firstName} ${lastName}`.trim(),
            email: email.toLowerCase(),
            mobile: phone,
            auth_id: authData.user.id,
            role: role,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError.message);
        // If database insert fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(insertError.message);
      }

      console.log("User inserted into database:", userData);

      // 3. Create user profile
      const profile: AppUser = {
        id: authData.user.id,
        email: authData.user.email,
        role: role,
        full_name: `${firstName} ${lastName}`.trim(),
      };

      // 4. If session is available (email confirmation disabled), set user
      if (authData.session) {
        setUser(profile);
        localStorage.setItem('veriphy_user', JSON.stringify(profile));
      }

      return profile;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  // ✅ Restore session on mount + listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        console.log('Initializing authentication...');

        // First, check if there's a stored database user (for non-Supabase auth users)
        const storedUser = localStorage.getItem('veriphy_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('Found stored database user:', user);
            if (mounted) {
              setUser(user);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('veriphy_user');
          }
        }

        // Then try to get Supabase session (with timeout)
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 3000)
        );

        try {
          const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;
          if (error) {
            console.warn('Supabase auth error:', error);
          }

          if (data?.user) {
            console.log('Found Supabase user:', data.user.email);
            const profile = await fetchProfile(data.user);
            if (mounted) {
              setUser(profile);
            }
          } else {
            console.log('No authenticated user found');
            if (mounted) setUser(null);
          }
        } catch (timeoutError) {
          console.warn('Auth initialization timeout, continuing without auth');
          if (mounted) setUser(null);
        }
      } catch (error) {
        // Only log non-session-missing errors
        if (error instanceof Error && !error.message.includes('Auth session missing')) {
          console.error('Authentication initialization error:', error);
        }
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user);
            setUser(profile);
          } catch (error) {
            console.error('Error fetching profile after auth change:', error);
            setUser(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      if (sub?.subscription) {
        sub.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      softLogout, 
      refreshUser, 
      register, 
      sessionTimeout, 
      setSessionTimeout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
