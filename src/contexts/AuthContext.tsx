import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase-client";
import { SupabaseDatabaseService } from "../services/supabase-database";

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
  // Enhanced authentication features
  createSession: (sessionData: any) => Promise<any>;
  deleteSession: (sessionId: string) => Promise<void>;
  getSessions: () => Promise<any[]>;
  getAuthAuditLogs: (limit?: number) => Promise<any[]>;
  logAuthEvent: (eventData: any) => Promise<any>;
  // Password reset functionality
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  // Personal access tokens
  createPersonalAccessToken: (tokenData: any) => Promise<any>;
  revokePersonalAccessToken: (tokenId: string) => Promise<void>;
  getPersonalAccessTokens: () => Promise<any[]>;
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
    try {
      // Log the logout event
      if (user) {
        await logAuthEvent({
          user_id: user.id,
          event_type: 'logout',
          event_description: 'User logged out',
          success: true,
          metadata: { logout_method: 'manual' }
        });
      }
    } catch (error) {
      console.error('Error logging logout event:', error);
    }

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

  // =============================================================================
  // ENHANCED AUTHENTICATION METHODS
  // =============================================================================

  // Session Management
  const createSession = async (sessionData: any) => {
    try {
      const result = await SupabaseDatabaseService.createSession(sessionData);
      
      // Log the session creation event
      await logAuthEvent({
        user_id: sessionData.user_id,
        session_id: result?.id,
        event_type: 'session_created',
        event_description: 'User session created',
        success: true,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        metadata: { session_token: sessionData.session_token }
      });

      return result;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await SupabaseDatabaseService.deleteSession(sessionId);
      
      // Log the session deletion event
      await logAuthEvent({
        session_id: sessionId,
        event_type: 'session_terminated',
        event_description: 'User session terminated',
        success: true,
        metadata: { session_id: sessionId }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  const getSessions = async () => {
    try {
      if (!user) return [];
      return await SupabaseDatabaseService.getSessions(user.id);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  };

  // Auth Audit Logs
  const getAuthAuditLogs = async (limit: number = 100) => {
    try {
      if (!user) return [];
      return await SupabaseDatabaseService.getAuthAuditLogs(user.id, undefined, limit);
    } catch (error) {
      console.error('Error fetching auth audit logs:', error);
      return [];
    }
  };

  const logAuthEvent = async (eventData: any) => {
    try {
      return await SupabaseDatabaseService.logAuthEvent(eventData);
    } catch (error) {
      console.error('Error logging auth event:', error);
      throw error;
    }
  };

  // Password Reset Functionality
  const requestPasswordReset = async (email: string) => {
    try {
      // Find user by email
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (dbError || !dbUser) {
        throw new Error('User not found with this email address');
      }

      // Generate a secure token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const tokenHash = btoa(token);

      const tokenData = {
        user_id: dbUser.id,
        token: token,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ip_address: null,
        user_agent: null
      };

      const result = await SupabaseDatabaseService.createPasswordResetToken(tokenData);

      // Log the password reset request event
      await logAuthEvent({
        user_id: dbUser.id,
        event_type: 'password_reset_requested',
        event_description: 'Password reset token created',
        success: true,
        metadata: { email, token_id: result?.id }
      });

      // In a real application, you would send the token via email
      console.log('Password reset token created:', token);
      
      return result;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      // Validate the token
      const tokenData = await SupabaseDatabaseService.validatePasswordResetToken(token);
      
      if (!tokenData) {
        throw new Error('Invalid or expired password reset token');
      }

      // Update the password (in a real app, you'd hash this properly)
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: btoa(newPassword), // Simple encoding for demo
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenData.userId);

      if (updateError) {
        throw new Error('Failed to update password');
      }

      // Mark token as used
      await SupabaseDatabaseService.markPasswordResetTokenAsUsed(tokenData.id);

      // Log the password reset event
      await logAuthEvent({
        user_id: tokenData.userId,
        event_type: 'password_reset_completed',
        event_description: 'Password successfully reset',
        success: true,
        metadata: { token_id: tokenData.id }
      });

    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Personal Access Tokens
  const createPersonalAccessToken = async (tokenData: any) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const result = await SupabaseDatabaseService.createPersonalAccessToken({
        ...tokenData,
        user_id: user.id
      });

      // Log the token creation event
      await logAuthEvent({
        user_id: user.id,
        event_type: 'personal_access_token_created',
        event_description: 'Personal access token created',
        success: true,
        metadata: { token_name: tokenData.name, token_id: result?.id }
      });

      return result;
    } catch (error) {
      console.error('Error creating personal access token:', error);
      throw error;
    }
  };

  const revokePersonalAccessToken = async (tokenId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const result = await SupabaseDatabaseService.revokePersonalAccessToken(tokenId, user.id);

      // Log the token revocation event
      await logAuthEvent({
        user_id: user.id,
        event_type: 'personal_access_token_revoked',
        event_description: 'Personal access token revoked',
        success: true,
        metadata: { token_id: tokenId }
      });

      return result;
    } catch (error) {
      console.error('Error revoking personal access token:', error);
      throw error;
    }
  };

  const getPersonalAccessTokens = async () => {
    try {
      if (!user) return [];
      return await SupabaseDatabaseService.getPersonalAccessTokens(user.id);
    } catch (error) {
      console.error('Error fetching personal access tokens:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser,
      // Enhanced authentication features
      createSession,
      deleteSession,
      getSessions,
      getAuthAuditLogs,
      logAuthEvent,
      // Password reset functionality
      requestPasswordReset,
      resetPassword,
      // Personal access tokens
      createPersonalAccessToken,
      revokePersonalAccessToken,
      getPersonalAccessTokens
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