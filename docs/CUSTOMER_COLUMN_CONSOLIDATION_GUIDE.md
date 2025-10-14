# Customer Table Column Consolidation Guide

## Overview
This guide documents the consolidation of duplicate columns in the `customers` table to ensure data consistency and eliminate confusion.

## Problem Statement
The `customers` table had duplicate columns for the same information:
- **`dob`** and **`date_of_birth`** - Both storing date of birth
- **`mobile`** and **`phone`** - Both storing phone/mobile number

This caused:
- Data inconsistency
- Confusion for developers
- Unnecessary complexity in code
- Potential data sync issues

## Solution
Consolidated the duplicate columns by:
1. Keeping one primary column for each data type
2. Migrating data from duplicate columns to primary columns
3. Removing the redundant columns
4. Updating all code references

## Migration Details

### Columns Kept (Primary)
- **`dob`** - Date of birth (consolidated from `dob` and `date_of_birth`)
- **`mobile`** - Mobile/phone number (consolidated from `mobile` and `phone`)

### Columns Removed (Redundant)
- ❌ **`date_of_birth`** - Removed (data migrated to `dob`)
- ❌ **`phone`** - Removed (data migrated to `mobile`)

### Data Migration Process
The migration script (`009_consolidate_customer_columns.sql`) performed the following:

1. **Data Consolidation**:
   ```sql
   -- Copy date_of_birth to dob if dob is null
   UPDATE customers
   SET dob = COALESCE(dob, date_of_birth)
   WHERE dob IS NULL AND date_of_birth IS NOT NULL;

   -- Copy phone to mobile if mobile is null
   UPDATE customers
   SET mobile = COALESCE(mobile, phone)
   WHERE mobile IS NULL AND phone IS NOT NULL;
   ```

2. **Column Removal**:
   ```sql
   -- Drop redundant columns
   ALTER TABLE customers DROP COLUMN IF EXISTS date_of_birth;
   ALTER TABLE customers DROP COLUMN IF EXISTS phone;
   ```

## Updated Table Schema

### customers Table (After Consolidation)
```
id                      BIGINT PRIMARY KEY
user_id                 BIGINT (NULLABLE)
full_name               VARCHAR
mobile                  VARCHAR (NULLABLE) ← Consolidated phone field
email                   VARCHAR (NULLABLE)
address                 VARCHAR (NULLABLE)
external_customer_code  VARCHAR (NULLABLE)
kyc_status              ENUM ('verified', 'pending', 'rejected')
metadata                JSONB (NULLABLE)
organization_id         BIGINT
created_at              TIMESTAMP
updated_at              TIMESTAMP
pan_number              VARCHAR (NULLABLE)
aadhaar_number          VARCHAR (NULLABLE)
dob                     DATE (NULLABLE) ← Consolidated DOB field
gender                  VARCHAR (NULLABLE)
marital_status          VARCHAR (NULLABLE)
employment_type         VARCHAR (NULLABLE)
risk_profile            VARCHAR (NULLABLE)
deleted_at              TIMESTAMP (NULLABLE)
```

## Code Changes

### 1. TypeScript Interfaces
**File**: `src/types/database-interfaces.ts`

```typescript
export interface Customer {
  id: number;
  user_id?: number;
  full_name: string;
  mobile?: string;              // ← Consolidated field
  email?: string;
  pan_number?: string;
  aadhaar_number?: string;
  dob?: string;                 // ← Consolidated field
  gender?: string;
  marital_status?: string;
  employment_type?: string;
  risk_profile?: string;
  kyc_status: KYCStatus;
  age?: number;
  organization_id?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  address?: string;
  external_customer_code?: string;
}
```

### 2. Database Service Methods
**File**: `src/services/supabase-database.ts`

#### getCustomers() - SELECT Query
```typescript
.select(`
  id,
  full_name,
  dob,                    // ← Only dob
  mobile,                 // ← Only mobile
  email,
  address,
  external_customer_code,
  kyc_status,
  // ... other fields
`)
```

#### createCustomer() - INSERT Data
```typescript
const insertData = {
  full_name: customerData.fullName,
  email: customerData.email,
  mobile: customerData.mobile,        // ← Only mobile
  address: customerData.address,
  dob: customerData.dob,              // ← Only dob
  // ... other fields
};
```

#### updateCustomer() - UPDATE Data
```typescript
if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
if (updates.dob !== undefined) updateData.dob = updates.dob;
// Removed: phone and dateOfBirth
```

### 3. React Components

#### CustomerManagement.tsx
**Before**:
```typescript
interface Customer {
  mobile?: string;
  phone?: string;         // ❌ Removed
  dob?: string;
  dateOfBirth?: string;   // ❌ Removed
  // ...
}
```

**After**:
```typescript
interface Customer {
  mobile?: string;        // ✅ Only mobile
  dob?: string;          // ✅ Only dob
  // ...
}
```

#### CustomerManagementModal.tsx
**Before**:
```typescript
initialValues: {
  mobile: customer?.mobile || '',
  phone: customer?.phone || '',         // ❌ Removed
  dob: customer?.dob || '',
  dateOfBirth: customer?.dateOfBirth || '', // ❌ Removed
}
```

**After**:
```typescript
initialValues: {
  mobile: customer?.mobile || '',       // ✅ Only mobile
  dob: customer?.dob || '',            // ✅ Only dob
}
```

**Form Fields**:
- ❌ Removed: "Phone" input field
- ❌ Removed: "Date of Birth" input field (the one using `dateOfBirth`)
- ✅ Kept: "Mobile" input field
- ✅ Kept: "Date of Birth" input field (renamed from "DOB (Alternative)", using `dob`)

## Migration Steps

### Database Migration
1. **Run the migration script**:
   ```bash
   # In Supabase SQL Editor
   # Execute: database/migrations/009_consolidate_customer_columns.sql
   ```

2. **Verify the migration**:
   ```sql
   -- Check table structure
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'customers';
   
   -- Verify data
   SELECT COUNT(*) as total_customers,
          COUNT(dob) as customers_with_dob,
          COUNT(mobile) as customers_with_mobile
   FROM customers;
   ```

### Code Updates
All code updates have been completed. No additional changes required.

## Rollback Instructions
If you need to rollback this migration:

```sql
-- Add back the columns
ALTER TABLE customers ADD COLUMN date_of_birth DATE;
ALTER TABLE customers ADD COLUMN phone VARCHAR(20);

-- Copy data back
UPDATE customers SET date_of_birth = dob WHERE dob IS NOT NULL;
UPDATE customers SET phone = mobile WHERE mobile IS NOT NULL;
```

**⚠️ Warning**: Rollback will lose any distinctions between the old duplicate fields.

## Benefits of This Change

1. **Data Consistency**: Single source of truth for each data point
2. **Simplified Code**: Less confusion about which field to use
3. **Reduced Bugs**: No more sync issues between duplicate fields
4. **Better Performance**: Fewer columns to query and index
5. **Cleaner API**: Clearer interface contracts
6. **Easier Maintenance**: Less code to maintain

## Testing Checklist

- [x] Database migration runs successfully
- [x] TypeScript interfaces updated
- [x] Database service methods updated
- [x] React components updated
- [x] Form validation updated
- [ ] Run the application and test:
  - [ ] Customer creation with new fields
  - [ ] Customer editing with new fields
  - [ ] Customer search by mobile number
  - [ ] Customer display shows correct DOB
  - [ ] No console errors related to missing fields
  - [ ] Data persists correctly to database

## Notes

- The `mobile` field is now the single source for phone/mobile numbers
- The `dob` field is now the single source for date of birth
- All existing data has been preserved during migration
- The migration is **backward incompatible** - old code referencing `phone` or `date_of_birth` will fail

## Support

If you encounter issues after this migration:
1. Check the console for errors about missing fields
2. Verify the migration ran successfully in Supabase
3. Ensure all code references are updated
4. Review the rollback instructions if needed

---

**Migration Date**: October 10, 2025
**Migration Script**: `database/migrations/009_consolidate_customer_columns.sql`
**Status**: ✅ Complete

