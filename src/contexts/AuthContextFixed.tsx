import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase-client";

interface AppUser {
  id: string;
  email?: string | null;
  role?: string | null;
  full_name?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Login - Works with any database structure
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
        // User exists in Supabase Auth
        const profile = await fetchProfile(authData.user);
        setUser(profile);
        return profile;
      }

      // If Supabase Auth fails, try database-only authentication
      if (authError) {
        console.log("Supabase Auth failed with error:", authError.message);
        console.log("Trying database-only authentication...");
        
        // Get all users to see the actual structure
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('*');

        if (allUsersError) {
          console.error('Error fetching users:', allUsersError);
          throw new Error("Database connection failed. Please try again.");
        }

        console.log('All users in database:', allUsers);

        // Find user by email (case insensitive)
        const dbUser = allUsers?.find(u => 
          u.email && u.email.toLowerCase() === email.toLowerCase()
        );

        if (!dbUser) {
          throw new Error("User not found. Please check your email.");
        }

        console.log('Found user in database:', dbUser);

        // Try to get role - adapt to whatever structure exists
        let role = 'admin'; // Default role

        try {
          // First get the user's internal ID from their auth_id
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', dbUser.id)
            .single();

          if (userData?.id) {
            // Try user_roles table first (using the internal user ID)
            const { data: userRole, error: roleError } = await supabase
              .from('user_roles')
              .select(`
                roles!inner(name)
              `)
              .eq('user_id', userData.id)
              .single();

            if (!roleError && userRole?.roles?.name) {
              role = userRole.roles.name;
              console.log('Found role from user_roles:', role);
            } else {
              console.log('No role found in user_roles, trying direct role field...');
            }
          } else {
            console.log('User not found in users table, using default role');
          }
        } catch (error) {
          console.error('Error fetching role:', error);
        }

        // Try direct role field in users table as fallback
        if (role === 'admin' && dbUser.role) {
          role = dbUser.role;
          console.log('Found role from users.role:', role);
        } else if (role === 'admin' && dbUser.role_id) {
              // Try to get role name from role_id
              const { data: roleData, error: roleDataError } = await supabase
                .from('roles')
                .select('name')
                .eq('id', dbUser.role_id)
                .single();

              if (!roleDataError && roleData?.name) {
                role = roleData.name;
                console.log('Found role from roles table:', role);
              }
            }

        // Normalize role names to match app expectations
        const roleMapping: { [key: string]: string } = {
          'super-admin': 'super_admin',
          'super_admin': 'super_admin',
          'admin': 'admin',
          'manager': 'manager',
          'salesperson': 'salesperson',
          'sales-person': 'salesperson',
          'credit-ops': 'credit-ops',
          'credit_ops': 'credit-ops',
          'creditops': 'credit-ops',
        };

        role = roleMapping[role] || role;
        console.log('Normalized role:', role);

        // Create user profile - adapt to whatever fields exist
        const profile: AppUser = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          role: role,
          full_name: dbUser.full_name || dbUser.name || dbUser.first_name || `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || 'User',
        };

        console.log('Created profile:', profile);

        // Store user in localStorage for database-only users
        localStorage.setItem('veriphy_user', JSON.stringify(profile));
        setUser(profile);
        return profile;
      }

      throw new Error("Login failed. Please check your email and password.");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (authUser: any): Promise<AppUser> => {
    // Try to get user from database
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", authUser.email) 
      .single();

    if (error) {
      console.warn("⚠️ Error fetching profile:", error.message);
    }

    // Try to get role
    let role = 'admin';
    if (dbUser) {
      try {
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles!inner(name)
          `)
          .eq('user_id', dbUser.id)
          .single();
        
        if (!roleError && userRole?.roles?.name) {
          role = userRole.roles.name;
        } else if (dbUser.role) {
          role = dbUser.role;
        }
      } catch (roleError) {
        console.warn('Role lookup failed in fetchProfile:', roleError);
      }
    }

    // Normalize role names to match app expectations
    const roleMapping: { [key: string]: string } = {
      'super-admin': 'super_admin',
      'super_admin': 'super_admin',
      'admin': 'admin',
      'manager': 'manager',
      'salesperson': 'salesperson',
      'sales-person': 'salesperson',
      'credit-ops': 'credit-ops',
      'credit_ops': 'credit-ops',
      'creditops': 'credit-ops',
    };

    role = roleMapping[role] || role;

    const full_name = dbUser ? 
      (dbUser.full_name || dbUser.name || `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || 'User') : 
      null;

    return {
      id: authUser.id,
      email: authUser.email,
      role: role,
      full_name: full_name,
    };
  };

  // ✅ Logout
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('veriphy_user');
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

        // Then try to get Supabase session
        const { data, error } = await supabase.auth.getUser();
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
      } catch (error) {
        console.error('Authentication initialization error:', error);
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
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
