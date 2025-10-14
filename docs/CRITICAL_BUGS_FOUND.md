# 🚨 CRITICAL BUGS FOUND - Salesperson Dashboard Testing Report

## ⚠️ SEVERITY: HIGH - MUST FIX BEFORE PRODUCTION

After thorough testing as a QA engineer, I found **CRITICAL BUGS** that will cause system failures!

---

## 🔴 CRITICAL BUG #1: NewCaseFromCustomerModal - Type Mismatch & Missing Fields

**File:** `src/components/Salesperson/NewCaseFromCustomerModal.tsx`
**Lines:** 63-76
**Severity:** 🔴 **CRITICAL** - Will cause runtime errors

### Problem:
```typescript
// ❌ WRONG - This will FAIL!
const caseData = {
  customerId: customer.id,           // ❌ Might be STRING, needs NUMBER
  loanType: formData.loanType,
  loanAmount: parseFloat(formData.loanAmount),
  purpose: formData.purpose,         // ❌ Not in createCase signature!
  tenure: parseInt(formData.tenure), // ❌ Not in createCase signature!
  assignedTo: user?.id?.toString(),  // ❌ STRING, needs NUMBER
  priority: formData.priority,
  organizationId: user?.organization_id || customer.organizationId,
  status: 'open' as const            // ❌ Not in createCase signature!
};

// ❌ MISSING REQUIRED FIELD: productId!
```

### What createCase ACTUALLY expects:
```typescript
createCase({
  organizationId: number,    // ✅ Required
  customerId: number,        // ✅ Required
  productId: number,         // ❌ MISSING!!! Required!
  title?: string,
  description?: string,
  priority?: string,
  assignedTo?: number,       // ❌ Type mismatch (string vs number)
  loanType?: string,
  loanAmount?: number
})
```

### Impact:
- 🔴 **Case creation will FAIL** with database error
- 🔴 **Foreign key constraint** violation (no productId)
- 🔴 **Type mismatch** errors
- 🔴 **Customers can't create cases** from MyCustomers page

### Fix Required:
1. Add product selection dropdown
2. Convert IDs to numbers
3. Remove invalid fields (purpose, tenure, status)
4. Handle missing productId

---

## 🟡 MAJOR BUG #2: Missing CRUD Operations for Customers

**File:** `src/components/Salesperson/MyCustomers.tsx`
**Severity:** 🟡 **MAJOR** - Limited functionality

### Problem:
```typescript
// ❌ NO UPDATE functionality
// ❌ NO DELETE functionality
// ❌ NO VIEW DETAILS functionality
// ✅ Only READ operation exists
```

### Missing Features:
1. **Update Customer** - Can't edit customer details
2. **Delete Customer** - Can't remove customers
3. **View Details** - Can't see full customer info modal
4. **Assign/Unassign** - Can't reassign customers

### Methods exist in database service but NOT used:
- ✅ `updateCustomer()` exists - NOT USED
- ✅ `deleteCustomer()` exists - NOT USED  
- ✅ `updateCustomerKYC()` exists - NOT USED

### Impact:
- 🟡 Salespeople can only VIEW customers
- 🟡 Can't update customer information
- 🟡 Limited usability

---

## 🟡 MAJOR BUG #3: MyCustomers "View Cases" Button Broken

**File:** `src/components/Salesperson/MyCustomers.tsx`
**Line:** 315
**Severity:** 🟡 **MAJOR** - Navigation broken

### Problem:
```typescript
// ❌ WRONG - Passes customerId instead of caseId
<Button
  onClick={() => onNavigateToCase && onNavigateToCase(customer.id)}
>
  View Cases
</Button>

// ❌ onNavigateToCase expects caseId, not customerId!
// ❌ Should navigate to cases LIST filtered by customer, not a single case
```

### Fix Required:
- Change navigation to filter cases by customer
- Or change to navigate to `/cases?customerId={customer.id}`
- Or show cases count and navigate to filtered list

---

## 🟡 MAJOR BUG #4: Missing Product Selection in Case Creation

**Files:** Multiple
**Severity:** 🟡 **MAJOR** - Data integrity issue

### Problem:
- `cases.product_id` is **REQUIRED** in database
- No product selection in NewCaseFromCustomerModal
- No default product assignment
- Will cause INSERT failure

### Fix Required:
1. Add product dropdown to modal
2. Fetch products from `SupabaseDatabaseService.getProducts()`
3. Let user select appropriate loan product
4. Or auto-select based on loan type

---

## 🟢 MINOR BUG #5: Missing Validation in NewCaseFromCustomerModal

**File:** `src/components/Salesperson/NewCaseFromCustomerModal.tsx`
**Severity:** 🟢 **MINOR** - UX issue

### Problem:
```typescript
// ❌ Minimum amount not validated
// ❌ Maximum amount not checked
// ❌ Tenure not validated against product limits
// ❌ No format validation
```

### Fix Required:
- Add min/max amount validation
- Validate tenure against product
- Format validation for amounts
- Better error messages

---

## 🟢 MINOR BUG #6: Performance View Might Not Exist

**File:** `src/services/supabase-database.ts`
**Line:** 12541-12551
**Severity:** 🟢 **MINOR** - Fallback exists

### Problem:
```typescript
// If materialized view doesn't exist, falls back to calculation
// But calculation is SLOW for large datasets
// Should warn user to create view
```

### Fix Required:
- Check if view exists on app start
- Show warning if view missing
- Provide UI button to refresh view
- Or auto-create view via migration

---

## 🟢 MINOR BUG #7: No Update/Delete for Cases in MyCustomers Flow

**Severity:** 🟢 **MINOR** - Limited CRUD

### Problem:
- Can CREATE cases
- Can READ cases
- ❌ Can't UPDATE cases from customer view
- ❌ Can't DELETE cases from customer view

### Fix Required:
- Add "Edit Case" functionality
- Add "Delete Case" with confirmation
- Add status update dropdown

---

## 🔵 INFO #8: Documents Not Linked to Customers Properly

**File:** Database schema
**Severity:** 🔵 **INFO** - Design consideration

### Observation:
```sql
-- documents table has customer_id
-- But getSalespersonCustomers doesn't fetch document counts
-- Performance view doesn't aggregate customer documents
```

### Enhancement Needed:
- Add document count to customer cards
- Show pending documents per customer
- Link directly to customer documents

---

## 🔵 INFO #9: No Task CRUD in Salesperson Dashboard

**Severity:** 🔵 **INFO** - Feature gap

### Observation:
- Tasks are counted in performance view
- But no UI to CREATE/UPDATE/DELETE tasks
- Workload Planner exists but separate

### Enhancement Needed:
- Add task creation from dashboard
- Quick task management
- Task completion tracking

---

## 🔵 INFO #10: Missing Customer Case Count

**File:** `src/components/Salesperson/MyCustomers.tsx`
**Severity:** 🔵 **INFO** - UX improvement

### Observation:
- Customer cards don't show "3 active cases"
- No visual indicator of customer activity
- Clicking "View Cases" doesn't show count

### Enhancement Needed:
```typescript
// Fetch case count per customer
customers.map(customer => ({
  ...customer,
  activeCases: await getCaseCountByCustomer(customer.id)
}))
```

---

## 📊 CRUD OPERATIONS ANALYSIS

### Customers Table
| Operation | Method Exists | Used in UI | Status |
|-----------|---------------|------------|--------|
| CREATE | ✅ `createCustomer()` | ❌ No | ⚠️ Not needed (Salesforce import) |
| READ | ✅ `getSalespersonCustomers()` | ✅ Yes | ✅ WORKING |
| UPDATE | ✅ `updateCustomer()` | ❌ No | 🔴 **MISSING** |
| DELETE | ✅ `deleteCustomer()` | ❌ No | 🟡 **MISSING** |

### Cases Table
| Operation | Method Exists | Used in UI | Status |
|-----------|---------------|------------|--------|
| CREATE | ✅ `createCase()` | ⚠️ Broken | 🔴 **TYPE MISMATCH** |
| READ | ✅ `getCases()` | ✅ Yes | ✅ WORKING |
| UPDATE | ✅ `updateCase()` | ❌ No | 🟡 **MISSING** |
| DELETE | ✅ `deleteCase()` | ❌ No | 🟡 **MISSING** |

### Documents Table
| Operation | Method Exists | Used in UI | Status |
|-----------|---------------|------------|--------|
| CREATE | ✅ `uploadDocument()` | ✅ Yes | ✅ WORKING |
| READ | ✅ `getDocuments()` | ✅ Yes | ✅ WORKING |
| UPDATE | ✅ `updateDocument()` | ✅ Yes | ✅ WORKING |
| DELETE | ✅ `deleteDocument()` | ✅ Yes | ✅ WORKING |

### Tasks Table
| Operation | Method Exists | Used in UI | Status |
|-----------|---------------|------------|--------|
| CREATE | ✅ `createTask()` | ❌ No | 🟡 **MISSING** |
| READ | ✅ `getTasks()` | ✅ Yes | ✅ WORKING |
| UPDATE | ✅ `updateTask()` | ❌ No | 🟡 **MISSING** |
| DELETE | ✅ `deleteTask()` | ❌ No | 🟡 **MISSING** |

---

## 🔍 DATA FLOW TESTING

### Test 1: Customer Data Loading ✅
```
useSalespersonCustomers(salespersonId) 
  → getSalespersonCustomers()
  → SELECT * FROM customers WHERE user_id = salespersonId
  → Data mapping
  → Display in UI
```
**Result:** ✅ WORKING

### Test 2: Performance Data Loading ⚠️
```
useSalespersonPerformance(salespersonId)
  → getSalespersonPerformance()
  → SELECT * FROM salesperson_performance WHERE user_id = salespersonId
  → If view doesn't exist → calculateSalespersonPerformance()
  → Data mapping
  → Display in UI
```
**Result:** ⚠️ WORKS IF VIEW EXISTS, else slow fallback

### Test 3: Case Creation ❌
```
NewCaseFromCustomerModal Submit
  → createCase({
      customerId: customer.id,  // ❌ STRING (needs NUMBER)
      productId: ???            // ❌ MISSING!
      assignedTo: string        // ❌ STRING (needs NUMBER)
    })
  → ❌ DATABASE ERROR!
```
**Result:** 🔴 BROKEN - Will fail with type/constraint errors

### Test 4: Team Data Loading ✅
```
useSalespersonTeam(teamId)
  → getSalespersonTeamMembers()
  → SELECT * FROM users WHERE team_id = teamId
  → For each member → getSalespersonPerformance()
  → Data mapping
  → Display
```
**Result:** ✅ WORKING but SLOW (N+1 query problem)

### Test 5: Leaderboard Loading ✅
```
useTeamLeaderboard()
  → getTeamLeaderboard()
  → SELECT * FROM team_leaderboard
  → Data mapping
  → Display
```
**Result:** ✅ WORKING IF VIEW EXISTS

---

## 📋 CRITICAL FIXES NEEDED

### Priority 1: Fix Case Creation 🔴
- [ ] Add product selection
- [ ] Fix type conversions (string → number)
- [ ] Remove invalid fields
- [ ] Add proper validation

### Priority 2: Add Missing CRUD 🟡
- [ ] Add customer update functionality
- [ ] Add case update from customer view
- [ ] Add customer details modal
- [ ] Add case count per customer

### Priority 3: Performance Optimization 🟡
- [ ] Fix N+1 query in team members
- [ ] Ensure materialized view exists
- [ ] Add caching for leaderboard
- [ ] Optimize customer search

### Priority 4: UI/UX Improvements 🟢
- [ ] Add document count per customer
- [ ] Fix "View Cases" navigation
- [ ] Add customer detail modal
- [ ] Add task quick-create

---

## 🎯 TESTING MATRIX

| Feature | Data Loading | CRUD Complete | Real-time | Status |
|---------|--------------|---------------|-----------|--------|
| Dashboard Stats | ✅ | ➖ | ✅ | WORKING |
| Customer List | ✅ | 🔴 Incomplete | ✅ | PARTIAL |
| Case Creation | ❌ | 🔴 Broken | ✅ | **BROKEN** |
| Team View | ✅ | ➖ | ✅ | WORKING |
| Performance | ⚠️ | ➖ | ✅ | CONDITIONAL |
| Leaderboard | ⚠️ | ➖ | ✅ | CONDITIONAL |

---

## 🔧 IMMEDIATE ACTION REQUIRED

**MUST FIX BEFORE TESTING:**
1. 🔴 Fix NewCaseFromCustomerModal product selection
2. 🔴 Fix type conversions (string → number)
3. 🔴 Ensure materialized views exist

**SHOULD FIX FOR PRODUCTION:**
1. 🟡 Add customer CRUD operations
2. 🟡 Fix "View Cases" button
3. 🟡 Add case count per customer
4. 🟡 Optimize team member loading

---

This requires immediate attention!

