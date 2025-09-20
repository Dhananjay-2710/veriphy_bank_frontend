# Comprehensive Mock Data Insertion

This directory contains scripts to insert dummy data into ALL tables of the Veriphy Bank database schema.

## 📁 Files Created

### SQL Scripts
- `comprehensive_mock_data_insert.sql` - Part 1: Basic entities (organizations, users, roles, etc.)
- `comprehensive_mock_data_insert_part2.sql` - Part 2: Business entities (customers, cases, documents, etc.)
- `comprehensive_mock_data_insert_final.sql` - Part 3: System entities (logs, notifications, webhooks, etc.)
- `execute_comprehensive_data_insert.sql` - Combined executor script

### Execution Scripts
- `run_comprehensive_insert.ps1` - PowerShell script for Windows
- `run_comprehensive_insert.sh` - Bash script for Linux/Mac

## 🚀 How to Execute

### Option 1: Using PowerShell (Windows)
```powershell
.\run_comprehensive_insert.ps1
```

### Option 2: Using Bash (Linux/Mac)
```bash
./run_comprehensive_insert.sh
```

### Option 3: Manual SQL Execution
```sql
-- Execute in this order:
\i comprehensive_mock_data_insert.sql
\i comprehensive_mock_data_insert_part2.sql
\i comprehensive_mock_data_insert_final.sql
```

## 📊 Data Inserted

The scripts will insert dummy data into the following tables:

### Core Tables
- `organizations` (3 records)
- `departments` (8 records)
- `employment_types` (6 records)
- `roles` (10 records)
- `permissions` (15 records)
- `users` (12 records)

### Business Tables
- `customers` (8 records)
- `products` (9 records)
- `sub_products` (14 records)
- `cases` (7 records)
- `documents` (9 records)
- `tasks` (10 records)

### System Tables
- `notifications` (8 records)
- `logs` (10 records)
- `audit_log` (8 records)
- `auth_accounts` (7 records)
- `webhooks` (5 records)
- `sessions` (5 records)
- And many more...

## 🎯 Test Credentials

After running the scripts, you can log in with these test accounts:

| Email | Role | Password |
|-------|------|----------|
| superadmin@veriphy.com | Super Admin | password123 |
| priya.sharma@happybank.in | Salesperson | password123 |
| rajesh.kumar@happybank.in | Manager | password123 |
| anita.patel@happybank.in | Credit Analyst | password123 |
| suresh.krishnamurthy@happybank.in | Admin | password123 |

## 📋 Sample Data Overview

### Sample Case: HBI-HL-2025-001
- **Customer**: Ramesh Gupta
- **Product**: Home Loan (₹50,00,000)
- **Status**: In Progress
- **Documents**: Aadhaar (verified), PAN (verified), Bank Statements (uploaded)
- **Tasks**: Multiple document collection and verification tasks

### Organizations
1. **Happy Bank Ltd** - Primary organization with full data
2. **Trust Finance Corp** - Secondary organization
3. **Secure Loans Inc** - Tertiary organization

## ⚠️ Prerequisites

1. PostgreSQL database with the Veriphy Bank schema already created
2. Database connection credentials
3. psql client installed and accessible

## 🔍 Verification

After execution, the scripts will show:
- Record counts for all tables
- Sample queries to verify data integrity
- Test case data for validation

## 🛠️ Troubleshooting

If you encounter errors:
1. Ensure the database schema exists
2. Check database permissions
3. Verify psql client is installed
4. Check database connection parameters

## 📝 Notes

- All scripts use transactions (BEGIN/COMMIT)
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate errors
- Maintains referential integrity with proper foreign key relationships
- Includes realistic test data with proper relationships
