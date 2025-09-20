-- =============================================================================
-- COMPREHENSIVE MOCK DATA INSERTION SCRIPT - PART 2
-- =============================================================================
-- Continuation of the comprehensive data insertion script

-- =============================================================================
-- 14. CUSTOMERS
-- =============================================================================
INSERT INTO customers (id, full_name, dob, mobile, email, address, external_customer_code, kyc_status, organization_id, metadata) VALUES
(1, 'Ramesh Gupta', '1970-01-15', '+91-9876543210', 'ramesh.gupta@email.com', '123 Main Street, Mumbai, Maharashtra 400001', 'CUST001', 'verified', 1, '{"marital_status": "married", "employment": "self-employed", "monthly_income": 75000}'),
(2, 'Sunita Gupta', '1972-03-22', '+91-9876543211', 'sunita.gupta@email.com', '123 Main Street, Mumbai, Maharashtra 400001', 'CUST002', 'verified', 1, '{"marital_status": "married", "employment": "housewife", "monthly_income": 0}'),
(3, 'Arjun Kumar', '1985-07-10', '+91-9876543212', 'arjun.kumar@email.com', '456 Park Avenue, Delhi, Delhi 110001', 'CUST003', 'pending', 1, '{"marital_status": "single", "employment": "salaried", "monthly_income": 45000}'),
(4, 'Priya Sharma', '1990-12-05', '+91-9876543213', 'priya.sharma@email.com', '789 Garden Road, Bangalore, Karnataka 560001', 'CUST004', 'verified', 1, '{"marital_status": "married", "employment": "salaried", "monthly_income": 65000}'),
(5, 'Vikram Singh', '1988-09-18', '+91-9876543214', 'vikram.singh@email.com', '321 Lake View, Chennai, Tamil Nadu 600001', 'CUST005', 'verified', 1, '{"marital_status": "single", "employment": "self-employed", "monthly_income": 85000}'),
(6, 'Meera Patel', '1982-04-30', '+91-9876543215', 'meera.patel@email.com', '654 Hillside, Pune, Maharashtra 411001', 'CUST006', 'pending', 1, '{"marital_status": "married", "employment": "salaried", "monthly_income": 55000}'),
(7, 'Customer One', '1980-01-01', '+91-9876543216', 'customer1@email.com', '123 Test Street, Test City, Test State 123001', 'CUST007', 'verified', 2, '{"marital_status": "single", "employment": "salaried", "monthly_income": 40000}'),
(8, 'Customer Two', '1985-01-01', '+91-9876543217', 'customer2@email.com', '456 Test Avenue, Test City, Test State 123002', 'CUST008', 'verified', 3, '{"marital_status": "married", "employment": "self-employed", "monthly_income": 60000}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 15. FILES
-- =============================================================================
INSERT INTO files (id, filename, storage_path, file_type, size_bytes, checksum, organization_id, metadata) VALUES
(1, 'aadhaar_ramesh.pdf', '/documents/customers/1/aadhaar_card.pdf', 'pdf', 2048576, 'a1b2c3d4e5f6g7h8i9j0', 1, '{"uploaded_by": "customer", "document_type": "identity"}'),
(2, 'pan_ramesh.pdf', '/documents/customers/1/pan_card.pdf', 'pdf', 1536000, 'b2c3d4e5f6g7h8i9j0k1', 1, '{"uploaded_by": "customer", "document_type": "identity"}'),
(3, 'bank_statements_ramesh.pdf', '/documents/customers/1/bank_statements.pdf', 'pdf', 5242880, 'c3d4e5f6g7h8i9j0k1l2', 1, '{"uploaded_by": "customer", "document_type": "financial"}'),
(4, 'itr_ramesh.pdf', '/documents/customers/1/itr_documents.pdf', 'pdf', 3145728, 'd4e5f6g7h8i9j0k1l2m3', 1, '{"uploaded_by": "customer", "document_type": "financial"}'),
(5, 'property_docs_ramesh.pdf', '/documents/customers/1/property_documents.pdf', 'pdf', 8388608, 'e5f6g7h8i9j0k1l2m3n4', 1, '{"uploaded_by": "customer", "document_type": "property"}'),
(6, 'aadhaar_arjun.pdf', '/documents/customers/3/aadhaar_card.pdf', 'pdf', 1892341, 'f6g7h8i9j0k1l2m3n4o5', 1, '{"uploaded_by": "customer", "document_type": "identity"}'),
(7, 'pan_arjun.pdf', '/documents/customers/3/pan_card.pdf', 'pdf', 1423456, 'g7h8i9j0k1l2m3n4o5p6', 1, '{"uploaded_by": "customer", "document_type": "identity"}'),
(8, 'salary_cert_arjun.pdf', '/documents/customers/3/salary_certificate.pdf', 'pdf', 987654, 'h8i9j0k1l2m3n4o5p6q7', 1, '{"uploaded_by": "customer", "document_type": "employment"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 16. DOCUMENTS
-- =============================================================================
INSERT INTO documents (id, organization_id, customer_id, document_type_id, file_id, uploaded_by, status, submitted_at, review_started_at, review_completed_at, verified_by, verified_on, metadata) VALUES
(1, 1, 1, 1, 1, 1, 'verified', '2025-01-09T10:30:00Z', '2025-01-09T10:45:00Z', '2025-01-09T11:15:00Z', 2, '2025-01-09T11:15:00Z', '{"notes": "Aadhaar card verified successfully", "quality_score": 95}'),
(2, 1, 1, 2, 2, 1, 'verified', '2025-01-09T10:45:00Z', '2025-01-09T11:00:00Z', '2025-01-09T11:20:00Z', 2, '2025-01-09T11:20:00Z', '{"notes": "PAN card verified successfully", "quality_score": 98}'),
(3, 1, 1, 3, 3, 1, 'uploaded', '2025-01-09T11:00:00Z', NULL, NULL, NULL, NULL, '{"notes": "Bank statements uploaded, pending review"}'),
(4, 1, 1, 5, 4, 1, 'uploaded', '2025-01-09T14:30:00Z', NULL, NULL, NULL, NULL, '{"notes": "ITR documents uploaded"}'),
(5, 1, 1, 6, 5, 1, 'pending', NULL, NULL, NULL, NULL, NULL, '{"notes": "Property documents required"}'),
(6, 1, 1, 8, NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '{"notes": "Business registration required"}'),
(7, 1, 3, 1, 6, 3, 'uploaded', '2025-01-09T12:00:00Z', NULL, NULL, NULL, NULL, '{"notes": "Aadhaar card uploaded"}'),
(8, 1, 3, 2, 7, 3, 'uploaded', '2025-01-09T12:15:00Z', NULL, NULL, NULL, NULL, '{"notes": "PAN card uploaded"}'),
(9, 1, 3, 4, 8, 3, 'uploaded', '2025-01-09T12:30:00Z', NULL, NULL, NULL, NULL, '{"notes": "Salary certificate uploaded"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 17. CASES
-- =============================================================================
INSERT INTO cases (id, organization_id, case_number, customer_id, product_id, sub_product_id, title, description, status, priority, created_by, assigned_to, due_date, started_at, metadata) VALUES
(1, 1, 'HBI-HL-2025-001', 1, 1, 1, 'Home Loan Application - Ramesh Gupta', 'Home purchase in Mumbai for residential property', 'in_progress', 'high', 3, 2, '2025-01-20T18:00:00Z', '2025-01-09T09:00:00Z', '{"requested_amount": 5000000, "property_value": 6500000, "loan_to_value": 0.77, "processing_fee": 5000}'),
(2, 1, 'HBI-PL-2025-002', 3, 2, 3, 'Personal Loan Application - Arjun Kumar', 'Personal loan for home renovation', 'under_review', 'medium', 3, 6, '2025-01-25T18:00:00Z', '2025-01-09T11:00:00Z', '{"requested_amount": 500000, "purpose": "home_renovation", "processing_fee": 2000}'),
(3, 1, 'HBI-CL-2025-003', 4, 3, 5, 'Car Loan Application - Priya Sharma', 'New car purchase financing', 'document_collection', 'medium', 2, 2, '2025-01-22T18:00:00Z', '2025-01-09T14:00:00Z', '{"requested_amount": 800000, "vehicle_value": 1200000, "processing_fee": 3000}'),
(4, 1, 'HBI-BL-2025-004', 5, 4, 7, 'Business Loan Application - Vikram Singh', 'Working capital for business expansion', 'pending', 'high', 3, 4, '2025-01-30T18:00:00Z', '2025-01-09T16:00:00Z', '{"requested_amount": 2000000, "business_type": "manufacturing", "processing_fee": 10000}'),
(5, 1, 'HBI-EL-2025-005', 6, 5, 9, 'Education Loan Application - Meera Patel', 'Undergraduate education financing', 'document_collection', 'low', 2, 6, '2025-02-05T18:00:00Z', '2025-01-09T17:00:00Z', '{"requested_amount": 300000, "course": "engineering", "processing_fee": 1000}'),
(6, 2, 'TFC-HL-2025-001', 7, 6, 11, 'Home Loan Application - Customer One', 'Home purchase financing', 'pending', 'medium', 9, 10, '2025-01-28T18:00:00Z', '2025-01-09T18:00:00Z', '{"requested_amount": 2000000, "processing_fee": 4000}'),
(7, 3, 'SLI-PL-2025-001', 8, 9, 14, 'Personal Loan Application - Customer Two', 'Personal loan application', 'pending', 'medium', 11, 12, '2025-01-26T18:00:00Z', '2025-01-09T19:00:00Z', '{"requested_amount": 300000, "processing_fee": 2000}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 18. TASKS
-- =============================================================================
INSERT INTO tasks (id, case_id, task_type_id, sla_policy_id, title, description, status, priority, assigned_to, created_by, due_date, started_at, estimated_time, organization_id, metadata) VALUES
(1, 1, 1, 1, 'Collect Aadhaar Card', 'Collect Aadhaar card from Ramesh Gupta', 'completed', 'high', 2, 3, '2025-01-09T18:00:00Z', '2025-01-09T09:00:00Z', 30, 1, '{"completed_at": "2025-01-09T10:30:00Z", "actual_time": 25}'),
(2, 1, 1, 1, 'Collect PAN Card', 'Collect PAN card from Ramesh Gupta', 'completed', 'high', 2, 3, '2025-01-09T18:00:00Z', '2025-01-09T09:30:00Z', 30, 1, '{"completed_at": "2025-01-09T10:45:00Z", "actual_time": 30}'),
(3, 1, 2, 2, 'Verify Aadhaar Card', 'Verify authenticity of Aadhaar card', 'completed', 'high', 4, 2, '2025-01-11T18:00:00Z', '2025-01-09T10:45:00Z', 60, 1, '{"completed_at": "2025-01-09T11:15:00Z", "actual_time": 45}'),
(4, 1, 2, 2, 'Verify PAN Card', 'Verify authenticity of PAN card', 'completed', 'high', 4, 2, '2025-01-11T18:00:00Z', '2025-01-09T11:00:00Z', 60, 1, '{"completed_at": "2025-01-09T11:20:00Z", "actual_time": 50}'),
(5, 1, 2, 2, 'Verify Bank Statements', 'Verify bank statements for last 6 months', 'in_progress', 'medium', 4, 2, '2025-01-11T18:00:00Z', '2025-01-09T11:00:00Z', 120, 1, '{"progress": "50%"}'),
(6, 1, 1, 1, 'Collect Property Documents', 'Collect property documents for home loan', 'pending', 'high', 2, 3, '2025-01-12T18:00:00Z', NULL, 45, 1, '{"notes": "Customer to provide by tomorrow"}'),
(7, 2, 1, 1, 'Collect Documents', 'Collect all required documents for personal loan', 'in_progress', 'medium', 6, 3, '2025-01-12T18:00:00Z', '2025-01-09T11:30:00Z', 60, 1, '{"progress": "75%"}'),
(8, 3, 1, 1, 'Collect Documents', 'Collect documents for car loan', 'in_progress', 'medium', 2, 2, '2025-01-13T18:00:00Z', '2025-01-09T14:30:00Z', 45, 1, '{"progress": "25%"}'),
(9, 4, 1, 1, 'Collect Business Documents', 'Collect business registration and financial documents', 'pending', 'high', 4, 3, '2025-01-15T18:00:00Z', NULL, 90, 1, '{"notes": "Awaiting customer response"}'),
(10, 5, 1, 1, 'Collect Education Documents', 'Collect admission letter and fee structure', 'in_progress', 'low', 6, 2, '2025-01-16T18:00:00Z', '2025-01-09T17:30:00Z', 30, 1, '{"progress": "40%"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 19. CASE STATUS HISTORY
-- =============================================================================
INSERT INTO case_status_history (id, organization_id, case_id, old_status, new_status, changed_by, department_id, changed_at, remarks, metadata) VALUES
(1, 1, 1, NULL, 'open', 3, 1, '2025-01-09T09:00:00Z', 'Case created and assigned to sales team', '{"system_generated": true}'),
(2, 1, 1, 'open', 'in_progress', 2, 1, '2025-01-09T10:00:00Z', 'Case assigned to Priya Sharma for document collection', '{"assigned_to": 2}'),
(3, 1, 1, 'in_progress', 'in_progress', 2, 1, '2025-01-09T10:30:00Z', 'Aadhaar card collected and uploaded', '{"document_type": "aadhaar"}'),
(4, 1, 1, 'in_progress', 'in_progress', 2, 1, '2025-01-09T10:45:00Z', 'PAN card collected and uploaded', '{"document_type": "pan"}'),
(5, 1, 1, 'in_progress', 'in_progress', 4, 2, '2025-01-09T11:15:00Z', 'Aadhaar card verified successfully', '{"verification_status": "verified"}'),
(6, 1, 1, 'in_progress', 'in_progress', 4, 2, '2025-01-09T11:20:00Z', 'PAN card verified successfully', '{"verification_status": "verified"}'),
(7, 1, 2, NULL, 'open', 3, 1, '2025-01-09T11:00:00Z', 'Personal loan case created', '{"system_generated": true}'),
(8, 1, 2, 'open', 'under_review', 3, 1, '2025-01-09T11:15:00Z', 'Case assigned to Deepak Singh', '{"assigned_to": 6}'),
(9, 1, 3, NULL, 'open', 2, 1, '2025-01-09T14:00:00Z', 'Car loan case created', '{"system_generated": true}'),
(10, 1, 3, 'open', 'document_collection', 2, 1, '2025-01-09T14:15:00Z', 'Case assigned to Priya Sharma for document collection', '{"assigned_to": 2}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 20. CASE WORKFLOW STAGE
-- =============================================================================
INSERT INTO case_workflow_stage (id, organization_id, case_id, from_department_id, to_department_id, from_user_id, to_user_id, handover_reason, handover_at, accepted_at, status, remarks, metadata) VALUES
(1, 1, 1, NULL, 1, NULL, 3, 'Initial case assignment', '2025-01-09T09:00:00Z', '2025-01-09T09:15:00Z', 'completed', 'Case assigned to sales department', '{"stage": "sales"}'),
(2, 1, 1, 1, 1, 3, 2, 'Assign to specific salesperson', '2025-01-09T10:00:00Z', '2025-01-09T10:05:00Z', 'completed', 'Case assigned to Priya Sharma', '{"stage": "document_collection"}'),
(3, 1, 1, 1, 2, 2, 4, 'Documents ready for verification', '2025-01-09T11:00:00Z', '2025-01-09T11:05:00Z', 'in_progress', 'Handover to credit team for verification', '{"stage": "document_verification"}'),
(4, 1, 2, NULL, 1, NULL, 3, 'Initial case assignment', '2025-01-09T11:00:00Z', '2025-01-09T11:10:00Z', 'completed', 'Case assigned to sales department', '{"stage": "sales"}'),
(5, 1, 2, 1, 1, 3, 6, 'Assign to salesperson', '2025-01-09T11:15:00Z', '2025-01-09T11:20:00Z', 'in_progress', 'Case assigned to Deepak Singh', '{"stage": "document_collection"}'),
(6, 1, 3, NULL, 1, NULL, 2, 'Initial case assignment', '2025-01-09T14:00:00Z', '2025-01-09T14:10:00Z', 'completed', 'Case assigned to sales department', '{"stage": "sales"}'),
(7, 1, 3, 1, 1, 2, 2, 'Self assignment for document collection', '2025-01-09T14:15:00Z', '2025-01-09T14:20:00Z', 'in_progress', 'Case assigned to Priya Sharma', '{"stage": "document_collection"}')
ON CONFLICT (id) DO NOTHING;

-- Continue with more tables in the next part...
