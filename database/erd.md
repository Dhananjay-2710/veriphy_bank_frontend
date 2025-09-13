# Veriphy Bank Database ERD

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │     roles       │    │  permissions    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ name            │
│ password_hash   │    │ description     │    │ resource        │
│ first_name      │    │ created_at      │    │ action          │
│ last_name       │    │ updated_at      │    │ created_at      │
│ phone           │    │ is_active       │    │ updated_at      │
│ is_active       │    └─────────────────┘    │ is_active       │
│ last_login_at   │           │               └─────────────────┘
│ created_at      │           │                        │
│ updated_at      │           │                        │
│ deleted_at      │           │                        │
└─────────────────┘           │                        │
         │                    │                        │
         │                    │                        │
         └────────────────────┼────────────────────────┘
                              │
                    ┌─────────────────┐
                    │ user_roles      │
                    ├─────────────────┤
                    │ user_id (FK)    │
                    │ role_id (FK)    │
                    │ assigned_at     │
                    │ assigned_by     │
                    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   customers     │    │   accounts      │    │ account_types   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ user_id (FK)    │    │ customer_id (FK)│    │ name            │
│ pan_number      │    │ account_type_id │    │ description     │
│ aadhaar_number  │    │ account_number  │    │ min_balance     │
│ date_of_birth   │    │ balance         │    │ interest_rate   │
│ gender          │    │ status          │    │ created_at      │
│ marital_status  │    │ opened_at       │    │ updated_at      │
│ employment_type │    │ closed_at       │    │ is_active       │
│ risk_profile    │    │ created_at      │    └─────────────────┘
│ kyc_status      │    │ updated_at      │             │
│ created_at      │    │ deleted_at      │             │
│ updated_at      │    └─────────────────┘             │
│ deleted_at      │             │                      │
└─────────────────┘             │                      │
         │                      │                      │
         │                      └──────────────────────┘
         │
         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     cases       │    │   documents     │    │ document_types  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ case_number     │    │ case_id (FK)    │    │ name            │
│ customer_id (FK)│    │ document_type_id│    │ category        │
│ assigned_to (FK)│    │ file_name       │    │ is_required     │
│ loan_type       │    │ file_path       │    │ priority        │
│ loan_amount     │    │ file_size       │    │ created_at      │
│ status          │    │ file_type       │    │ updated_at      │
│ priority        │    │ status          │    │ is_active       │
│ created_at      │    │ uploaded_at     │    └─────────────────┘
│ updated_at      │    │ verified_at     │             │
│ deleted_at      │    │ reviewed_at     │             │
└─────────────────┘    │ reviewed_by (FK)│             │
         │              │ rejection_reason│             │
         │              │ notes           │             │
         │              │ created_at      │             │
         │              │ updated_at      │             │
         │              │ deleted_at      │             │
         │              └─────────────────┘             │
         │                       │                      │
         │                       └──────────────────────┘
         │
         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  transactions   │    │ transaction_types│   │   balances      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ account_id (FK) │    │ name            │    │ account_id (FK) │
│ transaction_type│    │ category        │    │ balance         │
│ amount          │    │ description     │    │ available_balance│
│ reference_id    │    │ is_debit        │    │ frozen_amount   │
│ status          │    │ created_at      │    │ last_updated    │
│ description     │    │ updated_at      │    │ created_at      │
│ created_at      │    │ is_active       │    │ updated_at      │
│ updated_at      │    └─────────────────┘    └─────────────────┘
│ processed_at    │             │
│ deleted_at      │             │
└─────────────────┘             │
         │                      │
         │                      │
         └──────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ whatsapp_messages│   │ compliance_logs │    │ audit_logs      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ case_id (FK)    │    │ case_id (FK)    │    │ user_id (FK)    │
│ message_type    │    │ action          │    │ action          │
│ content         │    │ user_id (FK)    │    │ resource_type   │
│ sender          │    │ details         │    │ resource_id     │
│ document_id (FK)│    │ log_type        │    │ old_values      │
│ timestamp       │    │ created_at      │    │ new_values      │
│ created_at      │    │ updated_at      │    │ ip_address      │
│ updated_at      │    └─────────────────┘    │ user_agent      │
└─────────────────┘                          │ created_at      │
         │                                   └─────────────────┘
         │
         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  kyc_verifications│  │  loan_products  │    │  notifications  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ customer_id (FK)│    │ name            │    │ user_id (FK)    │
│ document_id (FK)│    │ description     │    │ type            │
│ status          │    │ min_amount      │    │ title           │
│ verified_by (FK)│    │ max_amount      │    │ message         │
│ verified_at     │    │ interest_rate   │    │ is_read         │
│ remarks         │    │ tenure_months   │    │ created_at      │
│ created_at      │    │ created_at      │    │ updated_at      │
│ updated_at      │    │ updated_at      │    └─────────────────┘
└─────────────────┘    │ is_active       │
         │              └─────────────────┘
         │
         │
┌─────────────────┐    ┌─────────────────┐
│  security_alerts│    │  system_settings│
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ customer_id (FK)│    │ key             │
│ alert_type      │    │ value           │
│ severity        │    │ description     │
│ description     │    │ created_at      │
│ status          │    │ updated_at      │
│ created_at      │    │ is_active       │
│ updated_at      │    └─────────────────┘
└─────────────────┘
```

## Key Relationships

1. **Users & Authentication**
   - `users` → `user_roles` → `roles`
   - `roles` → `role_permissions` → `permissions`

2. **Customer Management**
   - `users` → `customers` (1:1)
   - `customers` → `accounts` (1:many)
   - `customers` → `cases` (1:many)

3. **Account & Transaction Management**
   - `accounts` → `transactions` (1:many)
   - `accounts` → `balances` (1:1)
   - `transaction_types` → `transactions` (1:many)

4. **KYC & Compliance**
   - `customers` → `kyc_verifications` (1:many)
   - `cases` → `documents` (1:many)
   - `documents` → `kyc_verifications` (1:many)

5. **Communication & Audit**
   - `cases` → `whatsapp_messages` (1:many)
   - `cases` → `compliance_logs` (1:many)
   - `users` → `audit_logs` (1:many)

## Security Features

- All sensitive data encrypted at rest
- Audit trail for all operations
- Soft deletes for data retention
- Role-based access control
- Session management
- Security alerts system
