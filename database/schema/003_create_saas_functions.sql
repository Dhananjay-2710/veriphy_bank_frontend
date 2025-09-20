-- Veriphy Bank SaaS Platform
-- Functions and triggers for multi-tenant system

-- =============================================================================
-- 1. TENANT ISOLATION FUNCTIONS
-- =============================================================================

-- Function to get current organization context
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(current_setting('app.current_organization_id', true)::BIGINT, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to set organization context
CREATE OR REPLACE FUNCTION set_organization_context(org_id BIGINT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_organization_id', org_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Function to validate organization access
CREATE OR REPLACE FUNCTION validate_organization_access(
    p_user_id BIGINT,
    p_organization_id BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM organization_members om
        WHERE om.user_id = p_user_id
        AND om.organization_id = p_organization_id
        AND om.is_active = true
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- 2. LOAN APPLICATION FUNCTIONS
-- =============================================================================

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number(p_organization_id BIGINT)
RETURNS VARCHAR AS $$
DECLARE
    org_slug VARCHAR(100);
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    sequence_num BIGINT;
    application_number VARCHAR(50);
BEGIN
    -- Get organization slug
    SELECT slug INTO org_slug
    FROM organizations
    WHERE id = p_organization_id;
    
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
    
    -- Get next sequence number for current month
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM length(org_slug) + 6) AS BIGINT)), 0) + 1
    INTO sequence_num
    FROM loan_applications
    WHERE organization_id = p_organization_id
    AND application_number LIKE org_slug || '-' || year_part || '-' || month_part || '-%';
    
    application_number := org_slug || '-' || year_part || '-' || month_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN application_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number(p_organization_id BIGINT)
RETURNS VARCHAR AS $$
DECLARE
    org_slug VARCHAR(100);
    sequence_num BIGINT;
    customer_number VARCHAR(50);
BEGIN
    -- Get organization slug
    SELECT slug INTO org_slug
    FROM organizations
    WHERE id = p_organization_id;
    
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM length(org_slug) + 2) AS BIGINT)), 0) + 1
    INTO sequence_num
    FROM customers
    WHERE organization_id = p_organization_id;
    
    customer_number := org_slug || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN customer_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create loan application
CREATE OR REPLACE FUNCTION create_loan_application(
    p_organization_id BIGINT,
    p_customer_id BIGINT,
    p_loan_product_id BIGINT,
    p_requested_amount DECIMAL(15,2),
    p_requested_tenure INTEGER,
    p_purpose TEXT,
    p_created_by BIGINT
)
RETURNS BIGINT AS $$
DECLARE
    application_id BIGINT;
    application_number VARCHAR(50);
    assigned_sales_agent BIGINT;
    assigned_credit_analyst BIGINT;
BEGIN
    -- Generate application number
    application_number := generate_application_number(p_organization_id);
    
    -- Auto-assign sales agent if not specified
    SELECT om.user_id INTO assigned_sales_agent
    FROM organization_members om
    WHERE om.organization_id = p_organization_id
    AND om.role IN ('sales_agent', 'sales_manager')
    AND om.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Auto-assign credit analyst if not specified
    SELECT om.user_id INTO assigned_credit_analyst
    FROM organization_members om
    WHERE om.organization_id = p_organization_id
    AND om.role IN ('credit_analyst', 'credit_manager')
    AND om.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Create loan application
    INSERT INTO loan_applications (
        organization_id,
        application_number,
        customer_id,
        loan_product_id,
        requested_amount,
        requested_tenure,
        purpose,
        assigned_sales_agent,
        assigned_credit_analyst,
        current_stage
    ) VALUES (
        p_organization_id,
        application_number,
        p_customer_id,
        p_loan_product_id,
        p_requested_amount,
        p_requested_tenure,
        p_purpose,
        assigned_sales_agent,
        assigned_credit_analyst,
        'draft'
    ) RETURNING id INTO application_id;
    
    -- Log workflow history
    INSERT INTO workflow_history (
        organization_id,
        loan_application_id,
        to_stage_id,
        user_id,
        action,
        comments
    ) VALUES (
        p_organization_id,
        application_id,
        (SELECT id FROM workflow_stages WHERE organization_id = p_organization_id AND stage_key = 'draft'),
        p_created_by,
        'Create Application',
        'Loan application created'
    );
    
    RETURN application_id;
END;
$$ LANGUAGE plpgsql;

-- Function to move loan application to next stage
CREATE OR REPLACE FUNCTION move_loan_application_stage(
    p_application_id BIGINT,
    p_to_stage_key VARCHAR(50),
    p_user_id BIGINT,
    p_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_org_id BIGINT;
    current_stage_id BIGINT;
    to_stage_id BIGINT;
    transition_exists BOOLEAN;
BEGIN
    -- Get current organization and stage
    SELECT la.organization_id, ws.id
    INTO current_org_id, current_stage_id
    FROM loan_applications la
    JOIN workflow_stages ws ON la.current_stage = ws.stage_key
    WHERE la.id = p_application_id;
    
    -- Get target stage
    SELECT id INTO to_stage_id
    FROM workflow_stages
    WHERE organization_id = current_org_id
    AND stage_key = p_to_stage_key;
    
    -- Check if transition is allowed
    SELECT EXISTS(
        SELECT 1 FROM workflow_transitions wt
        WHERE wt.organization_id = current_org_id
        AND wt.from_stage_id = current_stage_id
        AND wt.to_stage_id = to_stage_id
        AND wt.is_active = true
    ) INTO transition_exists;
    
    IF NOT transition_exists THEN
        RAISE EXCEPTION 'Transition from current stage to % is not allowed', p_to_stage_key;
    END IF;
    
    -- Update application stage
    UPDATE loan_applications
    SET current_stage = p_to_stage_key,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_application_id;
    
    -- Log workflow history
    INSERT INTO workflow_history (
        organization_id,
        loan_application_id,
        from_stage_id,
        to_stage_id,
        user_id,
        action,
        comments
    ) VALUES (
        current_org_id,
        p_application_id,
        current_stage_id,
        to_stage_id,
        p_user_id,
        'Stage Transition',
        p_comments
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. WHATSAPP INTEGRATION FUNCTIONS
-- =============================================================================

-- Function to create WhatsApp conversation
CREATE OR REPLACE FUNCTION create_whatsapp_conversation(
    p_organization_id BIGINT,
    p_loan_application_id BIGINT,
    p_customer_phone VARCHAR(20)
)
RETURNS BIGINT AS $$
DECLARE
    conversation_id BIGINT;
    whatsapp_id VARCHAR(100);
BEGIN
    -- Generate WhatsApp ID
    whatsapp_id := 'whatsapp_' || p_organization_id || '_' || p_loan_application_id || '_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP);
    
    -- Create conversation
    INSERT INTO whatsapp_conversations (
        organization_id,
        loan_application_id,
        customer_phone,
        whatsapp_id,
        status
    ) VALUES (
        p_organization_id,
        p_loan_application_id,
        p_customer_phone,
        whatsapp_id,
        'active'
    ) RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send WhatsApp message
CREATE OR REPLACE FUNCTION send_whatsapp_message(
    p_organization_id BIGINT,
    p_conversation_id BIGINT,
    p_message_id VARCHAR(100),
    p_type VARCHAR(20),
    p_content TEXT,
    p_sender VARCHAR(20),
    p_direction VARCHAR(10),
    p_document_id BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    message_id BIGINT;
BEGIN
    -- Insert message
    INSERT INTO whatsapp_messages (
        organization_id,
        conversation_id,
        message_id,
        type,
        content,
        sender,
        direction,
        document_id,
        timestamp
    ) VALUES (
        p_organization_id,
        p_conversation_id,
        p_message_id,
        p_type,
        p_content,
        p_sender,
        p_direction,
        p_document_id,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO message_id;
    
    -- Update conversation last message time
    UPDATE whatsapp_conversations
    SET last_message_at = CURRENT_TIMESTAMP
    WHERE id = p_conversation_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql;

-- Function to request documents via WhatsApp
CREATE OR REPLACE FUNCTION request_documents_whatsapp(
    p_organization_id BIGINT,
    p_loan_application_id BIGINT,
    p_document_types TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    conversation_id BIGINT;
    customer_phone VARCHAR(20);
    document_list TEXT;
    template_content TEXT;
    message_id VARCHAR(100);
BEGIN
    -- Get customer phone
    SELECT c.phone INTO customer_phone
    FROM customers c
    JOIN loan_applications la ON c.id = la.customer_id
    WHERE la.id = p_loan_application_id
    AND la.organization_id = p_organization_id;
    
    -- Get or create conversation
    SELECT id INTO conversation_id
    FROM whatsapp_conversations
    WHERE organization_id = p_organization_id
    AND loan_application_id = p_loan_application_id
    AND customer_phone = customer_phone;
    
    IF conversation_id IS NULL THEN
        conversation_id := create_whatsapp_conversation(p_organization_id, p_loan_application_id, customer_phone);
    END IF;
    
    -- Build document list
    SELECT string_agg(dt.name, ', ') INTO document_list
    FROM document_types dt
    WHERE dt.organization_id = p_organization_id
    AND dt.name = ANY(p_document_types);
    
    -- Get template content
    SELECT content INTO template_content
    FROM whatsapp_templates
    WHERE organization_id = p_organization_id
    AND template_id = 'doc_request_001';
    
    -- Replace template variables
    template_content := replace(template_content, '{{customer_name}}', (SELECT first_name FROM customers WHERE phone = customer_phone));
    template_content := replace(template_content, '{{application_number}}', (SELECT application_number FROM loan_applications WHERE id = p_loan_application_id));
    template_content := replace(template_content, '{{document_list}}', document_list);
    
    -- Send message
    message_id := 'msg_' || p_organization_id || '_' || p_loan_application_id || '_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP);
    
    PERFORM send_whatsapp_message(
        p_organization_id,
        conversation_id,
        message_id,
        'text',
        template_content,
        'agent',
        'outbound'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 4. DOCUMENT MANAGEMENT FUNCTIONS
-- =============================================================================

-- Function to upload document
CREATE OR REPLACE FUNCTION upload_document(
    p_organization_id BIGINT,
    p_loan_application_id BIGINT,
    p_document_type_id BIGINT,
    p_file_name VARCHAR(255),
    p_file_path VARCHAR(500),
    p_file_size BIGINT,
    p_file_type VARCHAR(50),
    p_mime_type VARCHAR(100),
    p_uploaded_by BIGINT
)
RETURNS BIGINT AS $$
DECLARE
    document_id BIGINT;
BEGIN
    -- Insert document
    INSERT INTO documents (
        organization_id,
        loan_application_id,
        document_type_id,
        file_name,
        file_path,
        file_size,
        file_type,
        mime_type,
        status,
        uploaded_at,
        metadata
    ) VALUES (
        p_organization_id,
        p_loan_application_id,
        p_document_type_id,
        p_file_name,
        p_file_path,
        p_file_size,
        p_file_type,
        p_mime_type,
        'uploaded',
        CURRENT_TIMESTAMP,
        jsonb_build_object('uploaded_by', p_uploaded_by)
    ) RETURNING id INTO document_id;
    
    -- Send WhatsApp confirmation
    PERFORM send_document_confirmation_whatsapp(p_organization_id, p_loan_application_id, p_file_name);
    
    RETURN document_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send document confirmation via WhatsApp
CREATE OR REPLACE FUNCTION send_document_confirmation_whatsapp(
    p_organization_id BIGINT,
    p_loan_application_id BIGINT,
    p_document_name VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    conversation_id BIGINT;
    customer_phone VARCHAR(20);
    template_content TEXT;
    message_id VARCHAR(100);
BEGIN
    -- Get customer phone
    SELECT c.phone INTO customer_phone
    FROM customers c
    JOIN loan_applications la ON c.id = la.customer_id
    WHERE la.id = p_loan_application_id
    AND la.organization_id = p_organization_id;
    
    -- Get conversation
    SELECT id INTO conversation_id
    FROM whatsapp_conversations
    WHERE organization_id = p_organization_id
    AND loan_application_id = p_loan_application_id
    AND customer_phone = customer_phone;
    
    IF conversation_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get template content
    SELECT content INTO template_content
    FROM whatsapp_templates
    WHERE organization_id = p_organization_id
    AND template_id = 'doc_received_001';
    
    -- Replace template variables
    template_content := replace(template_content, '{{customer_name}}', (SELECT first_name FROM customers WHERE phone = customer_phone));
    template_content := replace(template_content, '{{document_name}}', p_document_name);
    
    -- Send message
    message_id := 'msg_' || p_organization_id || '_' || p_loan_application_id || '_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP);
    
    PERFORM send_whatsapp_message(
        p_organization_id,
        conversation_id,
        message_id,
        'text',
        template_content,
        'agent',
        'outbound'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. NOTIFICATION FUNCTIONS
-- =============================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_type VARCHAR(50),
    p_title VARCHAR(200),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    notification_id BIGINT;
BEGIN
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
        p_type,
        p_title,
        p_message,
        p_data
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify team members
CREATE OR REPLACE FUNCTION notify_team_members(
    p_organization_id BIGINT,
    p_department_type department_type,
    p_type VARCHAR(50),
    p_title VARCHAR(200),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
    notification_count INTEGER := 0;
    team_member RECORD;
BEGIN
    FOR team_member IN
        SELECT om.user_id
        FROM organization_members om
        JOIN departments d ON om.department_id = d.id
        WHERE om.organization_id = p_organization_id
        AND d.type = p_department_type
        AND om.is_active = true
    LOOP
        PERFORM create_notification(
            p_organization_id,
            team_member.user_id,
            p_type,
            p_title,
            p_message,
            p_data
        );
        notification_count := notification_count + 1;
    END LOOP;
    
    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. AUDIT AND COMPLIANCE FUNCTIONS
-- =============================================================================

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail(
    p_organization_id BIGINT,
    p_user_id BIGINT,
    p_action VARCHAR(100),
    p_resource_type VARCHAR(50),
    p_resource_id BIGINT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    audit_id BIGINT;
BEGIN
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. REPORTING FUNCTIONS
-- =============================================================================

-- Function to get loan application summary
CREATE OR REPLACE FUNCTION get_loan_application_summary(
    p_organization_id BIGINT,
    p_from_date DATE DEFAULT NULL,
    p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_applications BIGINT,
    pending_applications BIGINT,
    approved_applications BIGINT,
    rejected_applications BIGINT,
    total_amount DECIMAL(15,2),
    avg_processing_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_applications,
        COUNT(CASE WHEN la.status IN ('draft', 'submitted', 'under_review', 'document_collection', 'credit_analysis') THEN 1 END)::BIGINT as pending_applications,
        COUNT(CASE WHEN la.status = 'approved' THEN 1 END)::BIGINT as approved_applications,
        COUNT(CASE WHEN la.status = 'rejected' THEN 1 END)::BIGINT as rejected_applications,
        COALESCE(SUM(la.requested_amount), 0) as total_amount,
        COALESCE(AVG(EXTRACT(EPOCH FROM (la.updated_at - la.created_at))/86400), 0) as avg_processing_days
    FROM loan_applications la
    WHERE la.organization_id = p_organization_id
    AND la.deleted_at IS NULL
    AND (p_from_date IS NULL OR la.created_at >= p_from_date)
    AND (p_to_date IS NULL OR la.created_at <= p_to_date);
END;
$$ LANGUAGE plpgsql;

-- Function to get department performance
CREATE OR REPLACE FUNCTION get_department_performance(
    p_organization_id BIGINT,
    p_department_type department_type,
    p_from_date DATE DEFAULT NULL,
    p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
    department_name VARCHAR(100),
    total_cases BIGINT,
    completed_cases BIGINT,
    avg_processing_hours NUMERIC,
    team_members BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name as department_name,
        COUNT(la.id)::BIGINT as total_cases,
        COUNT(CASE WHEN la.status IN ('approved', 'rejected', 'disbursed', 'closed') THEN 1 END)::BIGINT as completed_cases,
        COALESCE(AVG(EXTRACT(EPOCH FROM (la.updated_at - la.created_at))/3600), 0) as avg_processing_hours,
        COUNT(DISTINCT om.user_id)::BIGINT as team_members
    FROM departments d
    LEFT JOIN organization_members om ON d.id = om.department_id AND om.is_active = true
    LEFT JOIN loan_applications la ON (
        (d.type = 'sales' AND la.assigned_sales_agent = om.user_id) OR
        (d.type = 'credit' AND la.assigned_credit_analyst = om.user_id)
    )
    WHERE d.organization_id = p_organization_id
    AND d.type = p_department_type
    AND (p_from_date IS NULL OR la.created_at >= p_from_date)
    AND (p_to_date IS NULL OR la.created_at <= p_to_date)
    GROUP BY d.id, d.name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. TRIGGERS
-- =============================================================================

-- Trigger to generate customer number
CREATE OR REPLACE FUNCTION trigger_generate_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.customer_number := generate_customer_number(NEW.organization_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_number_generation
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_customer_number();

-- Trigger to generate application number
CREATE OR REPLACE FUNCTION trigger_generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.application_number := generate_application_number(NEW.organization_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_number_generation
    BEFORE INSERT ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_application_number();

-- Trigger to log audit trail for loan applications
CREATE OR REPLACE FUNCTION trigger_audit_loan_applications()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_trail(
            NEW.organization_id,
            COALESCE(current_setting('app.current_user_id', true)::BIGINT, 0),
            'CREATE_LOAN_APPLICATION',
            'loan_applications',
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_trail(
            NEW.organization_id,
            COALESCE(current_setting('app.current_user_id', true)::BIGINT, 0),
            'UPDATE_LOAN_APPLICATION',
            'loan_applications',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_trail(
            OLD.organization_id,
            COALESCE(current_setting('app.current_user_id', true)::BIGINT, 0),
            'DELETE_LOAN_APPLICATION',
            'loan_applications',
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_loan_applications
    AFTER INSERT OR UPDATE OR DELETE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_loan_applications();

-- Trigger to create notifications on workflow changes
CREATE OR REPLACE FUNCTION trigger_workflow_notifications()
RETURNS TRIGGER AS $$
DECLARE
    customer_name VARCHAR(200);
    application_number VARCHAR(50);
BEGIN
    -- Get customer and application details
    SELECT c.first_name || ' ' || c.last_name, la.application_number
    INTO customer_name, application_number
    FROM customers c
    JOIN loan_applications la ON c.id = la.customer_id
    WHERE la.id = NEW.loan_application_id;
    
    -- Create notification for assigned users
    IF NEW.user_id IS NOT NULL THEN
        PERFORM create_notification(
            NEW.organization_id,
            NEW.user_id,
            'workflow_update',
            'Workflow Status Changed',
            'Application ' || application_number || ' moved to ' || NEW.action || ' stage',
            jsonb_build_object(
                'application_id', NEW.loan_application_id,
                'customer_name', customer_name,
                'action', NEW.action,
                'stage', NEW.to_stage_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workflow_notifications
    AFTER INSERT ON workflow_history
    FOR EACH ROW
    EXECUTE FUNCTION trigger_workflow_notifications();
