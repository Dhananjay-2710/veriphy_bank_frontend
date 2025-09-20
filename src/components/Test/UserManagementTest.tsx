import React from 'react';
import { 
  useUserProfiles, 
  useUserActivityLogs, 
  useOrganizationMembers, 
  useUserSessions,
  useRealtimeUserProfiles,
  useRealtimeUserActivityLogs,
  useRealtimeOrganizationMembers,
  useRealtimeUserSessions
} from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function UserManagementTest() {
  // Test hooks for user profiles
  const { userProfiles, loading: profilesLoading, error: profilesError, refetch: refetchProfiles } = useUserProfiles();
  const { activityLogs, loading: logsLoading, error: logsError, refetch: refetchLogs } = useUserActivityLogs({ limit: 10 });
  const { organizationMembers, loading: membersLoading, error: membersError, refetch: refetchMembers } = useOrganizationMembers();
  const { userSessions, loading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useUserSessions();

  // Set up real-time subscriptions
  useRealtimeUserProfiles(refetchProfiles);
  useRealtimeUserActivityLogs(refetchLogs);
  useRealtimeOrganizationMembers(refetchMembers);
  useRealtimeUserSessions(refetchSessions);

  // Test CRUD operations
  const testCreateUserProfile = async () => {
    try {
      const profile = await SupabaseDatabaseService.createUserProfile({
        userId: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
        bio: 'Test user profile'
      });
      console.log('Created user profile:', profile);
      refetchProfiles();
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const testCreateActivityLog = async () => {
    try {
      const log = await SupabaseDatabaseService.createUserActivityLog({
        userId: 'test-user-id',
        activityType: 'login',
        activityDescription: 'User logged in to the system',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Test Browser)'
      });
      console.log('Created activity log:', log);
      refetchLogs();
    } catch (error) {
      console.error('Error creating activity log:', error);
    }
  };

  const testCreateOrganizationMember = async () => {
    try {
      const member = await SupabaseDatabaseService.createOrganizationMember({
        organizationId: 'test-org-id',
        userId: 'test-user-id',
        status: 'active',
        permissions: ['read', 'write']
      });
      console.log('Created organization member:', member);
      refetchMembers();
    } catch (error) {
      console.error('Error creating organization member:', error);
    }
  };

  const testCreateUserSession = async () => {
    try {
      const session = await SupabaseDatabaseService.createUserSession({
        userId: 'test-user-id',
        organizationId: 'test-org-id',
        sessionToken: 'test-session-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Test Browser)'
      });
      console.log('Created user session:', session);
      refetchSessions();
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management Integration Test</h1>
      
      {/* Test CRUD Operations */}
      <Card>
        <CardHeader>
          <CardTitle>CRUD Operations Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={testCreateUserProfile}>
              Create User Profile
            </Button>
            <Button onClick={testCreateActivityLog}>
              Create Activity Log
            </Button>
            <Button onClick={testCreateOrganizationMember}>
              Create Organization Member
            </Button>
            <Button onClick={testCreateUserSession}>
              Create User Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>User Profiles ({userProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {profilesLoading && <p>Loading profiles...</p>}
          {profilesError && <p className="text-red-500">Error: {profilesError}</p>}
          {!profilesLoading && !profilesError && (
            <div className="space-y-2">
              {userProfiles.slice(0, 5).map((profile) => (
                <div key={profile.id} className="p-2 border rounded">
                  <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                  <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                  <p><strong>Active:</strong> {profile.isActive ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs ({activityLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading && <p>Loading activity logs...</p>}
          {logsError && <p className="text-red-500">Error: {logsError}</p>}
          {!logsLoading && !logsError && (
            <div className="space-y-2">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2 border rounded">
                  <p><strong>Activity:</strong> {log.activityType}</p>
                  <p><strong>Description:</strong> {log.activityDescription}</p>
                  <p><strong>Date:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Members */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({organizationMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading && <p>Loading organization members...</p>}
          {membersError && <p className="text-red-500">Error: {membersError}</p>}
          {!membersLoading && !membersError && (
            <div className="space-y-2">
              {organizationMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="p-2 border rounded">
                  <p><strong>User:</strong> {member.user?.name}</p>
                  <p><strong>Status:</strong> {member.status}</p>
                  <p><strong>Joined:</strong> {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>User Sessions ({userSessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading && <p>Loading user sessions...</p>}
          {sessionsError && <p className="text-red-500">Error: {sessionsError}</p>}
          {!sessionsLoading && !sessionsError && (
            <div className="space-y-2">
              {userSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-2 border rounded">
                  <p><strong>User:</strong> {session.user?.name}</p>
                  <p><strong>Active:</strong> {session.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>Login:</strong> {new Date(session.loginAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
