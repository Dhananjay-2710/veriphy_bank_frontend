# Migration 009: Customer Column Consolidation

## Quick Start

### 1. Run the Migration in Supabase

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `009_consolidate_customer_columns.sql`
5. Click **Run** or press `Ctrl+Enter`

### 2. Verify the Migration

After running the migration, you should see output like:
```
==============================================
Customer Column Consolidation Complete!
==============================================
Total customers: 5
Customers with DOB: 3
Customers with mobile: 5
==============================================
Columns removed: date_of_birth, phone
Columns kept: dob, mobile
==============================================
```

### 3. Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to Customer Management
3. Test the following:
   - ✅ View existing customers
   - ✅ Create a new customer
   - ✅ Edit an existing customer
   - ✅ Search by mobile number
   - ✅ Verify DOB displays correctly

## What Changed?

### Database Changes
- **Removed**: `date_of_birth` column (data migrated to `dob`)
- **Removed**: `phone` column (data migrated to `mobile`)
- **Kept**: `dob` and `mobile` as the single source of truth

### Code Changes
- Updated TypeScript interfaces
- Updated database service methods
- Updated React components
- Updated form validation
- Removed duplicate form fields

## Before vs After

### Before (Confusing!)
```typescript
{
  id: 1,
  full_name: "Test",
  dob: "2005-01-01",           // ❓ Which one to use?
  date_of_birth: null,         // ❓ Same thing?
  mobile: "9999988888",        // ❓ Which one to use?
  phone: null                  // ❓ Same thing?
}
```

### After (Clear!)
```typescript
{
  id: 1,
  full_name: "Test",
  dob: "2005-01-01",           // ✅ Clear!
  mobile: "9999988888"         // ✅ Clear!
}
```

## Rollback (If Needed)

If something goes wrong, you can rollback by running:

```sql
-- Add back the columns
ALTER TABLE customers ADD COLUMN date_of_birth DATE;
ALTER TABLE customers ADD COLUMN phone VARCHAR(20);

-- Copy data back
UPDATE customers SET date_of_birth = dob WHERE dob IS NOT NULL;
UPDATE customers SET phone = mobile WHERE mobile IS NOT NULL;
```

⚠️ **Warning**: This will restore the columns but won't restore any original distinctions between them.

## Support

If you encounter any issues:
1. Check the Supabase logs for migration errors
2. Review the console for JavaScript errors
3. Verify all files were updated correctly
4. See the full documentation: `docs/CUSTOMER_COLUMN_CONSOLIDATION_GUIDE.md`

---

**Migration Author**: AI Assistant  
**Migration Date**: October 10, 2025  
**Status**: Ready to Deploy

