# Veriphy Bank Database Schema Summary

## Overview
The Veriphy Bank database is a comprehensive PostgreSQL schema designed for a fintech banking system that handles loan processing, KYC compliance, document management, and WhatsApp integration.

## Core Tables

### 1. User Management & Authentication

#### `users`
```sql
- id (BIGSERIAL PRIMARY KEY)
- email (VARCHAR(255) UNIQUE)
- password_hash (VARCHAR(255))
- first_name (VARCHAR(100))
- last_name (VARCHAR(100))
- phone (VARCHAR(20))
- is_active (BOOLEAN)
- last_login_at (TIMESTAMP WITH TIME ZONE)
- created_at, updated_at, deleted_at (TIMESTAMPS)
```

#### `roles`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(50) UNIQUE)
- description (TEXT)
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `permissions`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(100) UNIQUE)
- resource (VARCHAR(50))
- action (VARCHAR(50))
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `user_roles`
```sql
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT → users.id)
- role_id (BIGINT → roles.id)
- assigned_at (TIMESTAMP)
- assigned_by (BIGINT → users.id)
```

#### `user_sessions`
```sql
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT → users.id)
- session_token (VARCHAR(255) UNIQUE)
- ip_address (INET)
- user_agent (TEXT)
- expires_at (TIMESTAMP)
- created_at, last_accessed_at (TIMESTAMPS)
```

### 2. Customer Management

#### `customers`
```sql
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT → users.id) UNIQUE
- pan_number (VARCHAR(10) UNIQUE)
- aadhaar_number (VARCHAR(12) UNIQUE)
- date_of_birth (DATE)
- gender (ENUM: male, female, other, prefer-not-to-say)
- marital_status (ENUM: single, married, divorced, widowed)
- employment_type (ENUM: salaried, self-employed, retired, unemployed)
- risk_profile (ENUM: low, medium, high, urgent)
- kyc_status (ENUM: pending, in-progress, verified, rejected, expired)
- created_at, updated_at, deleted_at (TIMESTAMPS)
```

### 3. Account Management

#### `account_types`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(50) UNIQUE)
- description (TEXT)
- min_balance (DECIMAL(15,2))
- interest_rate (DECIMAL(5,4))
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `accounts`
```sql
- id (BIGSERIAL PRIMARY KEY)
- customer_id (BIGINT → customers.id)
- account_type_id (BIGINT → account_types.id)
- account_number (VARCHAR(20) UNIQUE) -- Auto-generated
- balance (DECIMAL(15,2))
- status (ENUM: active, frozen, closed, suspended)
- opened_at (TIMESTAMP)
- closed_at (TIMESTAMP)
- created_at, updated_at, deleted_at (TIMESTAMPS)
```

#### `balances`
```sql
- id (BIGSERIAL PRIMARY KEY)
- account_id (BIGINT → accounts.id) UNIQUE
- balance (DECIMAL(15,2))
- available_balance (DECIMAL(15,2))
- frozen_amount (DECIMAL(15,2))
- last_updated (TIMESTAMP)
- created_at, updated_at (TIMESTAMPS)
```

### 4. Transaction Management

#### `transaction_types`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(50) UNIQUE)
- category (VARCHAR(30))
- description (TEXT)
- is_debit (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `transactions` (Partitioned by month)
```sql
- id (BIGSERIAL PRIMARY KEY)
- account_id (BIGINT → accounts.id)
- transaction_type_id (BIGINT → transaction_types.id)
- amount (DECIMAL(15,2))
- reference_id (VARCHAR(100))
- status (ENUM: pending, completed, failed, reversed, cancelled)
- description (TEXT)
- created_at, updated_at, processed_at, deleted_at (TIMESTAMPS)
```

### 5. Case Management

#### `cases`
```sql
- id (BIGSERIAL PRIMARY KEY)
- case_number (VARCHAR(50) UNIQUE) -- Auto-generated
- customer_id (BIGINT → customers.id)
- assigned_to (BIGINT → users.id)
- loan_type (VARCHAR(100))
- loan_amount (DECIMAL(15,2))
- status (ENUM: new, in-progress, review, approved, rejected, on-hold)
- priority (ENUM: low, medium, high, urgent)
- created_at, updated_at, deleted_at (TIMESTAMPS)
```

### 6. Document Management

#### `document_types`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(100))
- category (VARCHAR(30))
- is_required (BOOLEAN)
- priority (ENUM: low, medium, high, urgent)
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `documents`
```sql
- id (BIGSERIAL PRIMARY KEY)
- case_id (BIGINT → cases.id)
- document_type_id (BIGINT → document_types.id)
- file_name (VARCHAR(255))
- file_path (VARCHAR(500))
- file_size (BIGINT)
- file_type (VARCHAR(50))
- status (ENUM: pending, received, verified, rejected, expired)
- uploaded_at (TIMESTAMP)
- verified_at (TIMESTAMP)
- reviewed_at (TIMESTAMP)
- reviewed_by (BIGINT → users.id)
- rejection_reason (TEXT)
- notes (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMPS)
```

#### `kyc_verifications`
```sql
- id (BIGSERIAL PRIMARY KEY)
- customer_id (BIGINT → customers.id)
- document_id (BIGINT → documents.id)
- status (ENUM: pending, received, verified, rejected, expired)
- verified_by (BIGINT → users.id)
- verified_at (TIMESTAMP)
- remarks (TEXT)
- created_at, updated_at (TIMESTAMPS)
```

### 7. Communication

#### `whatsapp_messages`
```sql
- id (BIGSERIAL PRIMARY KEY)
- case_id (BIGINT → cases.id)
- message_type (VARCHAR(20))
- content (TEXT)
- sender (VARCHAR(20))
- document_id (BIGINT → documents.id)
- timestamp (TIMESTAMP)
- created_at, updated_at (TIMESTAMPS)
```

### 8. Compliance & Audit

#### `compliance_logs` (Partitioned by month)
```sql
- id (BIGSERIAL PRIMARY KEY)
- case_id (BIGINT → cases.id)
- action (VARCHAR(100))
- user_id (BIGINT → users.id)
- details (TEXT)
- log_type (ENUM: info, warning, success, error, critical)
- created_at, updated_at (TIMESTAMPS)
```

#### `audit_logs` (Partitioned by month)
```sql
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT → users.id)
- action (VARCHAR(100))
- resource_type (VARCHAR(50))
- resource_id (BIGINT)
- old_values (JSONB)
- new_values (JSONB)
- ip_address (INET)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

### 9. Security & Monitoring

#### `security_alerts`
```sql
- id (BIGSERIAL PRIMARY KEY)
- customer_id (BIGINT → customers.id)
- alert_type (VARCHAR(50))
- severity (ENUM: low, medium, high, critical)
- description (TEXT)
- status (VARCHAR(20))
- created_at, updated_at, resolved_at (TIMESTAMPS)
```

#### `notifications`
```sql
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT → users.id)
- type (VARCHAR(50))
- title (VARCHAR(200))
- message (TEXT)
- is_read (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

### 10. System Configuration

#### `system_settings`
```sql
- id (BIGSERIAL PRIMARY KEY)
- key (VARCHAR(100) UNIQUE)
- value (TEXT)
- description (TEXT)
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

#### `loan_products`
```sql
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(100))
- description (TEXT)
- min_amount (DECIMAL(15,2))
- max_amount (DECIMAL(15,2))
- interest_rate (DECIMAL(5,4))
- tenure_months (INTEGER)
- created_at, updated_at (TIMESTAMPS)
- is_active (BOOLEAN)
```

## Key Features

### Security
- **Encryption**: All sensitive data encrypted at rest
- **Audit Trail**: Complete audit logging for all operations
- **Role-Based Access**: Granular permission system
- **Session Management**: Secure session handling
- **Soft Deletes**: Data retention compliance

### Performance
- **Partitioning**: High-volume tables partitioned by date
- **Indexing**: Comprehensive indexing strategy
- **Materialized Views**: Pre-computed aggregations
- **Connection Pooling**: Optimized connection management

### Scalability
- **Horizontal Scaling**: Partitioned tables support sharding
- **Vertical Scaling**: Optimized for high-performance hardware
- **Caching**: Materialized views for frequent queries
- **Monitoring**: Built-in performance monitoring

## Data Types Used

### Custom Enums
- `user_role`: salesperson, manager, credit-ops, admin, auditor
- `account_status`: active, frozen, closed, suspended
- `transaction_status`: pending, completed, failed, reversed, cancelled
- `document_status`: pending, received, verified, rejected, expired
- `case_status`: new, in-progress, review, approved, rejected, on-hold
- `priority_level`: low, medium, high, urgent
- `log_type`: info, warning, success, error, critical
- `alert_severity`: low, medium, high, critical
- `employment_type`: salaried, self-employed, retired, unemployed
- `marital_status`: single, married, divorced, widowed
- `gender_type`: male, female, other, prefer-not-to-say
- `kyc_status`: pending, in-progress, verified, rejected, expired

### Key Relationships
1. **Users** → **Customers** (1:1)
2. **Customers** → **Accounts** (1:many)
3. **Accounts** → **Transactions** (1:many)
4. **Customers** → **Cases** (1:many)
5. **Cases** → **Documents** (1:many)
6. **Users** → **Roles** (many:many via user_roles)
7. **Roles** → **Permissions** (many:many via role_permissions)

## File Structure
```
database/
├── migrations/
│   ├── 001_create_initial_schema.sql
│   ├── 002_insert_initial_data.sql
│   └── 003_create_functions_and_triggers.sql
├── optimizations/
│   ├── partitioning_strategy.sql
│   └── performance_tuning.sql
├── examples/
│   └── common_queries.sql
├── erd.md
├── README.md
├── SCHEMA_SUMMARY.md
└── setup.sh
```

This schema provides a robust foundation for a modern banking system with comprehensive security, audit capabilities, and performance optimizations.
