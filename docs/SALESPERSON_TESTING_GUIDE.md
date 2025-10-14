# 🧪 Salesperson Dashboard - Complete Testing Guide

## 📋 Pre-Testing Checklist

Before testing, ensure:
- ✅ SQL migration `010_salesperson_enhancements.sql` ran successfully
- ✅ You have at least one salesperson user in the database
- ✅ Customers are assigned to the salesperson (`customers.user_id`)
- ✅ The salesperson has at least one case assigned
- ✅ Frontend application is running (`npm run dev`)

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Login & Dashboard View

**Steps:**
1. Login with a salesperson account
2. Dashboard should load automatically

**Expected Results:**
- ✅ Dashboard shows 4 stat cards (Active Cases, Pending Documents, Completed Today, Overdue Tasks)
- ✅ Performance metrics show with progress bars
- ✅ Recent activities list appears
- ✅ Team rank displays in header
- ✅ Quick actions buttons visible
- ✅ No console errors

**Test Data Requirements:**
- At least 1 active case
- User has `team_id` set (optional but recommended)

---

### Scenario 2: My Customers Page

**Steps:**
1. Click "My Customers" in sidebar OR click "My Customers" quick action button
2. Page should load with customer list

**Expected Results:**
- ✅ See list of customers where `customers.user_id = <your_id>`
- ✅ Stats cards show: Total, Verified, Pending, Rejected
- ✅ Search box works for name/email/phone
- ✅ Filters work (KYC Status, Risk Profile)
- ✅ Customer cards show all details
- ✅ "New Case" button opens modal
- ✅ "View Cases" button navigates correctly

**Test Search:**
```
1. Type customer name → Results filter
2. Type email → Results filter
3. Type phone → Results filter
4. Clear search → All customers return
```

**Test Filters:**
```
1. Select "Verified" KYC → Only verified customers show
2. Select "Pending" KYC → Only pending customers show
3. Select "Low" Risk → Only low risk customers show
4. Clear filters → All customers return
```

**Test Create Case:**
```
1. Click "New Case" on a customer card
2. Modal opens with customer info pre-filled
3. Fill loan details
4. Submit → Case created
5. Customer list refreshes
```

---

### Scenario 3: My Team Page

**Steps:**
1. Click "My Team" in sidebar
2. Page should load with team data

**Expected Results:**
- ✅ Team name displays in header
- ✅ Team stats show (Members, Active Cases, Completed, Target Achievement)
- ✅ Team performance overview card displays
- ✅ Team members list shows all members
- ✅ Current user highlighted with blue ring
- ✅ Each member shows: email, phone, performance metrics, progress bar
- ✅ Switch to "Leaderboard" view works
- ✅ Top 3 rankings have trophy icons

**Test Team Members View:**
```
1. Verify current user has "(You)" label
2. Check all members display correctly
3. Verify progress bars show percentages
4. Check performance data is accurate
```

**Test Leaderboard View:**
```
1. Click "Leaderboard" tab
2. See rankings (#1, #2, #3, etc.)
3. Top 3 have gold/silver/bronze coloring
4. Current user highlighted
5. Performance scores display
6. Achieved amounts show
```

**Edge Case - No Team:**
```
1. If user has no team_id
2. Shows "Not Assigned to a Team" message
3. No errors or crashes
```

---

### Scenario 4: My Performance Page

**Steps:**
1. Click "My Performance" in sidebar
2. Page loads with performance analytics

**Expected Results:**
- ✅ 3 ranking cards show (Team Rank, Overall Rank, Performance Score)
- ✅ Monthly target achievement section displays
- ✅ Progress bar shows percentage
- ✅ Key metrics grid (Conversion, Customers, Cases, Pipeline)
- ✅ Case statistics section
- ✅ Customer & document stats
- ✅ Revenue overview (3 cards: Closed, Pipeline, Total)
- ✅ Last activity timestamp shows

**Test Rankings:**
```
1. Team Rank shows position in team
2. Overall Rank shows position in organization
3. Performance Score calculates correctly
4. Numbers match leaderboard data
```

**Test Target Achievement:**
```
1. Target amount displays
2. Achieved amount displays
3. Remaining amount calculates correctly
4. Progress bar matches percentage
5. Color changes based on achievement (red < 50%, yellow 50-99%, green 100%+)
```

**Test Revenue:**
```
1. Total Closed Value = Sum of all closed cases' loan amounts
2. Pipeline Value = Sum of all in-progress cases' loan amounts
3. Total Value = Closed + Pipeline
4. Numbers formatted correctly (₹X.XXL format)
```

---

### Scenario 5: Creating New Cases

**Test 1: Create Case from Dashboard**
```
Steps:
1. Click "New Case" button in dashboard
2. Fill customer details (step 1)
3. Fill loan details (step 2)
4. Review (step 3)
5. Submit

Expected:
- ✅ 3-step wizard works
- ✅ Validation prevents empty fields
- ✅ Case created with assigned_to = salesperson
- ✅ Customer created first, then case
- ✅ Dashboard refreshes after creation
```

**Test 2: Create Case from Customer**
```
Steps:
1. Go to "My Customers"
2. Click "New Case" on a customer card
3. Fill loan details
4. Submit

Expected:
- ✅ Modal opens with customer info shown
- ✅ Only loan details needed (customer already exists)
- ✅ Case created for that customer
- ✅ assigned_to = salesperson
- ✅ customer_id = selected customer
```

---

### Scenario 6: Real-Time Updates

**Test Auto-Refresh:**
```
1. Open dashboard in browser tab 1
2. Open Supabase database in tab 2
3. In Supabase, update a case status
4. Watch tab 1 - dashboard should update within seconds
```

**Test Performance Refresh:**
```
1. Open "My Performance" page
2. Wait 5 minutes
3. Performance data auto-refreshes
4. Or click "Refresh" button manually
```

**Test Customer Subscription:**
```
1. Open "My Customers" page
2. In Supabase, assign a new customer to this salesperson
3. Page should update automatically
4. New customer appears in list
```

---

### Scenario 7: Navigation Testing

**Test All Routes:**
```
Dashboard (/) → ✅ Works
My Customers (/salesperson/customers) → ✅ Works
My Cases (/cases) → ✅ Works
My Performance (/salesperson/performance) → ✅ Works
My Team (/salesperson/team) → ✅ Works
Document Manager (/document-manager) → ✅ Works
Customer Chat (/communicator) → ✅ Works
Workload Planner (/workload) → ✅ Works
```

**Test Sidebar Navigation:**
```
1. Click each item in sidebar
2. Page loads correctly
3. Back buttons work
4. Breadcrumbs update (if present)
```

---

### Scenario 8: Error Handling

**Test Network Error:**
```
1. Disconnect internet
2. Try to refresh any page
3. Error message appears
4. Retry button visible
5. Reconnect internet
6. Click retry → Data loads
```

**Test No Data:**
```
1. Login as new salesperson (no customers/cases)
2. Dashboard shows zeros
3. My Customers shows "No customers assigned"
4. My Team shows team info (if assigned)
5. My Performance shows zeros/N/A
6. No crashes or errors
```

**Test Invalid User:**
```
1. User without team_id
2. My Team shows "Not assigned to a team"
3. Dashboard works normally
4. Other pages work normally
```

---

### Scenario 9: Data Accuracy

**Verify Dashboard Stats:**
```sql
-- Run in Supabase SQL Editor to verify
SELECT 
    COUNT(*) FILTER (WHERE status = 'in_progress') as active_cases,
    COUNT(*) as total_cases
FROM cases
WHERE assigned_to = <salesperson_id>;
```

**Verify Customer Assignment:**
```sql
-- Check assigned customers
SELECT 
    id,
    full_name,
    email,
    kyc_status
FROM customers
WHERE user_id = <salesperson_id>;
```

**Verify Performance Data:**
```sql
-- Check performance view
SELECT * 
FROM salesperson_performance 
WHERE user_id = <salesperson_id>;
```

**Verify Leaderboard:**
```sql
-- Check leaderboard rankings
SELECT 
    full_name,
    team_rank,
    overall_rank,
    performance_score
FROM team_leaderboard
ORDER BY performance_score DESC;
```

---

## 📊 EXPECTED DATA FLOW

### Creating a Case
```
1. Salesperson fills NewCaseForm
   ↓
2. Customer created in 'customers' table
   ↓
3. customers.user_id = salesperson_id
   ↓
4. Case created in 'cases' table
   ↓
5. cases.assigned_to = salesperson_id
   ↓
6. Performance view auto-calculates
   ↓
7. Dashboard stats update via subscription
   ↓
8. Leaderboard recalculates on next refresh
```

### Viewing Customers
```
1. Salesperson navigates to "My Customers"
   ↓
2. useSalespersonCustomers hook queries:
   SELECT * FROM customers WHERE user_id = salesperson_id
   ↓
3. Results filtered by KYC/risk if filters applied
   ↓
4. Real-time subscription listens for changes
   ↓
5. Auto-updates when customers added/modified
```

### Performance Tracking
```
1. Salesperson views "My Performance"
   ↓
2. useSalespersonPerformance queries:
   SELECT * FROM salesperson_performance WHERE user_id = salesperson_id
   ↓
3. If view doesn't exist, calculates on-the-fly
   ↓
4. Auto-refreshes every 5 minutes
   ↓
5. Manual refresh button available
```

---

## 🔍 DEBUGGING TIPS

### Issue: Dashboard shows all zeros
**Check:**
```sql
-- Are cases assigned?
SELECT COUNT(*) FROM cases WHERE assigned_to = <salesperson_id>;

-- Are customers assigned?
SELECT COUNT(*) FROM customers WHERE user_id = <salesperson_id>;
```

### Issue: Team page shows "Not assigned"
**Check:**
```sql
-- Check team assignment
SELECT id, full_name, team_id FROM users WHERE id = <salesperson_id>;

-- Assign to a team
UPDATE users SET team_id = <team_id> WHERE id = <salesperson_id>;
```

### Issue: Leaderboard is empty
**Check:**
```sql
-- Check if view exists
SELECT * FROM team_leaderboard LIMIT 1;

-- If empty, refresh performance view
SELECT refresh_salesperson_performance();
```

### Issue: Performance data not updating
**Solution:**
```sql
-- Manually refresh the materialized view
REFRESH MATERIALIZED VIEW salesperson_performance;

-- Or use the function
SELECT refresh_salesperson_performance();
```

### Issue: Customers not showing
**Check:**
```sql
-- Verify customers.user_id column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'user_id';

-- Assign customers
UPDATE customers SET user_id = <salesperson_id> WHERE id IN (...);
```

---

## 📈 PERFORMANCE BENCHMARKS

### Load Times (Expected)
- Dashboard initial load: < 2 seconds
- My Customers: < 1.5 seconds
- My Team: < 2 seconds (with performance calculation)
- My Performance: < 1.5 seconds
- Real-time updates: < 1 second after DB change

### API Calls (Expected)
- Dashboard: 4 queries (stats, performance, leaderboard, cases)
- My Customers: 1 query (with joins)
- My Team: 2 queries (team members + leaderboard)
- My Performance: 2 queries (performance + leaderboard)

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass All:
- [ ] All pages load without errors
- [ ] All stats show real data (not mock/hardcoded)
- [ ] Search and filters work correctly
- [ ] Real-time updates work
- [ ] New case creation works
- [ ] Navigation works between all pages
- [ ] Error states display properly
- [ ] Loading states show during fetch
- [ ] Empty states show when no data
- [ ] Mobile responsive on all devices
- [ ] No console errors
- [ ] No linter errors
- [ ] No TypeScript errors

---

## 🎯 SUCCESS METRICS

After successful testing, you should have:
- ✅ **0 bugs** - All functionality works perfectly
- ✅ **100% Supabase** - All data comes from database
- ✅ **Real-time** - Live updates working
- ✅ **Fast performance** - Pages load quickly
- ✅ **Great UX** - Beautiful, intuitive interface
- ✅ **Mobile ready** - Works on all devices

---

## 🎉 READY FOR PRODUCTION!

Once all tests pass, the salesperson dashboard is ready for:
- ✅ Production deployment
- ✅ User acceptance testing
- ✅ Stakeholder demo
- ✅ Training sessions
- ✅ Live use

---

**Need Help?** Review the analysis report at `docs/SALESPERSON_ANALYSIS_REPORT.md`

