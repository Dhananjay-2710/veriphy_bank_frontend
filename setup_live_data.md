# Live Data Setup for Veriphy Bank Frontend

This guide will help you populate your Supabase database with the necessary data for the live data integration to work properly.

## Prerequisites

1. Access to your Supabase Dashboard
2. Your Supabase project URL and API key
3. Admin access to run SQL queries

## Step 1: Execute the Main Data Setup Script

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `database_live_data_setup.sql`
5. Click **Run** to execute the script

## Step 2: Verify the Data

1. In the same **SQL Editor**
2. Copy and paste the contents of `verify_live_data.sql`
3. Click **Run** to verify all data was inserted correctly

## Expected Results

After running both scripts, you should see:

### Data Counts:
- **Organizations**: 2
- **Departments**: 4
- **Users**: 5 (including Meera Joshi for credit-ops)
- **Products**: 4 (Home, Personal, Business, Auto loans)
- **Customers**: 8
- **Cases**: 11 (with different statuses)
- **Compliance Issues**: 5
- **Documents**: 10
- **Tasks**: 4
- **Audit Logs**: 5

### Component Data:

#### Approval Queue:
- 5 cases with status: `new`, `in-progress`, or `review`
- Different priorities: `high`, `medium`
- Various loan types and amounts

#### Compliance Review:
- 5 compliance issues with different severities
- Statuses: `open`, `in-progress`, `resolved`, `escalated`
- Different issue types: Document Mismatch, KYC Verification, etc.

#### Pending Reviews:
- Same cases as Approval Queue (cases needing review)

#### Compliance Reports:
- Compliance metrics and breakdown data
- Audit logs for system activity

## Testing the Components

1. **Start your React app**: `npm run dev`
2. **Login as credit-ops user**: `meera.joshi@veriphy.com`
3. **Navigate to each component**:
   - Approval Queue
   - Compliance Reports
   - Compliance Review
   - Pending Reviews

## Troubleshooting

If you encounter issues:

1. **Check table existence**: Run the verification script first
2. **Check data counts**: Ensure all tables have the expected number of rows
3. **Check case statuses**: Verify cases have the correct status values
4. **Check user roles**: Ensure users have the correct roles assigned

## Data Structure

The script creates:

- **Organizations**: Main branch and Delhi branch
- **Departments**: Credit Operations, Compliance, Sales, Documentation
- **Users**: Credit ops staff, compliance officers, managers
- **Products**: Home, Personal, Business, and Auto loans
- **Customers**: 8 test customers with verified KYC
- **Cases**: 11 loan applications with different statuses
- **Compliance Issues**: 5 different compliance issues
- **Documents**: Various document types and statuses
- **Tasks**: Workload management tasks
- **Audit Logs**: System activity logs

## Notes

- All timestamps are set to recent dates for realistic testing
- Case statuses use the correct enum values: `new`, `in-progress`, `review`, `approved`, `rejected`, `on-hold`
- Compliance issue statuses: `open`, `in-progress`, `resolved`, `escalated`, `closed`
- Priority levels: `low`, `medium`, `high`, `urgent`

## Next Steps

After setting up the data:

1. Test all four components with live data
2. Verify real-time updates work correctly
3. Check error handling with empty states
4. Test filtering and sorting functionality

The components should now display real data from your Supabase database instead of mock data.
