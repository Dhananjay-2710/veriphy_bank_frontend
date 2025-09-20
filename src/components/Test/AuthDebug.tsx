import { useAuth } from '../../contexts/AuthContextFixed';

export function AuthDebug() {
  const { user, loading } = useAuth();

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="font-semibold text-yellow-800 mb-2">Authentication Debug</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
        {user && (
          <>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Full Name:</strong> {user.full_name}</p>
          </>
        )}
      </div>
    </div>
  );
}
