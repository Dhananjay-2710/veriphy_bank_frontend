// Utility to clear all potentially corrupted storage data
export function clearAllStorage() {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear specific Supabase keys that might be corrupted
    const keysToRemove = [
      'sb-aibdxsebwhalbnugsqel-auth-token',
      'sb-ztdkreblmgscvdnzvzeh-auth-token',
      'veriphy_user',
      'supabase.auth.token',
      'supabase.auth.refresh_token'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing ${key}:`, error);
      }
    });
    
    console.log('Storage cleared successfully');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

// Auto-clear on import in development
if (process.env.NODE_ENV === 'development') {
  clearAllStorage();
}
