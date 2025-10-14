# Salesperson Dashboard - Complete Setup Guide

## 🎯 Overview

This guide will help you set up a fully functional salesperson dashboard with 100% dynamic Supabase data integration.

## ✨ Features

### What Salespeople Will Get:
1. **📊 Dashboard** - Real-time stats, performance metrics, team rankings
2. **👥 My Customers** - List of assigned customers with full details
3. **📁 My Cases** - Active loan applications with status tracking
4. **📄 Document Manager** - Upload and manage documents
5. **💬 Customer Chat** - WhatsApp-style communication
6. **📅 Workload Planner** - Task management and scheduling
7. **🏆 My Performance** - Personal analytics, targets, conversion rates
8. **👨‍👩‍👧‍👦 My Team** - View team members and team performance
9. **🎯 Leaderboard** - Rankings within team and organization

## 🚀 Setup Instructions

### Step 1: Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these SQL scripts in order:

#### 1.1 Main Enhancements (REQUIRED)

```bash
# Open this file and copy its contents:
database/migrations/010_salesperson_enhancements.sql
```

This script will:
- ✅ Add `user_id` column to `customers` table (links customer to salesperson)
- ✅ Add `team_id` column to `users` table (links salesperson to team)
- ✅ Add `monthly_target` and `achieved_amount` to users table
- ✅ Create all necessary indexes for fast queries
- ✅ Create `salesperson_performance` materialized view
- ✅ Create `team_leaderboard` view
- ✅ Create refresh function for performance data

**Time to run:** ~30 seconds

#### 1.2 Customer Assignment (OPTIONAL)

If you have existing customers without salesperson assignments:

```bash
# Open this file and copy its contents:
database/migrations/011_assign_customers_to_salespeople.sql
```

This script offers 3 options:
- **Option 1:** Auto-assign customers evenly (round-robin)
- **Option 2:** Manual assignment by ID
- **Option 3:** Team-based assignment

**Choose the option that fits your needs**

### Step 2: Verify Database Setup

After running the migrations, run these verification queries in Supabase SQL Editor:

```sql
-- Check customers table
SELECT 
    COUNT(*) as total_customers,
    COUNT(user_id) as assigned_customers,
    COUNT(*) - COUNT(user_id) as unassigned_customers
FROM customers;

-- Check salespeople
SELECT 
    u.full_name,
    u.team_id,
    t.name as team_name,
    COUNT(c.id) as assigned_customers,
    COUNT(ca.id) as total_cases
FROM users u
LEFT JOIN teams t ON t.id = u.team_id
LEFT JOIN customers c ON c.user_id = u.id
LEFT JOIN cases ca ON ca.assigned_to = u.id
WHERE u.role = 'salesperson'
GROUP BY u.id, u.full_name, u.team_id, t.name
ORDER BY assigned_customers DESC;

-- Check performance view
SELECT * FROM salesperson_performance LIMIT 5;

-- Check leaderboard
SELECT 
    full_name,
    team_name,
    team_rank,
    overall_rank,
    completed_this_month,
    ROUND(target_achievement_percentage, 2) as target_percent
FROM team_leaderboard
ORDER BY performance_score DESC
LIMIT 10;
```

### Step 3: Refresh Performance Data (Optional)

The `salesperson_performance` is a materialized view that needs to be refreshed periodically.

**Manual Refresh:**
```sql
SELECT refresh_salesperson_performance();
```

**Automatic Refresh (if pg_cron is enabled):**
```sql
-- Refresh every 15 minutes
SELECT cron.schedule(
    'refresh-salesperson-performance', 
    '*/15 * * * *', 
    'SELECT refresh_salesperson_performance()'
);
```

## 📋 Data Structure

### Customers Table
```
- id: BIGINT (Primary Key)
- user_id: BIGINT (Foreign Key → users.id) [Salesperson assignment]
- full_name: VARCHAR
- email: VARCHAR
- mobile: VARCHAR
- organization_id: BIGINT
- kyc_status: ENUM ('verified', 'pending', 'rejected')
- ... other fields
```

### Cases Table
```
- id: BIGINT (Primary Key)
- case_number: VARCHAR
- customer_id: BIGINT (Foreign Key → customers.id)
- assigned_to: BIGINT (Foreign Key → users.id) [Salesperson]
- status: ENUM ('open', 'in_progress', 'closed', 'rejected')
- priority: ENUM ('high', 'medium', 'low')
- loan_amount: NUMERIC
- ... other fields
```

### Users Table (Salespeople)
```
- id: BIGINT (Primary Key)
- full_name: VARCHAR
- email: VARCHAR
- role: VARCHAR ('salesperson')
- team_id: BIGINT (Foreign Key → teams.id)
- monthly_target: NUMERIC (Default: 2500000)
- achieved_amount: NUMERIC (Default: 0)
- organization_id: BIGINT
- ... other fields
```

### Teams Table
```
- id: BIGINT (Primary Key)
- name: VARCHAR
- team_type: VARCHAR ('sales')
- manager_id: BIGINT (Foreign Key → users.id)
- target_cases_per_month: INTEGER
- organization_id: BIGINT
- ... other fields
```

## 🔄 How It Works

### Customer Assignment Flow:
1. **Manager** assigns customers to salesperson by setting `customers.user_id = salesperson_id`
2. **Salesperson** sees assigned customers in "My Customers" page
3. **Salesperson** creates cases for customers
4. **System** automatically links cases to salesperson via `cases.assigned_to`

### Performance Tracking:
1. **System** tracks all salesperson activities (cases, customers, tasks, documents)
2. **Materialized View** aggregates performance data
3. **Dashboard** displays real-time metrics
4. **Leaderboard** ranks salespeople by performance score

### Team Management:
1. **Salesperson** is assigned to a team via `users.team_id`
2. **Team** has a manager and monthly targets
3. **Dashboard** shows team rankings and comparisons

## 🎨 Features Included

### 1. Dashboard (Home Page)
- **Stats Cards:** Active cases, pending documents, completed today, overdue tasks
- **Performance Metrics:** Monthly target, conversion rate, customer satisfaction, team ranking
- **Recent Activities:** Latest customer interactions
- **Priority Tasks:** High-priority items requiring attention
- **Quick Actions:** Fast access to common tasks

### 2. My Customers Page
- **Customer List:** All assigned customers with details
- **Filtering:** By KYC status, risk profile, date range
- **Sorting:** By name, date, status
- **Actions:** View details, create case, update info
- **Real-time Updates:** Auto-refresh on data changes

### 3. My Cases Page
- **Case List:** All assigned cases with status
- **Filtering:** By status, priority, customer
- **Progress Tracking:** Visual indicators for case stage
- **Actions:** View, update, upload documents
- **Real-time Updates:** Live status changes

### 4. My Performance Page
- **Target Progress:** Visual progress bar with achievement %
- **Key Metrics:** Cases closed, conversion rate, revenue
- **Charts:** Monthly trends, category breakdown
- **Leaderboard:** Ranking within team and organization
- **Historical Data:** Past month comparisons

### 5. My Team Page
- **Team Members:** List of colleagues in the same team
- **Team Stats:** Combined performance metrics
- **Manager Info:** Team manager contact details
- **Team Targets:** Monthly goals and achievement
- **Member Performance:** Individual contributions

## 🔧 Configuration

### Setting Monthly Targets
You can set individual or team targets:

```sql
-- Set individual target for a salesperson
UPDATE users 
SET monthly_target = 3000000.00 
WHERE id = <salesperson_id>;

-- Set target for all salespeople in a team
UPDATE users u
SET monthly_target = 2500000.00
FROM teams t
WHERE u.team_id = t.id AND t.id = <team_id>;

-- Set target for all salespeople in organization
UPDATE users 
SET monthly_target = 2000000.00
WHERE organization_id = <org_id> AND role = 'salesperson';
```

### Updating Achieved Amounts
The system can auto-calculate or you can update manually:

```sql
-- Auto-update achieved amount based on closed cases this month
UPDATE users u
SET achieved_amount = COALESCE(
    (SELECT SUM(c.loan_amount) 
     FROM cases c 
     WHERE c.assigned_to = u.id 
     AND c.status = 'closed'
     AND DATE_TRUNC('month', c.updated_at) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0
)
WHERE u.role = 'salesperson';
```

## 📊 Performance Metrics Explained

### Conversion Rate
```
(Completed Cases / Total Cases) × 100
```

### Target Achievement
```
(Achieved This Month / Monthly Target) × 100
```

### Performance Score (Weighted)
```
(Completed Cases × 30) + (Achieved Amount / 100000 × 40) + (Conversion Rate × 30)
```

### Team Rank
Rank within team based on performance score

### Overall Rank
Rank within organization based on performance score

## 🎯 Best Practices

1. **Regular Refresh:** Refresh performance view every 15-30 minutes
2. **Target Setting:** Review and adjust targets quarterly
3. **Customer Assignment:** Distribute customers evenly across team
4. **Data Quality:** Ensure all cases have proper loan amounts
5. **Status Updates:** Keep case statuses up-to-date for accurate metrics

## 🐛 Troubleshooting

### Issue: Performance view shows no data
**Solution:** 
```sql
REFRESH MATERIALIZED VIEW salesperson_performance;
```

### Issue: Customers not showing for salesperson
**Solution:** Check if `customers.user_id` is set:
```sql
SELECT * FROM customers WHERE user_id = <salesperson_id>;
```

### Issue: Leaderboard rankings incorrect
**Solution:** Ensure cases have `loan_amount` and proper `status`:
```sql
SELECT * FROM cases WHERE loan_amount IS NULL OR loan_amount = 0;
```

### Issue: Team not showing
**Solution:** Check team assignment:
```sql
SELECT u.*, t.name as team_name 
FROM users u 
LEFT JOIN teams t ON t.id = u.team_id 
WHERE u.id = <salesperson_id>;
```

## ✅ Verification Checklist

After setup, verify:
- [ ] Migration 010 ran successfully
- [ ] Indexes created on all required tables
- [ ] `salesperson_performance` view exists and has data
- [ ] `team_leaderboard` view exists and has data
- [ ] Customers have `user_id` assigned
- [ ] Users have `team_id` assigned (where applicable)
- [ ] Cases have `assigned_to` set correctly
- [ ] Monthly targets are set for salespeople
- [ ] Frontend connects to Supabase successfully

## 🎉 Success!

Once all steps are complete, salespeople will have:
- 📊 Real-time dashboard with live data
- 👥 Complete customer management
- 📁 Full case lifecycle tracking
- 🏆 Performance metrics and rankings
- 👨‍👩‍👧‍👦 Team collaboration features

**Ready to go!** 🚀

---

**Need Help?** Check the verification queries or review the migration files for detailed comments.

