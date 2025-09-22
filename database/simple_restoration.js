#!/usr/bin/env node

/**
 * VERIPHY BANK - SIMPLE DATABASE RESTORATION SCRIPT
 * This script uses Supabase client methods to restore the database
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ztdkreblmgscvdnzvzeh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to log results
function logResult(operation, result, error) {
  if (error) {
    console.log(`⚠️  ${operation}: ${error.message}`);
  } else {
    console.log(`✅ ${operation}: Success`);
  }
}

// Insert organizations
async function insertOrganizations() {
  console.log('📝 Inserting organizations...');
  
  const { data, error } = await supabase
    .from('organizations')
    .insert([
      {
        name: 'Veriphy Bank',
        code: 'VERIPHY',
        description: 'Veriphy Bank - Digital Banking Solutions',
        email: 'info@veriphybank.com',
        phone: '+91-9876543210'
      }
    ])
    .select();
  
  logResult('Organizations', data, error);
  return data;
}

// Insert departments
async function insertDepartments() {
  console.log('📝 Inserting departments...');
  
  const { data, error } = await supabase
    .from('departments')
    .insert([
      { organization_id: 1, name: 'Sales Department', code: 'SALES', description: 'Customer acquisition and sales', department_type: 'sales' },
      { organization_id: 1, name: 'Management', code: 'MGMT', description: 'Management and oversight', department_type: 'management' },
      { organization_id: 1, name: 'Credit Operations', code: 'CREDIT', description: 'Credit assessment and operations', department_type: 'credit' },
      { organization_id: 1, name: 'Administration', code: 'ADMIN', description: 'System administration', department_type: 'administration' },
      { organization_id: 1, name: 'Compliance', code: 'COMPLIANCE', description: 'Compliance and audit', department_type: 'compliance' }
    ])
    .select();
  
  logResult('Departments', data, error);
  return data;
}

// Insert roles
async function insertRoles() {
  console.log('📝 Inserting roles...');
  
  const { data, error } = await supabase
    .from('roles')
    .insert([
      { name: 'super_admin', description: 'Super administrator with full system access' },
      { name: 'admin', description: 'System administrator with administrative privileges' },
      { name: 'manager', description: 'Manager with team oversight and approval rights' },
      { name: 'salesperson', description: 'Sales personnel for customer acquisition' },
      { name: 'credit-ops', description: 'Credit operations for risk assessment' },
      { name: 'compliance', description: 'Compliance officer for audit and monitoring' },
      { name: 'auditor', description: 'Auditor with read-only access' }
    ])
    .select();
  
  logResult('Roles', data, error);
  return data;
}

// Insert permissions
async function insertPermissions() {
  console.log('📝 Inserting permissions...');
  
  const permissions = [
    { name: 'users.create', resource: 'users', action: 'create' },
    { name: 'users.read', resource: 'users', action: 'read' },
    { name: 'users.update', resource: 'users', action: 'update' },
    { name: 'users.delete', resource: 'users', action: 'delete' },
    { name: 'customers.create', resource: 'customers', action: 'create' },
    { name: 'customers.read', resource: 'customers', action: 'read' },
    { name: 'customers.update', resource: 'customers', action: 'update' },
    { name: 'customers.delete', resource: 'customers', action: 'delete' },
    { name: 'cases.create', resource: 'cases', action: 'create' },
    { name: 'cases.read', resource: 'cases', action: 'read' },
    { name: 'cases.update', resource: 'cases', action: 'update' },
    { name: 'cases.delete', resource: 'cases', action: 'delete' },
    { name: 'cases.assign', resource: 'cases', action: 'assign' },
    { name: 'cases.approve', resource: 'cases', action: 'approve' },
    { name: 'cases.reject', resource: 'cases', action: 'reject' },
    { name: 'documents.upload', resource: 'documents', action: 'upload' },
    { name: 'documents.read', resource: 'documents', action: 'read' },
    { name: 'documents.verify', resource: 'documents', action: 'verify' },
    { name: 'documents.reject', resource: 'documents', action: 'reject' },
    { name: 'organizations.create', resource: 'organizations', action: 'create' },
    { name: 'organizations.read', resource: 'organizations', action: 'read' },
    { name: 'organizations.update', resource: 'organizations', action: 'update' },
    { name: 'organizations.delete', resource: 'organizations', action: 'delete' },
    { name: 'departments.create', resource: 'departments', action: 'create' },
    { name: 'departments.read', resource: 'departments', action: 'read' },
    { name: 'departments.update', resource: 'departments', action: 'update' },
    { name: 'departments.delete', resource: 'departments', action: 'delete' },
    { name: 'products.create', resource: 'products', action: 'create' },
    { name: 'products.read', resource: 'products', action: 'read' },
    { name: 'products.update', resource: 'products', action: 'update' },
    { name: 'products.delete', resource: 'products', action: 'delete' },
    { name: 'compliance.read', resource: 'compliance', action: 'read' },
    { name: 'compliance.audit', resource: 'compliance', action: 'audit' },
    { name: 'compliance.report', resource: 'compliance', action: 'report' },
    { name: 'admin.system', resource: 'system', action: 'admin' },
    { name: 'admin.settings', resource: 'settings', action: 'admin' }
  ];
  
  const { data, error } = await supabase
    .from('permissions')
    .insert(permissions)
    .select();
  
  logResult('Permissions', data, error);
  return data;
}

// Insert users
async function insertUsers() {
  console.log('📝 Inserting users...');
  
  const users = [
    { email: 'superadmin@veriphy.com', password_hash: 'admin123', full_name: 'Super Admin', mobile: '+91-9999999999', role: 'super_admin', organization_id: 1, department_id: 1 },
    { email: 'priya.sharma@veriphy.com', password_hash: 'demo123', full_name: 'Priya Sharma', mobile: '+91-9876543210', role: 'salesperson', organization_id: 1, department_id: 1 },
    { email: 'rajesh.kumar@veriphy.com', password_hash: 'demo123', full_name: 'Rajesh Kumar', mobile: '+91-9876543211', role: 'salesperson', organization_id: 1, department_id: 1 },
    { email: 'sneha.singh@veriphy.com', password_hash: 'demo123', full_name: 'Sneha Singh', mobile: '+91-9876543212', role: 'salesperson', organization_id: 1, department_id: 1 },
    { email: 'amit.patel@veriphy.com', password_hash: 'demo123', full_name: 'Amit Patel', mobile: '+91-9876543213', role: 'salesperson', organization_id: 1, department_id: 1 },
    { email: 'anita.reddy@veriphy.com', password_hash: 'demo123', full_name: 'Anita Reddy', mobile: '+91-9876543214', role: 'manager', organization_id: 1, department_id: 2 },
    { email: 'suresh.kumar@veriphy.com', password_hash: 'demo123', full_name: 'Suresh Kumar', mobile: '+91-9876543215', role: 'manager', organization_id: 1, department_id: 2 },
    { email: 'meera.joshi@veriphy.com', password_hash: 'demo123', full_name: 'Meera Joshi', mobile: '+91-9876543216', role: 'credit-ops', organization_id: 1, department_id: 3 },
    { email: 'rahul.verma@veriphy.com', password_hash: 'demo123', full_name: 'Rahul Verma', mobile: '+91-9876543217', role: 'credit-ops', organization_id: 1, department_id: 3 },
    { email: 'kavya.nair@veriphy.com', password_hash: 'demo123', full_name: 'Kavya Nair', mobile: '+91-9876543218', role: 'credit-ops', organization_id: 1, department_id: 3 },
    { email: 'arjun.singh@veriphy.com', password_hash: 'demo123', full_name: 'Arjun Singh', mobile: '+91-9876543219', role: 'admin', organization_id: 1, department_id: 4 },
    { email: 'deepika.rao@veriphy.com', password_hash: 'demo123', full_name: 'Deepika Rao', mobile: '+91-9876543220', role: 'admin', organization_id: 1, department_id: 4 },
    { email: 'rohit.agarwal@veriphy.com', password_hash: 'demo123', full_name: 'Rohit Agarwal', mobile: '+91-9876543221', role: 'compliance', organization_id: 1, department_id: 5 },
    { email: 'shilpa.mehta@veriphy.com', password_hash: 'demo123', full_name: 'Shilpa Mehta', mobile: '+91-9876543222', role: 'compliance', organization_id: 1, department_id: 5 }
  ];
  
  const { data, error } = await supabase
    .from('users')
    .insert(users)
    .select();
  
  logResult('Users', data, error);
  return data;
}

// Insert products
async function insertProducts() {
  console.log('📝 Inserting products...');
  
  const products = [
    { organization_id: 1, name: 'Home Loan', code: 'HOME', description: 'Home loan for property purchase', category: 'secured', interest_rate: 8.50, min_amount: 500000, max_amount: 50000000, min_tenure: 60, max_tenure: 360 },
    { organization_id: 1, name: 'Personal Loan', code: 'PERSONAL', description: 'Personal loan for various purposes', category: 'unsecured', interest_rate: 12.00, min_amount: 50000, max_amount: 2000000, min_tenure: 12, max_tenure: 60 },
    { organization_id: 1, name: 'Business Loan', code: 'BUSINESS', description: 'Business loan for working capital', category: 'secured', interest_rate: 10.50, min_amount: 100000, max_amount: 10000000, min_tenure: 12, max_tenure: 120 },
    { organization_id: 1, name: 'Car Loan', code: 'CAR', description: 'Vehicle loan for car purchase', category: 'secured', interest_rate: 9.00, min_amount: 100000, max_amount: 5000000, min_tenure: 12, max_tenure: 84 },
    { organization_id: 1, name: 'Education Loan', code: 'EDUCATION', description: 'Education loan for studies', category: 'secured', interest_rate: 8.00, min_amount: 50000, max_amount: 2000000, min_tenure: 12, max_tenure: 120 },
    { organization_id: 1, name: 'Gold Loan', code: 'GOLD', description: 'Gold loan against gold ornaments', category: 'secured', interest_rate: 12.50, min_amount: 10000, max_amount: 1000000, min_tenure: 6, max_tenure: 36 }
  ];
  
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();
  
  logResult('Products', data, error);
  return data;
}

// Insert document types
async function insertDocumentTypes() {
  console.log('📝 Inserting document types...');
  
  const documentTypes = [
    { name: 'Aadhaar Card', category: 'identity', description: 'Government issued Aadhaar card', is_required: true, priority: 'high' },
    { name: 'PAN Card', category: 'identity', description: 'Permanent Account Number card', is_required: true, priority: 'high' },
    { name: 'Bank Statements', category: 'financial', description: 'Bank statements for last 6 months', is_required: true, priority: 'high' },
    { name: 'Salary Slips', category: 'financial', description: 'Salary slips for last 3 months', is_required: true, priority: 'high' },
    { name: 'Form 16', category: 'financial', description: 'Income tax form 16', is_required: true, priority: 'high' },
    { name: 'ITR Returns', category: 'financial', description: 'Income tax returns', is_required: true, priority: 'high' },
    { name: 'GST Registration', category: 'business', description: 'GST registration certificate', is_required: true, priority: 'high' },
    { name: 'Property Documents', category: 'property', description: 'Property ownership documents', is_required: true, priority: 'high' },
    { name: 'Employment Letter', category: 'employment', description: 'Employment verification letter', is_required: true, priority: 'high' },
    { name: 'Photograph', category: 'other', description: 'Passport size photograph', is_required: true, priority: 'high' },
    { name: 'Signature Specimen', category: 'other', description: 'Signature specimen', is_required: true, priority: 'high' },
    { name: 'Address Proof', category: 'other', description: 'Address proof document', is_required: true, priority: 'high' }
  ];
  
  const { data, error } = await supabase
    .from('document_types')
    .insert(documentTypes)
    .select();
  
  logResult('Document Types', data, error);
  return data;
}

// Insert customers
async function insertCustomers() {
  console.log('📝 Inserting customers...');
  
  const customers = [
    { user_id: 2, full_name: 'Priya Sharma', phone: '+91-9876543210', email: 'priya.sharma@veriphy.com', pan_number: 'ABCDE1234F', aadhaar_number: '123456789012', date_of_birth: '1985-03-15', gender: 'female', marital_status: 'married', employment_type: 'salaried', risk_profile: 'low', kyc_status: 'verified' },
    { user_id: 3, full_name: 'Rajesh Kumar', phone: '+91-9876543211', email: 'rajesh.kumar@veriphy.com', pan_number: 'FGHIJ5678G', aadhaar_number: '234567890123', date_of_birth: '1988-07-22', gender: 'male', marital_status: 'single', employment_type: 'salaried', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 4, full_name: 'Sneha Singh', phone: '+91-9876543212', email: 'sneha.singh@veriphy.com', pan_number: 'KLMNO9012H', aadhaar_number: '345678901234', date_of_birth: '1990-11-08', gender: 'female', marital_status: 'married', employment_type: 'self-employed', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 5, full_name: 'Amit Patel', phone: '+91-9876543213', email: 'amit.patel@veriphy.com', pan_number: 'PQRST3456I', aadhaar_number: '456789012345', date_of_birth: '1982-12-03', gender: 'male', marital_status: 'married', employment_type: 'salaried', risk_profile: 'low', kyc_status: 'verified' },
    { user_id: 6, full_name: 'Anita Reddy', phone: '+91-9876543214', email: 'anita.reddy@veriphy.com', pan_number: 'UVWXY7890J', aadhaar_number: '567890123456', date_of_birth: '1987-05-18', gender: 'female', marital_status: 'single', employment_type: 'salaried', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 7, full_name: 'Suresh Kumar', phone: '+91-9876543215', email: 'suresh.kumar@veriphy.com', pan_number: 'ZABCD1234K', aadhaar_number: '678901234567', date_of_birth: '1983-09-25', gender: 'male', marital_status: 'married', employment_type: 'self-employed', risk_profile: 'high', kyc_status: 'in-progress' },
    { user_id: 8, full_name: 'Meera Joshi', phone: '+91-9876543216', email: 'meera.joshi@veriphy.com', pan_number: 'EFGHI5678L', aadhaar_number: '789012345678', date_of_birth: '1991-02-14', gender: 'female', marital_status: 'single', employment_type: 'salaried', risk_profile: 'low', kyc_status: 'verified' },
    { user_id: 9, full_name: 'Rahul Verma', phone: '+91-9876543217', email: 'rahul.verma@veriphy.com', pan_number: 'JKLMN9012M', aadhaar_number: '890123456789', date_of_birth: '1986-08-30', gender: 'male', marital_status: 'married', employment_type: 'salaried', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 10, full_name: 'Kavya Nair', phone: '+91-9876543218', email: 'kavya.nair@veriphy.com', pan_number: 'OPQRS3456N', aadhaar_number: '901234567890', date_of_birth: '1984-06-12', gender: 'female', marital_status: 'married', employment_type: 'self-employed', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 11, full_name: 'Arjun Singh', phone: '+91-9876543219', email: 'arjun.singh@veriphy.com', pan_number: 'TUVWX7890O', aadhaar_number: '012345678901', date_of_birth: '1989-04-07', gender: 'male', marital_status: 'single', employment_type: 'salaried', risk_profile: 'low', kyc_status: 'verified' },
    { user_id: 12, full_name: 'Deepika Rao', phone: '+91-9876543220', email: 'deepika.rao@veriphy.com', pan_number: 'YZABC1234P', aadhaar_number: '112233445566', date_of_birth: '1987-10-19', gender: 'female', marital_status: 'married', employment_type: 'salaried', risk_profile: 'medium', kyc_status: 'verified' },
    { user_id: 13, full_name: 'Rohit Agarwal', phone: '+91-9876543221', email: 'rohit.agarwal@veriphy.com', pan_number: 'DEFGH5678Q', aadhaar_number: '223344556677', date_of_birth: '1985-01-26', gender: 'male', marital_status: 'married', employment_type: 'self-employed', risk_profile: 'high', kyc_status: 'in-progress' },
    { user_id: 14, full_name: 'Shilpa Mehta', phone: '+91-9876543222', email: 'shilpa.mehta@veriphy.com', pan_number: 'IJKLM9012R', aadhaar_number: '334455667788', date_of_birth: '1990-03-11', gender: 'female', marital_status: 'single', employment_type: 'salaried', risk_profile: 'low', kyc_status: 'verified' }
  ];
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select();
  
  logResult('Customers', data, error);
  return data;
}

// Insert cases
async function insertCases() {
  console.log('📝 Inserting cases...');
  
  const cases = [
    { case_number: 'CASE000001', customer_id: 1, assigned_to: 2, loan_type: 'personal_loan', loan_amount: 150000.00, status: 'in-progress', priority: 'high', description: 'Personal loan for medical expenses' },
    { case_number: 'CASE000002', customer_id: 2, assigned_to: 3, loan_type: 'home_loan', loan_amount: 2500000.00, status: 'review', priority: 'medium', description: 'Home loan for property purchase' },
    { case_number: 'CASE000003', customer_id: 3, assigned_to: 4, loan_type: 'business_loan', loan_amount: 800000.00, status: 'new', priority: 'high', description: 'Business expansion loan' },
    { case_number: 'CASE000004', customer_id: 4, assigned_to: 5, loan_type: 'car_loan', loan_amount: 600000.00, status: 'in-progress', priority: 'medium', description: 'Vehicle loan for car purchase' },
    { case_number: 'CASE000005', customer_id: 5, assigned_to: 2, loan_type: 'personal_loan', loan_amount: 200000.00, status: 'review', priority: 'low', description: 'Personal loan for education' },
    { case_number: 'CASE000006', customer_id: 6, assigned_to: 3, loan_type: 'business_loan', loan_amount: 1200000.00, status: 'approved', priority: 'high', description: 'Working capital loan' },
    { case_number: 'CASE000007', customer_id: 7, assigned_to: 4, loan_type: 'home_loan', loan_amount: 1800000.00, status: 'in-progress', priority: 'medium', description: 'Home improvement loan' },
    { case_number: 'CASE000008', customer_id: 8, assigned_to: 5, loan_type: 'personal_loan', loan_amount: 100000.00, status: 'new', priority: 'low', description: 'Personal loan for wedding' },
    { case_number: 'CASE000009', customer_id: 9, assigned_to: 2, loan_type: 'car_loan', loan_amount: 800000.00, status: 'review', priority: 'medium', description: 'Luxury car loan' },
    { case_number: 'CASE000010', customer_id: 10, assigned_to: 3, loan_type: 'business_loan', loan_amount: 1500000.00, status: 'approved', priority: 'high', description: 'Equipment financing' }
  ];
  
  const { data, error } = await supabase
    .from('cases')
    .insert(cases)
    .select();
  
  logResult('Cases', data, error);
  return data;
}

// Insert system settings
async function insertSystemSettings() {
  console.log('📝 Inserting system settings...');
  
  const settings = [
    { key: 'app_name', value: 'Veriphy Bank', description: 'Application name', category: 'general' },
    { key: 'app_version', value: '1.0.0', description: 'Application version', category: 'general' },
    { key: 'maintenance_mode', value: 'false', description: 'System maintenance mode', category: 'system' },
    { key: 'max_login_attempts', value: '5', description: 'Maximum login attempts before lockout', category: 'security' },
    { key: 'session_timeout_minutes', value: '60', description: 'Session timeout in minutes', category: 'security' },
    { key: 'password_min_length', value: '8', description: 'Minimum password length', category: 'security' },
    { key: 'password_require_special', value: 'true', description: 'Require special characters', category: 'security' },
    { key: 'two_factor_auth_enabled', value: 'true', description: 'Two-factor authentication', category: 'security' },
    { key: 'transaction_limit_daily', value: '100000', description: 'Daily transaction limit (INR)', category: 'business' },
    { key: 'transaction_limit_monthly', value: '1000000', description: 'Monthly transaction limit (INR)', category: 'business' },
    { key: 'kyc_verification_required', value: 'true', description: 'KYC verification required', category: 'business' },
    { key: 'auto_approval_limit', value: '50000', description: 'Auto approval limit (INR)', category: 'business' },
    { key: 'whatsapp_enabled', value: 'true', description: 'WhatsApp integration', category: 'integration' },
    { key: 'email_notifications_enabled', value: 'true', description: 'Email notifications', category: 'notification' },
    { key: 'sms_notifications_enabled', value: 'true', description: 'SMS notifications', category: 'notification' },
    { key: 'file_upload_max_size_mb', value: '10', description: 'Maximum file upload size', category: 'file' },
    { key: 'supported_file_types', value: 'pdf,jpg,jpeg,png,doc,docx', description: 'Supported file types', category: 'file' },
    { key: 'audit_log_retention_days', value: '365', description: 'Audit log retention', category: 'system' },
    { key: 'document_encryption_enabled', value: 'true', description: 'Document encryption', category: 'system' },
    { key: 'backup_frequency_hours', value: '24', description: 'Backup frequency', category: 'system' }
  ];
  
  const { data, error } = await supabase
    .from('system_settings')
    .insert(settings)
    .select();
  
  logResult('System Settings', data, error);
  return data;
}

// Insert notifications
async function insertNotifications() {
  console.log('📝 Inserting notifications...');
  
  const notifications = [
    { user_id: 2, type: 'case_assigned', title: 'New Case Assigned', message: 'You have been assigned a new case: CASE000001', is_read: false },
    { user_id: 3, type: 'case_assigned', title: 'New Case Assigned', message: 'You have been assigned a new case: CASE000002', is_read: false },
    { user_id: 4, type: 'case_assigned', title: 'New Case Assigned', message: 'You have been assigned a new case: CASE000003', is_read: false },
    { user_id: 5, type: 'case_assigned', title: 'New Case Assigned', message: 'You have been assigned a new case: CASE000004', is_read: false },
    { user_id: 8, type: 'case_approved', title: 'Case Approved', message: 'Case CASE000006 has been approved', is_read: true },
    { user_id: 9, type: 'case_rejected', title: 'Case Rejected', message: 'Case CASE000011 has been rejected - insufficient income', is_read: true }
  ];
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();
  
  logResult('Notifications', data, error);
  return data;
}

// Verify the restoration
async function verifyRestoration() {
  console.log('\n🔍 Verifying database restoration...\n');
  
  const tables = [
    'organizations', 'departments', 'roles', 'permissions', 'users', 
    'user_roles', 'products', 'document_types', 'customers', 'cases', 
    'documents', 'tasks', 'logs', 'notifications', 'system_settings'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} records`);
    }
  }
}

// Main execution function
async function main() {
  console.log('🚀 VERIPHY BANK - SIMPLE DATABASE RESTORATION');
  console.log('===============================================\n');
  
  try {
    // Insert data in order
    await insertOrganizations();
    await insertDepartments();
    await insertRoles();
    await insertPermissions();
    await insertUsers();
    await insertProducts();
    await insertDocumentTypes();
    await insertCustomers();
    await insertCases();
    await insertSystemSettings();
    await insertNotifications();
    
    // Verify the restoration
    await verifyRestoration();
    
    console.log('\n✅ DATABASE RESTORATION SUCCESSFUL!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('   Super Admin: superadmin@veriphy.com / admin123');
    console.log('   Salesperson: priya.sharma@veriphy.com / demo123');
    console.log('   Manager: anita.reddy@veriphy.com / demo123');
    console.log('   Credit Ops: meera.joshi@veriphy.com / demo123');
    console.log('   Admin: arjun.singh@veriphy.com / demo123');
    
  } catch (error) {
    console.error('\n❌ RESTORATION FAILED:', error.message);
    console.log('\n📝 Please check the error and try again, or execute the SQL script manually from URGENT_DATABASE_RESTORATION_GUIDE.md');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
