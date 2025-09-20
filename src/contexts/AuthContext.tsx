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
  login: (email: string, password: string) => Promise<AppUser>; // 👈 CHANGE THIS
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser: any): Promise<AppUser> => {
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("first_name, last_name, id")
      .eq("email", authUser.email) 
      .single();

    if (error) {
      console.warn("⚠️ Error fetching profile:", error.message);
    }

    // Get user's role from user_roles table
    let role = 'salesperson';
    if (dbUser) {
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          roles!inner(name)
        `)
        .eq('user_id', dbUser.id)
        .single();
      
      console.log('fetchProfile role lookup:', { userRole, roleError, userId: dbUser.id });
      
      if (roleError) {
        console.error('❌ fetchProfile role lookup failed:', roleError);
      } else if (userRole?.roles?.name) {
        role = userRole.roles.name;
      } else {
        console.warn('⚠️ No role found for user in fetchProfile, defaulting to salesperson');
      }
    }

    const full_name = dbUser ? `${dbUser.first_name} ${dbUser.last_name}`.trim() : null;

    return {
      id: authUser.id,
      email: authUser.email,
      role: role,
      full_name: full_name,
    };
  };

  // ✅ Login
  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    setLoading(true);
    try {
      // First try Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authData?.user) {
        // User exists in Supabase Auth
        const profile = await fetchProfile(authData.user);
        setUser(profile);
        return profile;
      }

      // If Supabase Auth fails, try database-only authentication
      if (authError) {
        console.log("Supabase Auth failed, trying database authentication...");
        
        // Check if user exists in our database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (dbError || !dbUser) {
          throw new Error("Login failed. Please check your email and password.");
        }

        // Get user's role from user_roles table
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles!inner(name)
          `)
          .eq('user_id', dbUser.id)
          .single();

        console.log('Role lookup result:', { userRole, roleError, userId: dbUser.id });

        if (roleError) {
          console.error('❌ Role lookup failed:', roleError);
          throw new Error(`Failed to get user role: ${roleError.message}`);
        }

        if (!userRole || !userRole.roles) {
          console.error('❌ No role found for user:', dbUser.id);
          throw new Error('No role assigned to user. Please contact administrator.');
        }

        // For now, accept any password for database users (in production, you'd verify the password hash)
        // This is a development convenience - in production, you'd implement proper password verification
        const role = userRole.roles.name;
        const profile: AppUser = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          role: role,
          full_name: `${dbUser.first_name} ${dbUser.last_name}`.trim(),
        };

        // Store user in localStorage for database-only users
        localStorage.setItem('veriphy_user', JSON.stringify(profile));
        setUser(profile);
        return profile;
      }

      throw new Error("Login failed. Please check your email and password.");
    } catch (error) {
      console.error("LoginPage error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
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
        // Clear any corrupted localStorage data first
        try {
          const storedUser = localStorage.getItem('veriphy_user');
          if (storedUser) {
            JSON.parse(storedUser); // Test if it's valid JSON
          }
        } catch (error) {
          console.warn('Clearing corrupted localStorage data:', error);
          localStorage.removeItem('veriphy_user');
        }

        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.warn('Auth error, clearing session:', error);
          await supabase.auth.signOut();
          localStorage.removeItem('veriphy_user');
          if (mounted) setUser(null);
        } else if (data?.user) {
          const profile = await fetchProfile(data.user);
          if (mounted) setUser(profile);
        } else {
          // Check for stored database user
          const storedUser = localStorage.getItem('veriphy_user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              if (mounted) setUser(user);
            } catch (error) {
              console.error('Error parsing stored user:', error);
              localStorage.removeItem('veriphy_user');
              if (mounted) setUser(null);
            }
          } else {
            if (mounted) setUser(null);
          }
        }
      } catch (error) {
        console.error('Init error:', error);
        // Clear all auth data on error
        localStorage.removeItem('veriphy_user');
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user).then((profile) => setUser(profile));
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
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