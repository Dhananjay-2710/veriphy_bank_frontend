-- =============================================================================
-- BACKGROUND PROCESSING TABLES MIGRATION
-- =============================================================================
-- This migration creates the background processing tables for job management,
-- batch processing, error handling, API logging, and webhook management.

-- =============================================================================
-- JOBS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN (
        'email', 'sms', 'whatsapp', 'document_processing', 
        'report_generation', 'data_sync', 'webhook', 'cleanup', 'other'
    )),
    job_name VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN (
        'low', 'normal', 'high', 'urgent'
    )),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    error_details JSONB,
    batch_id UUID REFERENCES job_batches(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_available_at ON jobs(available_at);
CREATE INDEX IF NOT EXISTS idx_jobs_batch_id ON jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- =============================================================================
-- JOB_BATCHES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS job_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    batch_name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL DEFAULT 0,
    pending_jobs INTEGER NOT NULL DEFAULT 0,
    processed_jobs INTEGER NOT NULL DEFAULT 0,
    failed_jobs INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),
    progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for job_batches table
CREATE INDEX IF NOT EXISTS idx_job_batches_organization_id ON job_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_batches_status ON job_batches(status);
CREATE INDEX IF NOT EXISTS idx_job_batches_created_at ON job_batches(created_at);

-- =============================================================================
-- FAILED_JOBS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS failed_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    error_message TEXT NOT NULL,
    error_details JSONB,
    stack_trace TEXT,
    failed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for failed_jobs table
CREATE INDEX IF NOT EXISTS idx_failed_jobs_job_id ON failed_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_organization_id ON failed_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_job_type ON failed_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_is_resolved ON failed_jobs(is_resolved);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_failed_at ON failed_jobs(failed_at);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_created_at ON failed_jobs(created_at);

-- =============================================================================
-- THIRD_PARTY_API_LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS third_party_api_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES system_integrations(id) ON DELETE SET NULL,
    api_name VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    request_payload JSONB,
    response_payload JSONB,
    status_code INTEGER,
    response_time INTEGER, -- in milliseconds
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'success', 'failed', 'timeout'
    )),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    is_success BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for third_party_api_log table
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_organization_id ON third_party_api_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_integration_id ON third_party_api_log(integration_id);
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_api_name ON third_party_api_log(api_name);
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_status ON third_party_api_log(status);
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_is_success ON third_party_api_log(is_success);
CREATE INDEX IF NOT EXISTS idx_third_party_api_log_created_at ON third_party_api_log(created_at);

-- =============================================================================
-- WEBHOOKS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    webhook_name VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'case_created', 'case_updated', 'document_uploaded', 
        'task_completed', 'user_created', 'custom'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'error'
    )),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    secret VARCHAR(255),
    headers JSONB DEFAULT '{}',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    timeout INTEGER NOT NULL DEFAULT 30, -- in seconds
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for webhooks table
CREATE INDEX IF NOT EXISTS idx_webhooks_organization_id ON webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_batches_updated_at BEFORE UPDATE ON job_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_failed_jobs_updated_at BEFORE UPDATE ON failed_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_third_party_api_log_updated_at BEFORE UPDATE ON third_party_api_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update job batch progress
CREATE OR REPLACE FUNCTION update_job_batch_progress()
RETURNS TRIGGER AS $$
DECLARE
    batch_id UUID;
    total_jobs INTEGER;
    processed_jobs INTEGER;
    failed_jobs INTEGER;
    pending_jobs INTEGER;
    progress DECIMAL(5,2);
BEGIN
    -- Get the batch_id from the job
    IF TG_OP = 'INSERT' THEN
        batch_id := NEW.batch_id;
    ELSE
        batch_id := COALESCE(NEW.batch_id, OLD.batch_id);
    END IF;

    -- Only proceed if there's a batch_id
    IF batch_id IS NOT NULL THEN
        -- Count jobs in the batch
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status IN ('completed', 'failed', 'cancelled') THEN 1 END) as processed,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        INTO total_jobs, processed_jobs, failed_jobs, pending_jobs
        FROM jobs 
        WHERE batch_id = batch_id;

        -- Calculate progress
        IF total_jobs > 0 THEN
            progress := (processed_jobs::DECIMAL / total_jobs::DECIMAL) * 100;
        ELSE
            progress := 0;
        END IF;

        -- Update the batch
        UPDATE job_batches 
        SET 
            total_jobs = total_jobs,
            processed_jobs = processed_jobs,
            failed_jobs = failed_jobs,
            pending_jobs = pending_jobs,
            progress = progress,
            status = CASE 
                WHEN pending_jobs = 0 AND processed_jobs > 0 THEN 'completed'
                WHEN failed_jobs > 0 AND pending_jobs = 0 THEN 'failed'
                WHEN processed_jobs > 0 OR pending_jobs > 0 THEN 'running'
                ELSE 'pending'
            END,
            updated_at = NOW()
        WHERE id = batch_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update batch progress when jobs change
CREATE TRIGGER update_batch_progress_on_job_change
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_job_batch_progress();

-- Function to create failed job record when job fails
CREATE OR REPLACE FUNCTION create_failed_job_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create failed job record if status changed to 'failed'
    IF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
        INSERT INTO failed_jobs (
            job_id,
            organization_id,
            job_type,
            job_name,
            payload,
            error_message,
            error_details,
            failed_at,
            retry_count,
            max_retries,
            metadata
        ) VALUES (
            NEW.id,
            NEW.organization_id,
            NEW.job_type,
            NEW.job_name,
            NEW.payload,
            COALESCE(NEW.error_message, 'Job failed without specific error message'),
            NEW.error_details,
            NEW.failed_at,
            NEW.attempts,
            NEW.max_attempts,
            NEW.metadata
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create failed job record
CREATE TRIGGER create_failed_job_on_failure
    AFTER UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION create_failed_job_record();

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample job batches
INSERT INTO job_batches (id, organization_id, batch_name, total_jobs, pending_jobs, status, progress) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Email Campaign Batch 1', 10, 10, 'pending', 0.00),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Report Generation Batch 1', 5, 5, 'pending', 0.00),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Data Sync Batch 1', 3, 3, 'pending', 0.00);

-- Insert sample jobs
INSERT INTO jobs (id, organization_id, job_type, job_name, payload, status, priority, batch_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'email', 'Send Welcome Email', '{"to": "user@example.com", "subject": "Welcome", "template": "welcome"}', 'completed', 'normal', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'email', 'Send Follow-up Email', '{"to": "user@example.com", "subject": "Follow-up", "template": "followup"}', 'pending', 'normal', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'report_generation', 'Generate Monthly Report', '{"report_type": "monthly", "period": "2024-01"}', 'running', 'high', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'data_sync', 'Sync Customer Data', '{"source": "crm", "target": "database"}', 'failed', 'urgent', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample failed jobs
INSERT INTO failed_jobs (id, job_id, organization_id, job_type, job_name, payload, error_message, error_details, failed_at, retry_count, max_retries) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'data_sync', 'Sync Customer Data', '{"source": "crm", "target": "database"}', 'Connection timeout to CRM system', '{"error_code": "TIMEOUT", "retry_after": 300}', NOW() - INTERVAL '1 hour', 3, 3);

-- Insert sample third party API logs
INSERT INTO third_party_api_log (id, organization_id, api_name, endpoint, method, request_payload, response_payload, status_code, response_time, status, is_success) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'WhatsApp API', 'https://api.whatsapp.com/send', 'POST', '{"to": "+1234567890", "message": "Hello"}', '{"success": true, "message_id": "msg123"}', 200, 150, 'success', true),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Email Service API', 'https://api.emailservice.com/send', 'POST', '{"to": "user@example.com", "subject": "Test"}', '{"error": "Invalid API key"}', 401, 50, 'failed', false);

-- Insert sample webhooks
INSERT INTO webhooks (id, organization_id, webhook_name, webhook_url, event_type, status, is_active, secret, headers, max_retries, timeout) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', 'Case Created Webhook', 'https://example.com/webhooks/case-created', 'case_created', 'active', true, 'webhook_secret_123', '{"Authorization": "Bearer token123"}', 3, 30),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', 'Document Uploaded Webhook', 'https://example.com/webhooks/document-uploaded', 'document_uploaded', 'active', true, 'webhook_secret_456', '{"X-API-Key": "key456"}', 5, 60);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_api_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
CREATE POLICY "Users can view jobs in their organization" ON jobs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create jobs in their organization" ON jobs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update jobs in their organization" ON jobs
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for job_batches table
CREATE POLICY "Users can view job batches in their organization" ON job_batches
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create job batches in their organization" ON job_batches
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update job batches in their organization" ON job_batches
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for failed_jobs table
CREATE POLICY "Users can view failed jobs in their organization" ON failed_jobs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update failed jobs in their organization" ON failed_jobs
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for third_party_api_log table
CREATE POLICY "Users can view API logs in their organization" ON third_party_api_log
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create API logs in their organization" ON third_party_api_log
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for webhooks table
CREATE POLICY "Users can view webhooks in their organization" ON webhooks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create webhooks in their organization" ON webhooks
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update webhooks in their organization" ON webhooks
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can delete webhooks in their organization" ON webhooks
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE jobs IS 'Background job queue for processing asynchronous tasks';
COMMENT ON TABLE job_batches IS 'Batches of related jobs for bulk processing';
COMMENT ON TABLE failed_jobs IS 'Failed job records for error tracking and resolution';
COMMENT ON TABLE third_party_api_log IS 'Logs of third-party API calls for monitoring and debugging';
COMMENT ON TABLE webhooks IS 'Webhook configurations for external system integrations';

COMMENT ON COLUMN jobs.job_type IS 'Type of job (email, sms, whatsapp, etc.)';
COMMENT ON COLUMN jobs.payload IS 'Job-specific data and parameters';
COMMENT ON COLUMN jobs.status IS 'Current status of the job';
COMMENT ON COLUMN jobs.priority IS 'Job priority level';
COMMENT ON COLUMN jobs.attempts IS 'Number of execution attempts';
COMMENT ON COLUMN jobs.max_attempts IS 'Maximum number of attempts before marking as failed';
COMMENT ON COLUMN jobs.available_at IS 'When the job becomes available for processing';
COMMENT ON COLUMN jobs.batch_id IS 'Optional batch this job belongs to';

COMMENT ON COLUMN job_batches.progress IS 'Completion percentage (0-100)';
COMMENT ON COLUMN job_batches.total_jobs IS 'Total number of jobs in this batch';
COMMENT ON COLUMN job_batches.pending_jobs IS 'Number of pending jobs';
COMMENT ON COLUMN job_batches.processed_jobs IS 'Number of completed jobs';
COMMENT ON COLUMN job_batches.failed_jobs IS 'Number of failed jobs';

COMMENT ON COLUMN failed_jobs.error_message IS 'Human-readable error message';
COMMENT ON COLUMN failed_jobs.error_details IS 'Structured error details (JSON)';
COMMENT ON COLUMN failed_jobs.stack_trace IS 'Full stack trace for debugging';
COMMENT ON COLUMN failed_jobs.is_resolved IS 'Whether this failure has been resolved';
COMMENT ON COLUMN failed_jobs.resolution IS 'Resolution notes or steps taken';

COMMENT ON COLUMN third_party_api_log.response_time IS 'API response time in milliseconds';
COMMENT ON COLUMN third_party_api_log.is_success IS 'Whether the API call was successful';
COMMENT ON COLUMN third_party_api_log.retry_count IS 'Number of retry attempts';

COMMENT ON COLUMN webhooks.event_type IS 'Type of event that triggers this webhook';
COMMENT ON COLUMN webhooks.secret IS 'Secret key for webhook authentication';
COMMENT ON COLUMN webhooks.headers IS 'Additional headers to send with webhook';
COMMENT ON COLUMN webhooks.timeout IS 'Webhook timeout in seconds';
COMMENT ON COLUMN webhooks.failure_count IS 'Number of consecutive failures';
