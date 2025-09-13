-- Veriphy Bank SaaS Platform
-- Additional components that were missing from the initial schema

-- =============================================================================
-- 1. TASK MANAGEMENT SYSTEM
-- =============================================================================

-- Task categories
CREATE TABLE task_categories (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Tasks
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES task_categories(id),
    priority priority_level DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, on_hold
    assigned_to BIGINT REFERENCES users(id),
    created_by BIGINT NOT NULL REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Task dependencies
CREATE TABLE task_dependencies (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id)
);

-- Task comments
CREATE TABLE task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task attachments
CREATE TABLE task_attachments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. WORKLOAD PLANNING
-- =============================================================================

-- Workload schedules
CREATE TABLE workload_schedules (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    planned_hours DECIMAL(4,2) DEFAULT 8.0,
    actual_hours DECIMAL(4,2) DEFAULT 0.0,
    capacity_percentage INTEGER DEFAULT 100,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id, date)
);

-- Workload assignments
CREATE TABLE workload_assignments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    loan_application_id BIGINT REFERENCES loan_applications(id) ON DELETE CASCADE,
    assigned_hours DECIMAL(4,2),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. APPROVAL QUEUE SYSTEM
-- =============================================================================

-- Approval queues
CREATE TABLE approval_queues (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    queue_type VARCHAR(50) NOT NULL, -- loan_approval, document_verification, compliance_review
    department_type department_type NOT NULL,
    priority priority_level DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    auto_assign BOOLEAN DEFAULT false,
    max_concurrent_items INTEGER DEFAULT 10,
    sla_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Approval queue items
CREATE TABLE approval_queue_items (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    queue_id BIGINT NOT NULL REFERENCES approval_queues(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- loan_application, document, compliance_issue
    item_id BIGINT NOT NULL,
    priority priority_level DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_review, approved, rejected, escalated
    assigned_to BIGINT REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    decision VARCHAR(20), -- approved, rejected, escalated, returned
    decision_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval queue assignments
CREATE TABLE approval_queue_assignments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    queue_id BIGINT NOT NULL REFERENCES approval_queues(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    max_items INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(queue_id, user_id)
);

-- =============================================================================
-- 4. COMPLIANCE ISSUES TRACKING
-- =============================================================================

-- Compliance issue types
CREATE TABLE compliance_issue_types (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- document_mismatch, kyc_verification, credit_score, aml_screening
    severity priority_level NOT NULL,
    auto_detect BOOLEAN DEFAULT false,
    detection_rules JSONB DEFAULT '{}',
    resolution_guidelines TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Compliance issues
CREATE TABLE compliance_issues (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    issue_number VARCHAR(50) NOT NULL,
    issue_type_id BIGINT NOT NULL REFERENCES compliance_issue_types(id),
    loan_application_id BIGINT REFERENCES loan_applications(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity priority_level NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed, escalated
    assigned_to BIGINT REFERENCES users(id),
    flagged_by BIGINT REFERENCES users(id),
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, issue_number)
);

-- Compliance issue comments
CREATE TABLE compliance_issue_comments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES compliance_issues(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. ANALYTICS & REPORTING
-- =============================================================================

-- Report templates
CREATE TABLE report_templates (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- compliance, performance, financial, operational
    template_config JSONB NOT NULL,
    parameters JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Scheduled reports
CREATE TABLE scheduled_reports (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    schedule_config JSONB NOT NULL,
    recipients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report executions
CREATE TABLE report_executions (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES report_templates(id),
    scheduled_report_id BIGINT REFERENCES scheduled_reports(id),
    status VARCHAR(20) NOT NULL, -- pending, running, completed, failed
    parameters JSONB DEFAULT '{}',
    file_path VARCHAR(500),
    file_size BIGINT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_by BIGINT REFERENCES users(id)
);

-- =============================================================================
-- 6. ENHANCED USER MANAGEMENT
-- =============================================================================

-- User profiles
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    department_id BIGINT REFERENCES departments(id),
    position VARCHAR(100),
    manager_id BIGINT REFERENCES users(id),
    hire_date DATE,
    skills TEXT[],
    certifications JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- User activity logs
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. SYSTEM CONFIGURATION ENHANCEMENTS
-- =============================================================================

-- Feature flags
CREATE TABLE feature_flags (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for global flags
    flag_name VARCHAR(100) NOT NULL,
    flag_value BOOLEAN NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, flag_name)
);

-- System integrations
CREATE TABLE system_integrations (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_name VARCHAR(100) NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- whatsapp, email, sms, crm, erp
    status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, error, pending
    configuration JSONB NOT NULL,
    credentials JSONB, -- encrypted
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, integration_name)
);

-- =============================================================================
-- 8. ENHANCED AUDIT SYSTEM
-- =============================================================================

-- Audit log categories
CREATE TABLE audit_log_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    retention_days INTEGER DEFAULT 2555, -- 7 years
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced audit logs with categories
ALTER TABLE audit_logs ADD COLUMN category_id BIGINT REFERENCES audit_log_categories(id);
ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN request_id VARCHAR(100);

-- =============================================================================
-- 9. WORKFLOW ENHANCEMENTS
-- =============================================================================

-- Workflow templates
CREATE TABLE workflow_templates (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(50) NOT NULL, -- loan_processing, document_verification, compliance_review
    template_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Workflow instances
CREATE TABLE workflow_instances (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES workflow_templates(id),
    entity_type VARCHAR(50) NOT NULL, -- loan_application, document, compliance_issue
    entity_id BIGINT NOT NULL,
    current_stage_id BIGINT REFERENCES workflow_stages(id),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled, paused
    started_by BIGINT NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. NOTIFICATION ENHANCEMENTS
-- =============================================================================

-- Notification templates
CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL, -- email, whatsapp, sms, push, in_app
    subject VARCHAR(200),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name, channel)
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id, notification_type, channel)
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Task management indexes
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Workload planning indexes
CREATE INDEX idx_workload_schedules_user_date ON workload_schedules(user_id, date);
CREATE INDEX idx_workload_assignments_user ON workload_assignments(user_id);
CREATE INDEX idx_workload_assignments_status ON workload_assignments(status);

-- Approval queue indexes
CREATE INDEX idx_approval_queue_items_queue ON approval_queue_items(queue_id);
CREATE INDEX idx_approval_queue_items_assigned_to ON approval_queue_items(assigned_to);
CREATE INDEX idx_approval_queue_items_status ON approval_queue_items(status);
CREATE INDEX idx_approval_queue_items_due_date ON approval_queue_items(due_date);

-- Compliance issues indexes
CREATE INDEX idx_compliance_issues_organization ON compliance_issues(organization_id);
CREATE INDEX idx_compliance_issues_assigned_to ON compliance_issues(assigned_to);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);
CREATE INDEX idx_compliance_issues_severity ON compliance_issues(severity);

-- Analytics indexes
CREATE INDEX idx_report_executions_organization ON report_executions(organization_id);
CREATE INDEX idx_report_executions_status ON report_executions(status);
CREATE INDEX idx_report_executions_created_at ON report_executions(created_at);

-- User management indexes
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_department ON user_profiles(department_id);
CREATE INDEX idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- System configuration indexes
CREATE INDEX idx_feature_flags_organization ON feature_flags(organization_id);
CREATE INDEX idx_system_integrations_organization ON system_integrations(organization_id);
CREATE INDEX idx_system_integrations_type ON system_integrations(integration_type);

-- Workflow indexes
CREATE INDEX idx_workflow_instances_organization ON workflow_instances(organization_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

-- Notification indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_templates_organization ON notification_templates(organization_id);

-- =============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_task_categories_updated_at BEFORE UPDATE ON task_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workload_schedules_updated_at BEFORE UPDATE ON workload_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workload_assignments_updated_at BEFORE UPDATE ON workload_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_queues_updated_at BEFORE UPDATE ON approval_queues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_queue_items_updated_at BEFORE UPDATE ON approval_queue_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_issue_types_updated_at BEFORE UPDATE ON compliance_issue_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_issues_updated_at BEFORE UPDATE ON compliance_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_issue_comments_updated_at BEFORE UPDATE ON compliance_issue_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_reports_updated_at BEFORE UPDATE ON scheduled_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_integrations_updated_at BEFORE UPDATE ON system_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
