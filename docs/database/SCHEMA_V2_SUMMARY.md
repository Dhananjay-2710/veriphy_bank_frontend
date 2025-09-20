# Veriphy Bank SaaS Platform - Database Schema V2

## Overview
This is a **multi-tenant SaaS platform** designed for banks and financial institutions to manage their loan processing workflows. The system supports multiple organizations (tenants) with department-based access control, WhatsApp integration for document collection, and comprehensive workflow management.

## Key Features

### 🏢 **Multi-Tenant Architecture**
- **Organizations**: Each bank/financial institution is a separate tenant
- **Department-based Access**: Sales, Credit, Compliance, Operations teams
- **Tenant Isolation**: Complete data separation between organizations
- **Scalable**: Supports unlimited organizations and users

### 💼 **Loan Processing Workflow**
- **Application Management**: Complete loan application lifecycle
- **Document Collection**: WhatsApp-based document collection
- **Workflow Engine**: Configurable workflow stages and transitions
- **Team Collaboration**: Role-based access and notifications

### 📱 **WhatsApp Integration**
- **Document Collection**: Customers upload documents via WhatsApp
- **Automated Messaging**: Template-based communication
- **Conversation Tracking**: Complete message history
- **File Management**: Secure document storage and verification

### 🔒 **Security & Compliance**
- **Audit Trails**: Complete activity logging
- **Role-based Access**: Granular permissions
- **Data Encryption**: Sensitive data protection
- **Compliance Reporting**: Built-in reporting tools

## Database Schema

### 1. **Multi-Tenant Structure**

#### `organizations` (Tenants)
```sql
- id, uuid, name, slug, domain
- logo_url, description, address, contact_info
- settings (JSONB), status, subscription_plan
- trial_ends_at, subscription_ends_at
- max_users, max_loans_per_month, features (JSONB)
```

#### `departments` (Per Organization)
```sql
- id, organization_id, name, type
- description, settings (JSONB), is_active
- Types: sales, credit, compliance, admin, operations
```

### 2. **User Management**

#### `users` (Global Users)
```sql
- id, uuid, email, password_hash
- first_name, last_name, phone, avatar_url
- is_active, last_login_at
```

#### `organization_members` (Tenant Access)
```sql
- user_id, organization_id, department_id
- role, permissions (JSONB), is_active
- Roles: super_admin, org_admin, sales_manager, sales_agent, 
         credit_manager, credit_analyst, compliance_officer, auditor
```

### 3. **Customer Management**

#### `customers` (Per Organization)
```sql
- id, organization_id, customer_number (auto-generated)
- first_name, last_name, email, phone
- date_of_birth, gender, marital_status, employment_type
- monthly_income, address (JSONB), kyc_documents (JSONB)
- risk_profile, kyc_status
- assigned_sales_agent, assigned_credit_analyst
```

### 4. **Loan Management**

#### `loan_products` (Per Organization)
```sql
- id, organization_id, name, product_code
- min_amount, max_amount, interest_rate, tenure_months
- processing_fee, required_documents (JSONB)
- eligibility_criteria (JSONB), is_active
```

#### `loan_applications` (Core Entity)
```sql
- id, organization_id, application_number (auto-generated)
- customer_id, loan_product_id
- requested_amount, requested_tenure, purpose
- status, priority, current_stage
- assigned_sales_agent, assigned_credit_analyst
- workflow_data (JSONB)
- submitted_at, approved_at, rejected_at, disbursed_at
```

### 5. **Document Management**

#### `document_types` (Per Organization)
```sql
- id, organization_id, name, category
- is_required, priority, file_types (TEXT[])
- max_file_size, validity_days, is_active
```

#### `documents` (Document Storage)
```sql
- id, organization_id, loan_application_id
- document_type_id, file_name, file_path
- file_size, file_type, mime_type, status
- uploaded_at, verified_at, reviewed_at, reviewed_by
- rejection_reason, notes, metadata (JSONB)
```

### 6. **WhatsApp Integration**

#### `whatsapp_conversations`
```sql
- id, organization_id, loan_application_id
- customer_phone, whatsapp_id, status
- last_message_at
```

#### `whatsapp_messages`
```sql
- id, organization_id, conversation_id
- message_id, type, content, sender, direction
- document_id, metadata (JSONB), timestamp
```

#### `whatsapp_templates`
```sql
- id, organization_id, name, template_id
- category, language, content, variables (JSONB)
```

### 7. **Workflow Management**

#### `workflow_stages` (Per Organization)
```sql
- id, organization_id, name, stage_key
- description, department_type, order_index, is_active
```

#### `workflow_transitions` (Per Organization)
```sql
- id, organization_id, from_stage_id, to_stage_id
- name, conditions (JSONB), actions (JSONB), is_active
```

#### `workflow_history` (Audit Trail)
```sql
- id, organization_id, loan_application_id
- from_stage_id, to_stage_id, transition_id
- user_id, action, comments, metadata (JSONB)
```

### 8. **Communication & Notifications**

#### `notifications`
```sql
- id, organization_id, user_id, type, title, message
- data (JSONB), is_read, read_at
```

#### `communication_logs`
```sql
- id, organization_id, loan_application_id
- type, direction, recipient, subject, content
- status, sent_at, delivered_at, read_at, metadata (JSONB)
```

### 9. **SaaS Management**

#### `subscription_plans`
```sql
- id, name, plan_type, description
- price_monthly, price_yearly, max_users, max_loans_per_month
- features (JSONB), is_active
```

#### `billing`
```sql
- id, organization_id, subscription_plan_id
- amount, currency, billing_period_start, billing_period_end
- status, payment_method, payment_reference, paid_at
```

### 10. **Audit & Compliance**

#### `audit_logs` (Tenant-aware)
```sql
- id, organization_id, user_id, action
- resource_type, resource_id, old_values, new_values
- ip_address, user_agent, created_at
```

#### `compliance_reports`
```sql
- id, organization_id, report_type, report_name
- parameters (JSONB), status, file_path
- generated_by, generated_at
```

## Key Functions

### **Tenant Management**
- `get_current_organization_id()` - Get current tenant context
- `set_organization_context(org_id)` - Set tenant context
- `validate_organization_access(user_id, org_id)` - Validate access

### **Loan Processing**
- `create_loan_application()` - Create new loan application
- `move_loan_application_stage()` - Move through workflow stages
- `generate_application_number()` - Auto-generate application numbers

### **WhatsApp Integration**
- `create_whatsapp_conversation()` - Start WhatsApp conversation
- `send_whatsapp_message()` - Send WhatsApp message
- `request_documents_whatsapp()` - Request documents via WhatsApp
- `send_document_confirmation_whatsapp()` - Confirm document receipt

### **Document Management**
- `upload_document()` - Upload and process documents
- `send_document_confirmation_whatsapp()` - Notify document receipt

### **Notifications**
- `create_notification()` - Create user notification
- `notify_team_members()` - Notify entire department

### **Reporting**
- `get_loan_application_summary()` - Get application statistics
- `get_department_performance()` - Get team performance metrics

## Workflow Stages

### **Default Workflow**
1. **Draft** - Initial application creation
2. **Submitted** - Application submitted for review
3. **Under Review** - Initial review by credit team
4. **Document Collection** - Collecting required documents
5. **Credit Analysis** - Detailed credit analysis
6. **Approval Pending** - Waiting for final approval
7. **Approved** - Loan approved
8. **Disbursed** - Loan amount disbursed
9. **Rejected** - Loan rejected
10. **Closed** - Case closed

## Subscription Plans

### **Trial** (Free)
- 5 users, 10 loans/month
- Basic features
- 14-day trial

### **Basic** ($99/month)
- 25 users, 100 loans/month
- WhatsApp integration
- Basic reporting

### **Professional** ($299/month)
- 100 users, 500 loans/month
- Advanced workflow
- API access
- Priority support

### **Enterprise** ($999/month)
- 1000 users, 5000 loans/month
- White-label solution
- SSO integration
- Dedicated support

## Security Features

### **Multi-Tenant Security**
- Row-level security (RLS) for tenant isolation
- Organization context validation
- Cross-tenant access prevention

### **Data Protection**
- Encrypted sensitive data
- Secure file storage
- Audit trail for all operations

### **Access Control**
- Role-based permissions
- Department-based access
- Granular permission system

## Scalability Features

### **Performance**
- Optimized indexes for multi-tenant queries
- Partitioned tables for high-volume data
- Materialized views for reporting

### **Horizontal Scaling**
- Tenant-based data distribution
- Read replicas support
- Load balancing ready

### **Monitoring**
- Built-in performance metrics
- Tenant usage tracking
- System health monitoring

## File Structure
```
database/schema_v2/
├── 001_create_saas_schema.sql      # Main schema
├── 002_insert_saas_data.sql        # Initial data
├── 003_create_saas_functions.sql   # Functions & triggers
└── SCHEMA_V2_SUMMARY.md            # This documentation
```

## Usage Examples

### **Create New Organization**
```sql
INSERT INTO organizations (name, slug, domain, subscription_plan)
VALUES ('New Bank', 'new-bank', 'newbank.com', 'professional');
```

### **Create Loan Application**
```sql
SELECT create_loan_application(
    organization_id := 1,
    customer_id := 1,
    loan_product_id := 1,
    requested_amount := 500000,
    requested_tenure := 60,
    purpose := 'Home purchase',
    created_by := 1
);
```

### **Request Documents via WhatsApp**
```sql
SELECT request_documents_whatsapp(
    organization_id := 1,
    loan_application_id := 1,
    document_types := ARRAY['aadhaar_card', 'pan_card', 'bank_statements']
);
```

### **Move Application to Next Stage**
```sql
SELECT move_loan_application_stage(
    application_id := 1,
    to_stage_key := 'credit_analysis',
    user_id := 1,
    comments := 'All documents received, starting credit analysis'
);
```

This schema provides a robust, scalable foundation for a multi-tenant loan processing platform with comprehensive WhatsApp integration and workflow management capabilities.
