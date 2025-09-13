-- Veriphy Bank SaaS Platform
-- Functions for the missing components

-- =============================================================================
-- 1. TASK MANAGEMENT FUNCTIONS
-- =============================================================================

-- Function to create task
CREATE OR REPLACE FUNCTION create_task(
    p_organization_id BIGINT,
    p_title VARCHAR(200),
    p_description TEXT,
    p_category_id BIGINT DEFAULT NULL,
    p_priority priority_level DEFAULT 'medium',
    p_assigned_to BIGINT DEFAULT NULL,
    p_created_by BIGINT,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_estimated_hours DECIMAL(4,2) DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    task_id BIGINT;
BEGIN
    INSERT INTO tasks (
        organization_id,
        title,
        description,
        category_id,
        priority,
        assigned_to,
        created_by,
        due_date,
        estimated_hours,
        tags
    ) VALUES (
        p_organization_id,
        p_title,
        p_description,
        p_category_id,
        p_priority,
        p_assigned_to,
        p_created_by,
        p_due_date,
        p_estimated_hours,
        p_tags
    ) RETURNING id INTO task_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (
        organization_id,
        user_id,
        activity_type,
        activity_description,
        resource_type,
        resource_id
    ) VALUES (
        p_organization_id,
        p_created_by,
        'CREATE_TASK',
        'Created task: ' || p_title,
        'tasks',
        task_id
    );
    
    RETURN task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to assign task
CREATE OR REPLACE FUNCTION assign_task(
    p_task_id BIGINT,
    p_assigned_to BIGINT,
    p_assigned_by BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    task_org_id BIGINT;
BEGIN
    -- Get task organization
    SELECT organization_id INTO task_org_id
    FROM tasks
    WHERE id = p_task_id;
    
    -- Update task assignment
    UPDATE tasks
    SET assigned_to = p_assigned_to,
        status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_task_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (
        organization_id,
        user_id,
        activity_type,
        activity_description,
        resource_type,
        resource_id
    ) VALUES (
        task_org_id,
        p_assigned_by,
        'ASSIGN_TASK',
        'Assigned task to user',
        'tasks',
        p_task_id
    );
    
    -- Create notification
    PERFORM create_notification(
        task_org_id,
        p_assigned_to,
        'task_assigned',
        'New Task Assigned',
        'You have been assigned a new task',
        jsonb_build_object('task_id', p_task_id)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user tasks
CREATE OR REPLACE FUNCTION get_user_tasks(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    title VARCHAR(200),
    description TEXT,
    category_name VARCHAR(100),
    priority priority_level,
    status VARCHAR(20),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.description,
        tc.name as category_name,
        t.priority,
        t.status,
        t.due_date,
        t.estimated_hours,
        t.actual_hours,
        t.created_at
    FROM tasks t
    LEFT JOIN task_categories tc ON t.category_id = tc.id
    WHERE t.organization_id = p_organization_id
    AND t.assigned_to = p_user_id
    AND t.deleted_at IS NULL
    AND (p_status IS NULL OR t.status = p_status)
    ORDER BY t.priority DESC, t.due_date ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. WORKLOAD PLANNING FUNCTIONS
-- =============================================================================

-- Function to create workload schedule
CREATE OR REPLACE FUNCTION create_workload_schedule(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_date DATE,
    p_planned_hours DECIMAL(4,2) DEFAULT 8.0,
    p_capacity_percentage INTEGER DEFAULT 100,
    p_notes TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    schedule_id BIGINT;
BEGIN
    INSERT INTO workload_schedules (
        organization_id,
        user_id,
        date,
        planned_hours,
        capacity_percentage,
        notes
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_date,
        p_planned_hours,
        p_capacity_percentage,
        p_notes
    ) ON CONFLICT (organization_id, user_id, date)
    DO UPDATE SET
        planned_hours = EXCLUDED.planned_hours,
        capacity_percentage = EXCLUDED.capacity_percentage,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO schedule_id;
    
    RETURN schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Function to assign workload
CREATE OR REPLACE FUNCTION assign_workload(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_task_id BIGINT DEFAULT NULL,
    p_loan_application_id BIGINT DEFAULT NULL,
    p_assigned_hours DECIMAL(4,2),
    p_start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    assignment_id BIGINT;
BEGIN
    INSERT INTO workload_assignments (
        organization_id,
        user_id,
        task_id,
        loan_application_id,
        assigned_hours,
        start_time,
        end_time
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_task_id,
        p_loan_application_id,
        p_assigned_hours,
        p_start_time,
        p_end_time
    ) RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user workload
CREATE OR REPLACE FUNCTION get_user_workload(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    planned_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    capacity_percentage INTEGER,
    assigned_tasks BIGINT,
    completed_tasks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.date,
        ws.planned_hours,
        ws.actual_hours,
        ws.capacity_percentage,
        COUNT(wa.id)::BIGINT as assigned_tasks,
        COUNT(CASE WHEN wa.status = 'completed' THEN 1 END)::BIGINT as completed_tasks
    FROM workload_schedules ws
    LEFT JOIN workload_assignments wa ON ws.user_id = wa.user_id 
        AND ws.date = DATE(wa.start_time)
    WHERE ws.organization_id = p_organization_id
    AND ws.user_id = p_user_id
    AND ws.date BETWEEN p_start_date AND p_end_date
    GROUP BY ws.date, ws.planned_hours, ws.actual_hours, ws.capacity_percentage
    ORDER BY ws.date;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. APPROVAL QUEUE FUNCTIONS
-- =============================================================================

-- Function to add item to approval queue
CREATE OR REPLACE FUNCTION add_to_approval_queue(
    p_organization_id BIGINT,
    p_queue_id BIGINT,
    p_item_type VARCHAR(50),
    p_item_id BIGINT,
    p_priority priority_level DEFAULT 'medium',
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    queue_item_id BIGINT;
    auto_assign BOOLEAN;
    assigned_user BIGINT;
BEGIN
    -- Check if queue has auto-assign enabled
    SELECT aq.auto_assign INTO auto_assign
    FROM approval_queues aq
    WHERE aq.id = p_queue_id;
    
    -- Auto-assign if enabled
    IF auto_assign THEN
        SELECT aqa.user_id INTO assigned_user
        FROM approval_queue_assignments aqa
        WHERE aqa.queue_id = p_queue_id
        AND aqa.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
    
    -- Add item to queue
    INSERT INTO approval_queue_items (
        organization_id,
        queue_id,
        item_type,
        item_id,
        priority,
        assigned_to,
        due_date,
        metadata
    ) VALUES (
        p_organization_id,
        p_queue_id,
        p_item_type,
        p_item_id,
        p_priority,
        assigned_user,
        p_due_date,
        p_metadata
    ) RETURNING id INTO queue_item_id;
    
    -- Notify assigned user
    IF assigned_user IS NOT NULL THEN
        PERFORM create_notification(
            p_organization_id,
            assigned_user,
            'approval_queue_item',
            'New Item in Approval Queue',
            'A new item has been assigned to you for review',
            jsonb_build_object('queue_item_id', queue_item_id, 'item_type', p_item_type)
        );
    END IF;
    
    RETURN queue_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process approval queue item
CREATE OR REPLACE FUNCTION process_approval_queue_item(
    p_queue_item_id BIGINT,
    p_user_id BIGINT,
    p_decision VARCHAR(20),
    p_decision_reason TEXT DEFAULT NULL,
    p_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    item_org_id BIGINT;
    item_type VARCHAR(50);
    item_id BIGINT;
BEGIN
    -- Get item details
    SELECT organization_id, item_type, item_id
    INTO item_org_id, item_type, item_id
    FROM approval_queue_items
    WHERE id = p_queue_item_id;
    
    -- Update queue item
    UPDATE approval_queue_items
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        decision = p_decision,
        decision_reason = p_decision_reason,
        comments = p_comments,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_queue_item_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (
        organization_id,
        user_id,
        activity_type,
        activity_description,
        resource_type,
        resource_id
    ) VALUES (
        item_org_id,
        p_user_id,
        'PROCESS_APPROVAL_QUEUE',
        'Processed approval queue item: ' || p_decision,
        'approval_queue_items',
        p_queue_item_id
    );
    
    -- Handle based on item type and decision
    IF item_type = 'loan_application' THEN
        IF p_decision = 'approved' THEN
            PERFORM move_loan_application_stage(item_id, 'approved', p_user_id, p_decision_reason);
        ELSIF p_decision = 'rejected' THEN
            PERFORM move_loan_application_stage(item_id, 'rejected', p_user_id, p_decision_reason);
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get approval queue items
CREATE OR REPLACE FUNCTION get_approval_queue_items(
    p_organization_id BIGINT,
    p_queue_id BIGINT DEFAULT NULL,
    p_assigned_to BIGINT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    queue_name VARCHAR(100),
    item_type VARCHAR(50),
    item_id BIGINT,
    priority priority_level,
    status VARCHAR(20),
    assigned_to BIGINT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aqi.id,
        aq.name as queue_name,
        aqi.item_type,
        aqi.item_id,
        aqi.priority,
        aqi.status,
        aqi.assigned_to,
        aqi.due_date,
        aqi.created_at
    FROM approval_queue_items aqi
    JOIN approval_queues aq ON aqi.queue_id = aq.id
    WHERE aqi.organization_id = p_organization_id
    AND (p_queue_id IS NULL OR aqi.queue_id = p_queue_id)
    AND (p_assigned_to IS NULL OR aqi.assigned_to = p_assigned_to)
    AND (p_status IS NULL OR aqi.status = p_status)
    ORDER BY aqi.priority DESC, aqi.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 4. COMPLIANCE ISSUES FUNCTIONS
-- =============================================================================

-- Function to create compliance issue
CREATE OR REPLACE FUNCTION create_compliance_issue(
    p_organization_id BIGINT,
    p_issue_type_id BIGINT,
    p_loan_application_id BIGINT DEFAULT NULL,
    p_customer_id BIGINT DEFAULT NULL,
    p_title VARCHAR(200),
    p_description TEXT,
    p_severity priority_level,
    p_flagged_by BIGINT,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    issue_id BIGINT;
    issue_number VARCHAR(50);
    auto_assign_user BIGINT;
BEGIN
    -- Generate issue number
    issue_number := 'COMP-' || p_organization_id || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                   LPAD(EXTRACT(DOY FROM CURRENT_DATE)::TEXT, 3, '0') || '-' || 
                   LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(issue_number FROM 15) AS INTEGER)), 0) + 1 
                        FROM compliance_issues 
                        WHERE organization_id = p_organization_id 
                        AND issue_number LIKE 'COMP-' || p_organization_id || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(DOY FROM CURRENT_DATE)::TEXT, 3, '0') || '-%')::TEXT, 4, '0');
    
    -- Auto-assign based on severity and department
    IF p_severity IN ('high', 'urgent') THEN
        SELECT om.user_id INTO auto_assign_user
        FROM organization_members om
        JOIN departments d ON om.department_id = d.id
        WHERE om.organization_id = p_organization_id
        AND d.type = 'compliance'
        AND om.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
    
    -- Create compliance issue
    INSERT INTO compliance_issues (
        organization_id,
        issue_number,
        issue_type_id,
        loan_application_id,
        customer_id,
        title,
        description,
        severity,
        flagged_by,
        assigned_to,
        due_date,
        metadata
    ) VALUES (
        p_organization_id,
        issue_number,
        p_issue_type_id,
        p_loan_application_id,
        p_customer_id,
        p_title,
        p_description,
        p_severity,
        p_flagged_by,
        auto_assign_user,
        p_due_date,
        p_metadata
    ) RETURNING id INTO issue_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (
        organization_id,
        user_id,
        activity_type,
        activity_description,
        resource_type,
        resource_id
    ) VALUES (
        p_organization_id,
        p_flagged_by,
        'CREATE_COMPLIANCE_ISSUE',
        'Created compliance issue: ' || p_title,
        'compliance_issues',
        issue_id
    );
    
    -- Notify assigned user
    IF auto_assign_user IS NOT NULL THEN
        PERFORM create_notification(
            p_organization_id,
            auto_assign_user,
            'compliance_issue_assigned',
            'New Compliance Issue Assigned',
            'A new compliance issue has been assigned to you: ' || p_title,
            jsonb_build_object('issue_id', issue_id, 'severity', p_severity)
        );
    END IF;
    
    RETURN issue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve compliance issue
CREATE OR REPLACE FUNCTION resolve_compliance_issue(
    p_issue_id BIGINT,
    p_user_id BIGINT,
    p_resolution_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    issue_org_id BIGINT;
BEGIN
    -- Get issue organization
    SELECT organization_id INTO issue_org_id
    FROM compliance_issues
    WHERE id = p_issue_id;
    
    -- Update issue
    UPDATE compliance_issues
    SET status = 'resolved',
        resolved_at = CURRENT_TIMESTAMP,
        resolution_notes = p_resolution_notes,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_issue_id;
    
    -- Log activity
    INSERT INTO user_activity_logs (
        organization_id,
        user_id,
        activity_type,
        activity_description,
        resource_type,
        resource_id
    ) VALUES (
        issue_org_id,
        p_user_id,
        'RESOLVE_COMPLIANCE_ISSUE',
        'Resolved compliance issue',
        'compliance_issues',
        p_issue_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance issues
CREATE OR REPLACE FUNCTION get_compliance_issues(
    p_organization_id BIGINT,
    p_assigned_to BIGINT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_severity priority_level DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    issue_number VARCHAR(50),
    title VARCHAR(200),
    description TEXT,
    severity priority_level,
    status VARCHAR(20),
    assigned_to BIGINT,
    flagged_by VARCHAR(200),
    flagged_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.issue_number,
        ci.title,
        ci.description,
        ci.severity,
        ci.status,
        ci.assigned_to,
        u.first_name || ' ' || u.last_name as flagged_by,
        ci.flagged_at,
        ci.due_date,
        ci.resolved_at
    FROM compliance_issues ci
    LEFT JOIN users u ON ci.flagged_by = u.id
    WHERE ci.organization_id = p_organization_id
    AND (p_assigned_to IS NULL OR ci.assigned_to = p_assigned_to)
    AND (p_status IS NULL OR ci.status = p_status)
    AND (p_severity IS NULL OR ci.severity = p_severity)
    ORDER BY ci.severity DESC, ci.flagged_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. ANALYTICS AND REPORTING FUNCTIONS
-- =============================================================================

-- Function to generate report
CREATE OR REPLACE FUNCTION generate_report(
    p_organization_id BIGINT,
    p_template_id BIGINT,
    p_parameters JSONB DEFAULT '{}',
    p_created_by BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    execution_id BIGINT;
    template_config JSONB;
    report_type VARCHAR(50);
BEGIN
    -- Get template configuration
    SELECT template_config, report_type
    INTO template_config, report_type
    FROM report_templates
    WHERE id = p_template_id AND organization_id = p_organization_id;
    
    -- Create report execution
    INSERT INTO report_executions (
        organization_id,
        template_id,
        status,
        parameters,
        created_by
    ) VALUES (
        p_organization_id,
        p_template_id,
        'pending',
        p_parameters,
        p_created_by
    ) RETURNING id INTO execution_id;
    
    -- Update status to running
    UPDATE report_executions
    SET status = 'running',
        started_at = CURRENT_TIMESTAMP
    WHERE id = execution_id;
    
    -- Simulate report generation (in real implementation, this would call external service)
    -- For now, just mark as completed
    UPDATE report_executions
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        file_path = '/reports/org_' || p_organization_id || '/report_' || execution_id || '.pdf',
        file_size = 1024000
    WHERE id = execution_id;
    
    RETURN execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    p_organization_id BIGINT,
    p_user_id BIGINT DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS TABLE (
    metric_name VARCHAR(100),
    metric_value BIGINT,
    metric_percentage NUMERIC,
    trend VARCHAR(10)
) AS $$
DECLARE
    date_from DATE := COALESCE(p_date_from, CURRENT_DATE - INTERVAL '30 days');
    date_to DATE := COALESCE(p_date_to, CURRENT_DATE);
BEGIN
    RETURN QUERY
    -- Loan applications
    SELECT 
        'Total Applications'::VARCHAR(100) as metric_name,
        COUNT(*)::BIGINT as metric_value,
        NULL::NUMERIC as metric_percentage,
        'stable'::VARCHAR(10) as trend
    FROM loan_applications
    WHERE organization_id = p_organization_id
    AND created_at >= date_from
    AND created_at <= date_to
    
    UNION ALL
    
    -- Pending tasks
    SELECT 
        'Pending Tasks'::VARCHAR(100),
        COUNT(*)::BIGINT,
        NULL::NUMERIC,
        'stable'::VARCHAR(10)
    FROM tasks
    WHERE organization_id = p_organization_id
    AND (p_user_id IS NULL OR assigned_to = p_user_id)
    AND status IN ('pending', 'in_progress')
    
    UNION ALL
    
    -- Compliance issues
    SELECT 
        'Open Compliance Issues'::VARCHAR(100),
        COUNT(*)::BIGINT,
        NULL::NUMERIC,
        'stable'::VARCHAR(10)
    FROM compliance_issues
    WHERE organization_id = p_organization_id
    AND status = 'open'
    
    UNION ALL
    
    -- Approval queue items
    SELECT 
        'Pending Approvals'::VARCHAR(100),
        COUNT(*)::BIGINT,
        NULL::NUMERIC,
        'stable'::VARCHAR(10)
    FROM approval_queue_items
    WHERE organization_id = p_organization_id
    AND (p_user_id IS NULL OR assigned_to = p_user_id)
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. SYSTEM CONFIGURATION FUNCTIONS
-- =============================================================================

-- Function to set feature flag
CREATE OR REPLACE FUNCTION set_feature_flag(
    p_organization_id BIGINT,
    p_flag_name VARCHAR(100),
    p_flag_value BOOLEAN,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO feature_flags (
        organization_id,
        flag_name,
        flag_value,
        description
    ) VALUES (
        p_organization_id,
        p_flag_name,
        p_flag_value,
        p_description
    ) ON CONFLICT (organization_id, flag_name)
    DO UPDATE SET
        flag_value = EXCLUDED.flag_value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get feature flag
CREATE OR REPLACE FUNCTION get_feature_flag(
    p_organization_id BIGINT,
    p_flag_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
    flag_value BOOLEAN;
BEGIN
    -- First check organization-specific flag
    SELECT ff.flag_value INTO flag_value
    FROM feature_flags ff
    WHERE ff.organization_id = p_organization_id
    AND ff.flag_name = p_flag_name
    AND ff.is_active = true;
    
    -- If not found, check global flag
    IF flag_value IS NULL THEN
        SELECT ff.flag_value INTO flag_value
        FROM feature_flags ff
        WHERE ff.organization_id IS NULL
        AND ff.flag_name = p_flag_name
        AND ff.is_active = true;
    END IF;
    
    RETURN COALESCE(flag_value, false);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. NOTIFICATION ENHANCEMENT FUNCTIONS
-- =============================================================================

-- Function to send templated notification
CREATE OR REPLACE FUNCTION send_templated_notification(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_template_name VARCHAR(100),
    p_channel VARCHAR(20),
    p_variables JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    notification_id BIGINT;
    template_content TEXT;
    template_subject VARCHAR(200);
    processed_content TEXT;
    processed_subject VARCHAR(200);
    template_variables TEXT[];
    var_name TEXT;
    var_value TEXT;
BEGIN
    -- Get template
    SELECT content, subject, variables
    INTO template_content, template_subject, template_variables
    FROM notification_templates
    WHERE organization_id = p_organization_id
    AND name = p_template_name
    AND channel = p_channel
    AND is_active = true;
    
    IF template_content IS NULL THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Process template variables
    processed_content := template_content;
    processed_subject := COALESCE(template_subject, 'Notification');
    
    -- Replace variables in content
    FOR var_name IN SELECT jsonb_object_keys(p_variables)
    LOOP
        var_value := p_variables->>var_name;
        processed_content := replace(processed_content, '{{' || var_name || '}}', var_value);
        processed_subject := replace(processed_subject, '{{' || var_name || '}}', var_value);
    END LOOP;
    
    -- Create notification
    INSERT INTO notifications (
        organization_id,
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        p_organization_id,
        p_user_id,
        'templated',
        processed_subject,
        processed_content,
        jsonb_build_object('template_name', p_template_name, 'channel', p_channel)
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. WORKFLOW ENHANCEMENT FUNCTIONS
-- =============================================================================

-- Function to start workflow instance
CREATE OR REPLACE FUNCTION start_workflow_instance(
    p_organization_id BIGINT,
    p_template_id BIGINT,
    p_entity_type VARCHAR(50),
    p_entity_id BIGINT,
    p_started_by BIGINT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    instance_id BIGINT;
    template_config JSONB;
    initial_stage_id BIGINT;
BEGIN
    -- Get template configuration
    SELECT template_config INTO template_config
    FROM workflow_templates
    WHERE id = p_template_id AND organization_id = p_organization_id;
    
    -- Get initial stage
    SELECT id INTO initial_stage_id
    FROM workflow_stages
    WHERE organization_id = p_organization_id
    AND stage_key = template_config->>'initial_stage';
    
    -- Create workflow instance
    INSERT INTO workflow_instances (
        organization_id,
        template_id,
        entity_type,
        entity_id,
        current_stage_id,
        started_by,
        metadata
    ) VALUES (
        p_organization_id,
        p_template_id,
        p_entity_type,
        p_entity_id,
        initial_stage_id,
        p_started_by,
        p_metadata
    ) RETURNING id INTO instance_id;
    
    RETURN instance_id;
END;
$$ LANGUAGE plpgsql;
