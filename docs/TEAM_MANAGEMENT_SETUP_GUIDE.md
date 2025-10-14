# Team Management System - Complete Setup Guide

## 🎯 Overview

This guide will help you set up and use the comprehensive Team Management system for Veriphy Bank. The system allows managers to organize users into teams for better workload management and performance tracking.

## ✨ Features

### What You Get:

1. **Teams Table in Supabase**: Full CRUD operations for team management
2. **User-Team Relationships**: `team_id` column in users table
3. **Auto-Population**: Automatic team creation and user assignment based on roles
4. **Real-Time Updates**: Live synchronization using Supabase subscriptions
5. **Performance Tracking**: Active cases, completed cases, and team efficiency metrics
6. **Manager Assignment**: Each team can have a designated manager
7. **Team Types**: Support for different team types (sales, credit-ops, compliance, etc.)

## 📋 Prerequisites

- Access to your Supabase dashboard
- Supabase URL and Anon Key in your `.env` file
- Existing organizations and users in your database

## 🚀 Step-by-Step Setup

### Option 1: Manual SQL Execution (Recommended)

This is the easiest and most reliable method.

#### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

#### Step 2: Execute the Migration

1. Open the file: `database/migrations/008_create_teams_table.sql`
2. Copy the **entire** contents of this file
3. Paste it into the Supabase SQL Editor
4. Click "Run" button
5. Wait for execution to complete (should take 5-10 seconds)

#### Step 3: Verify the Migration

Run this verification query in the SQL Editor:

```sql
-- Check if teams table was created
SELECT 
    'teams table' as check_type,
    COUNT(*) as total_teams,
    COUNT(*) FILTER (WHERE is_active = true) as active_teams
FROM teams;

-- Check if users have been assigned to teams
SELECT 
    'users with teams' as check_type,
    COUNT(*) as users_with_teams,
    COUNT(DISTINCT team_id) as unique_teams
FROM users
WHERE team_id IS NOT NULL;

-- View created teams
SELECT 
    t.id,
    t.name,
    t.team_type,
    t.organization_id,
    COUNT(u.id) as member_count
FROM teams t
LEFT JOIN users u ON u.team_id = t.id
GROUP BY t.id, t.name, t.team_type, t.organization_id
ORDER BY t.organization_id, t.team_type;
```

### Option 2: JavaScript Execution (Alternative)

If you prefer automated execution via script:

#### Step 1: Run the Execution Script

```bash
cd database
node execute-teams-migration.js
```

#### Step 2: Follow the Output

The script will:
- Connect to your Supabase database
- Execute the migration SQL
- Verify the teams table was created
- Show you the created teams
- Report any errors

**Note**: If this fails, use Option 1 (Manual SQL Execution) instead.

## 📊 What Gets Created

### 1. Teams Table Structure

```sql
teams (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    description             TEXT,
    organization_id         BIGINT NOT NULL,
    manager_id              BIGINT,
    team_type               VARCHAR(50) DEFAULT 'sales',
    is_active               BOOLEAN DEFAULT true,
    target_cases_per_month  INTEGER DEFAULT 50,
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMP,
    updated_at              TIMESTAMP,
    deleted_at              TIMESTAMP
)
```

### 2. Users Table Update

Adds `team_id` column:
```sql
ALTER TABLE users ADD COLUMN team_id BIGINT REFERENCES teams(id);
```

### 3. Default Teams Created

For each organization, the following teams are automatically created:

- **Sales Team**: For salespersons
- **Credit Operations**: For credit-ops staff
- **Compliance Team**: For compliance officers

### 4. Auto-Assignment Logic

Users are automatically assigned to teams based on their role:

- **Salespersons** → Sales Team
- **Credit-ops** → Credit Operations Team
- **Compliance** → Compliance Team
- **Managers** → Assigned as team managers

## 🎨 Using the Team Management System

### Backend (Database Service)

The following methods are available in `SupabaseDatabaseService`:

```typescript
// Get all teams (with filters)
const teams = await SupabaseDatabaseService.getTeams({
  organizationId: 1,
  isActive: true,
  teamType: 'sales'
});

// Get a specific team
const team = await SupabaseDatabaseService.getTeamById('123');

// Create a new team
const newTeam = await SupabaseDatabaseService.createTeam({
  name: 'Elite Sales Team',
  description: 'Top performers',
  organizationId: 1,
  managerId: 5,
  teamType: 'sales',
  targetCasesPerMonth: 100
});

// Update a team
await SupabaseDatabaseService.updateTeam('123', {
  name: 'Updated Team Name',
  targetCasesPerMonth: 75
});

// Delete a team
await SupabaseDatabaseService.deleteTeam('123');

// Get team members
const members = await SupabaseDatabaseService.getUsersByTeamId('123');

// Add user to team
await SupabaseDatabaseService.addUserToTeam('user-id', 'team-id');

// Remove user from team
await SupabaseDatabaseService.removeUserFromTeam('user-id');

// Subscribe to real-time team updates
const subscription = SupabaseDatabaseService.subscribeToTeams((payload) => {
  console.log('Team updated:', payload);
});
```

### Frontend (React Hook)

Use the `useTeams` hook in your components:

```typescript
import { useTeams } from '../hooks/useDashboardData';

function TeamManagementPage() {
  const { user } = useAuth();
  
  // Get teams for the current organization
  const { teams, loading, error, refetch } = useTeams({
    organizationId: user?.organizationId,
    isActive: true
  });

  if (loading) return <div>Loading teams...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Teams ({teams.length})</h1>
      {teams.map(team => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <p>Type: {team.teamType}</p>
          <p>Members: {team.memberCount}</p>
          <p>Active Cases: {team.activeCases}</p>
          <p>Completed: {team.completedCases}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📈 Team Metrics

Each team includes the following computed fields:

- **memberCount**: Number of active team members
- **activeCases**: Total active cases assigned to team members
- **completedCases**: Total completed cases by team members
- **targetCasesPerMonth**: Monthly target for the team

## 🔄 Real-Time Updates

The system includes real-time subscriptions:

```typescript
// In your component
useEffect(() => {
  const subscription = SupabaseDatabaseService.subscribeToTeams((payload) => {
    console.log('Team change detected:', payload);
    // Automatically refetch teams
    refetch();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## 🎯 Integration with Manager Dashboard

The Manager Dashboard already uses teams! When you fetch team members with `useTeamMembers`, it now includes team information:

```typescript
const { teamMembers } = useTeamMembers(user?.organizationId);

// Each team member now has:
// - team_id
// - organization_id
// - Performance metrics
```

## 🛠️ Creating a Team Management UI

You can create a dedicated Team Management page for managers. Here's a basic example:

```typescript
import React, { useState } from 'react';
import { useTeams } from '../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { useAuth } from '../contexts/AuthContextFixed';

export function TeamManagementPage() {
  const { user } = useAuth();
  const { teams, loading, error, refetch } = useTeams({
    organizationId: user?.organizationId
  });
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    teamType: 'sales',
    targetCasesPerMonth: 50
  });

  const handleCreateTeam = async () => {
    try {
      await SupabaseDatabaseService.createTeam({
        ...newTeam,
        organizationId: user!.organizationId,
        managerId: user!.id
      });
      
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      console.error('Failed to create team:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <button onClick={() => setShowCreateForm(true)}>
          Create New Team
        </button>
      </div>

      {loading && <p>Loading teams...</p>}
      {error && <p>Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <p className="text-sm text-gray-600">{team.description}</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{team.teamType}</span>
              </div>
              <div className="flex justify-between">
                <span>Members:</span>
                <span className="font-medium">{team.memberCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Cases:</span>
                <span className="font-medium">{team.activeCases || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium">{team.completedCases || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Target:</span>
                <span className="font-medium">{team.targetCasesPerMonth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Teams table exists in Supabase
- [ ] Users table has `team_id` column
- [ ] Default teams created for each organization
- [ ] Users auto-assigned to appropriate teams
- [ ] Managers assigned to teams
- [ ] Real-time subscriptions working
- [ ] Team metrics calculating correctly

## 🔍 Troubleshooting

### Teams table not created?
- Ensure you're using the correct Supabase project
- Check for SQL syntax errors in the migration
- Verify you have admin permissions

### Users not assigned to teams?
```sql
-- Manually assign users to teams
UPDATE users u
SET team_id = (
  SELECT t.id 
  FROM teams t 
  WHERE t.organization_id = u.organization_id 
  AND t.team_type = 'sales' 
  LIMIT 1
)
WHERE u.role = 'salesperson' AND u.team_id IS NULL;
```

### No teams showing up?
```sql
-- Check if teams exist
SELECT * FROM teams;

-- If not, run the insert statements from the migration again
```

## 📚 Next Steps

1. ✅ Execute the migration
2. ✅ Verify teams were created
3. ✅ Test the `useTeams` hook
4. ✅ Build Team Management UI
5. ✅ Integrate with Manager Dashboard
6. ✅ Add team-based filtering to reports

## 🎉 Success!

Your team management system is now ready! Users are organized into teams, and managers can track team performance with real-time metrics.

---

**Need Help?** Check the migration file comments or review the database service methods for more details.

