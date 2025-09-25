-- =============================================================================
-- WORKFLOW AND NOTIFICATION TABLES
-- =============================================================================
-- This migration creates tables for workflow management and notification system
-- =============================================================================

-- =============================================================================
-- 1. WORKFLOW INSTANCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_instances (
    id VARCHAR(50) PRIMARY KEY,
    workflow_id VARCHAR(50) NOT NULL,
    case_id VARCHAR(50) NOT NULL,
    current_step VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow instances
CREATE INDEX IF NOT EXISTS idx_workflow_instances_case_id ON workflow_instances(case_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow_id ON workflow_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_started_at ON workflow_instances(started_at);

-- =============================================================================
-- 2. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL DEFAULT 'user',
    case_id VARCHAR(50),
    data JSONB,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_case_id ON notifications(case_id);

-- =============================================================================
-- 3. WORKFLOW DEFINITIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow definitions
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_name ON workflow_definitions(name);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_is_active ON workflow_definitions(is_active);

-- =============================================================================
-- 4. NOTIFICATION TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    channels JSONB NOT NULL DEFAULT '["email", "in_app"]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notification templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- =============================================================================
-- 5. WORKFLOW EXECUTION LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id BIGSERIAL PRIMARY KEY,
    workflow_instance_id VARCHAR(50) NOT NULL,
    step_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    status VARCHAR(20) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_by VARCHAR(100),
    error_message TEXT,
    duration_ms INTEGER
);

-- Create indexes for workflow execution logs
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_instance_id ON workflow_execution_logs(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_step_id ON workflow_execution_logs(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_status ON workflow_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_executed_at ON workflow_execution_logs(executed_at);

-- =============================================================================
-- 6. NOTIFICATION DELIVERY LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notification delivery logs
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_channel ON notification_delivery_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status ON notification_delivery_logs(status);

-- =============================================================================
-- 7. INSERT DEFAULT WORKFLOW DEFINITIONS
-- =============================================================================
INSERT INTO workflow_definitions (id, name, description, steps) VALUES 
('loan_application', 'Loan Application Workflow', 'Standard loan application processing workflow', '[
  {
    "id": "application_received",
    "name": "Application Received",
    "type": "automatic",
    "actions": [
      {"type": "update_status", "parameters": {"status": "received"}},
      {"type": "send_notification", "parameters": {"type": "application_received", "to": "customer"}},
      {"type": "create_task", "parameters": {"title": "Initial Review", "assignedRole": "salesperson"}}
    ],
    "nextSteps": ["initial_review"]
  },
  {
    "id": "initial_review",
    "name": "Initial Review",
    "type": "manual",
    "assignedRole": "salesperson",
    "sla": 24,
    "actions": [
      {"type": "create_task", "parameters": {"title": "Review Application", "assignedRole": "salesperson"}}
    ],
    "nextSteps": ["document_collection", "reject_application"]
  },
  {
    "id": "document_collection",
    "name": "Document Collection",
    "type": "manual",
    "assignedRole": "salesperson",
    "sla": 48,
    "actions": [
      {"type": "update_status", "parameters": {"status": "document_collection"}},
      {"type": "send_notification", "parameters": {"type": "documents_required", "to": "customer"}}
    ],
    "nextSteps": ["document_verification", "reject_application"]
  },
  {
    "id": "document_verification",
    "name": "Document Verification",
    "type": "manual",
    "assignedRole": "salesperson",
    "sla": 24,
    "actions": [
      {"type": "update_status", "parameters": {"status": "document_verification"}}
    ],
    "nextSteps": ["credit_assessment", "reject_application"]
  },
  {
    "id": "credit_assessment",
    "name": "Credit Assessment",
    "type": "manual",
    "assignedRole": "credit-ops",
    "sla": 72,
    "actions": [
      {"type": "update_status", "parameters": {"status": "credit_assessment"}},
      {"type": "create_task", "parameters": {"title": "Credit Assessment", "assignedRole": "credit-ops"}}
    ],
    "nextSteps": ["compliance_review", "reject_application"]
  },
  {
    "id": "compliance_review",
    "name": "Compliance Review",
    "type": "manual",
    "assignedRole": "compliance",
    "sla": 48,
    "actions": [
      {"type": "update_status", "parameters": {"status": "compliance_review"}},
      {"type": "create_task", "parameters": {"title": "Compliance Review", "assignedRole": "compliance"}}
    ],
    "nextSteps": ["final_approval", "reject_application"]
  },
  {
    "id": "final_approval",
    "name": "Final Approval",
    "type": "manual",
    "assignedRole": "manager",
    "sla": 24,
    "actions": [
      {"type": "update_status", "parameters": {"status": "final_approval"}},
      {"type": "create_task", "parameters": {"title": "Final Approval", "assignedRole": "manager"}}
    ],
    "nextSteps": ["disbursement", "reject_application"]
  },
  {
    "id": "disbursement",
    "name": "Disbursement",
    "type": "manual",
    "assignedRole": "credit-ops",
    "sla": 24,
    "actions": [
      {"type": "update_status", "parameters": {"status": "approved"}},
      {"type": "send_notification", "parameters": {"type": "loan_approved", "to": "customer"}},
      {"type": "create_task", "parameters": {"title": "Process Disbursement", "assignedRole": "credit-ops"}}
    ],
    "nextSteps": ["completed"]
  },
  {
    "id": "reject_application",
    "name": "Reject Application",
    "type": "manual",
    "assignedRole": "manager",
    "actions": [
      {"type": "update_status", "parameters": {"status": "rejected"}},
      {"type": "send_notification", "parameters": {"type": "loan_rejected", "to": "customer"}}
    ],
    "nextSteps": ["completed"]
  },
  {
    "id": "completed",
    "name": "Completed",
    "type": "automatic",
    "actions": [
      {"type": "update_status", "parameters": {"status": "completed"}}
    ]
  }
]')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. INSERT DEFAULT NOTIFICATION TEMPLATES
-- =============================================================================
INSERT INTO notification_templates (type, title, message, priority, channels) VALUES 
('application_received', 'Loan Application Received', 'Your loan application #{caseNumber} has been received and is under review. We will contact you within 24 hours.', 'medium', '["email", "sms", "in_app"]'),
('documents_required', 'Additional Documents Required', 'Please upload the following documents for your loan application #{caseNumber}: {requiredDocuments}', 'high', '["email", "sms", "in_app"]'),
('loan_approved', 'Congratulations! Loan Approved', 'Your loan application #{caseNumber} has been approved for ₹{loanAmount}. Disbursement will be processed within 2-3 business days.', 'high', '["email", "sms", "in_app"]'),
('loan_rejected', 'Loan Application Update', 'We regret to inform you that your loan application #{caseNumber} could not be approved at this time. Please contact us for more information.', 'medium', '["email", "sms", "in_app"]'),
('sla_violation', 'SLA Violation Alert', 'Case #{caseNumber} has exceeded SLA for {stepName}. Please take immediate action.', 'urgent', '["email", "in_app"]'),
('case_assigned', 'New Case Assigned', 'A new case #{caseNumber} has been assigned to you for {customerName}.', 'medium', '["email", "in_app"]'),
('case_updated', 'Case Status Updated', 'Case #{caseNumber} status has been updated to {newStatus}.', 'low', '["in_app"]'),
('document_uploaded', 'Document Uploaded', 'New document uploaded for case #{caseNumber}. Please review.', 'medium', '["in_app"]'),
('compliance_issue', 'Compliance Issue Detected', 'A compliance issue has been detected in case #{caseNumber}. Immediate attention required.', 'urgent', '["email", "in_app"]'),
('task_assigned', 'New Task Assigned', 'A new task "{taskTitle}" has been assigned to you.', 'medium', '["email", "in_app"]'),
('task_overdue', 'Task Overdue', 'Task "{taskTitle}" is overdue. Please complete it as soon as possible.', 'high', '["email", "in_app"]'),
('approval_required', 'Approval Required', 'Your approval is required for case #{caseNumber}.', 'high', '["email", "in_app"]'),
('escalation', 'Case Escalated', 'Case #{caseNumber} has been escalated to you for review.', 'urgent', '["email", "in_app"]'),
('reminder', 'Reminder', '{message}', 'low', '["email", "in_app"]')
ON CONFLICT (type) DO NOTHING;

-- =============================================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workflow_instances_updated_at 
    BEFORE UPDATE ON workflow_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_definitions_updated_at 
    BEFORE UPDATE ON workflow_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. VERIFICATION
-- =============================================================================

-- Show what was created
SELECT 'Workflow and notification tables created successfully!' as status;

-- Check table counts
SELECT 'Table counts:' as info;
SELECT 'workflow_instances' as table_name, COUNT(*) as count FROM workflow_instances
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'workflow_definitions', COUNT(*) FROM workflow_definitions
UNION ALL
SELECT 'notification_templates', COUNT(*) FROM notification_templates
UNION ALL
SELECT 'workflow_execution_logs', COUNT(*) FROM workflow_execution_logs
UNION ALL
SELECT 'notification_delivery_logs', COUNT(*) FROM notification_delivery_logs;

-- Show workflow definitions
SELECT 'Workflow definitions:' as info;
SELECT id, name, description FROM workflow_definitions;

-- Show notification templates
SELECT 'Notification templates:' as info;
SELECT type, title, priority FROM notification_templates ORDER BY type;

-- =============================================================================
-- END OF WORKFLOW AND NOTIFICATION TABLES CREATION
-- =============================================================================
