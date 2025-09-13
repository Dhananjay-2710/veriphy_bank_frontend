-- Veriphy Bank Database
-- Functions and triggers for business logic and data integrity

-- Function to generate account number
CREATE OR REPLACE FUNCTION generate_account_number(account_type_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(3);
    sequence_num BIGINT;
    account_number VARCHAR(20);
BEGIN
    -- Set prefix based on account type
    CASE account_type_name
        WHEN 'savings' THEN prefix := 'SAV';
        WHEN 'current' THEN prefix := 'CUR';
        WHEN 'fixed_deposit' THEN prefix := 'FD';
        WHEN 'recurring_deposit' THEN prefix := 'RD';
        WHEN 'loan_account' THEN prefix := 'LOAN';
        ELSE prefix := 'ACC';
    END CASE;
    
    -- Get next sequence number for this account type
    SELECT COALESCE(MAX(CAST(SUBSTRING(account_number FROM 4) AS BIGINT)), 0) + 1
    INTO sequence_num
    FROM accounts a
    JOIN account_types at ON a.account_type_id = at.id
    WHERE at.name = account_type_name;
    
    -- Format account number: prefix + 8-digit sequence + check digit
    account_number := prefix || LPAD(sequence_num::TEXT, 8, '0');
    
    RETURN account_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS VARCHAR AS $$
DECLARE
    year_part VARCHAR(4);
    month_part VARCHAR(2);
    sequence_num BIGINT;
    case_number VARCHAR(20);
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
    
    -- Get next sequence number for current month
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 8) AS BIGINT)), 0) + 1
    INTO sequence_num
    FROM cases
    WHERE case_number LIKE 'VB-' || year_part || '-' || month_part || '-%';
    
    case_number := 'VB-' || year_part || '-' || month_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
    account_balance DECIMAL(15,2);
    transaction_amount DECIMAL(15,2);
    is_debit BOOLEAN;
BEGIN
    -- Get transaction details
    SELECT amount, tt.is_debit
    INTO transaction_amount, is_debit
    FROM transactions t
    JOIN transaction_types tt ON t.transaction_type_id = tt.id
    WHERE t.id = NEW.id;
    
    -- Get current balance
    SELECT balance INTO account_balance
    FROM accounts
    WHERE id = NEW.account_id;
    
    -- Update balance based on transaction type
    IF is_debit THEN
        account_balance := account_balance - transaction_amount;
    ELSE
        account_balance := account_balance + transaction_amount;
    END IF;
    
    -- Update account balance
    UPDATE accounts 
    SET balance = account_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.account_id;
    
    -- Update balances table
    INSERT INTO balances (account_id, balance, available_balance, last_updated)
    VALUES (NEW.account_id, account_balance, account_balance, CURRENT_TIMESTAMP)
    ON CONFLICT (account_id) 
    DO UPDATE SET 
        balance = account_balance,
        available_balance = account_balance,
        last_updated = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    user_id_val BIGINT;
BEGIN
    -- Get current user ID from session (in real app, this would come from application context)
    user_id_val := COALESCE(current_setting('app.current_user_id', true)::BIGINT, 0);
    
    -- Convert OLD and NEW records to JSONB
    IF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        new_values := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_values := NULL;
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        user_id_val,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_values,
        new_values,
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to check transaction limits
CREATE OR REPLACE FUNCTION check_transaction_limits(
    p_account_id BIGINT,
    p_amount DECIMAL(15,2),
    p_transaction_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    daily_limit DECIMAL(15,2);
    monthly_limit DECIMAL(15,2);
    daily_total DECIMAL(15,2);
    monthly_total DECIMAL(15,2);
    customer_id_val BIGINT;
BEGIN
    -- Get customer ID
    SELECT customer_id INTO customer_id_val
    FROM accounts
    WHERE id = p_account_id;
    
    -- Get limits from system settings
    SELECT 
        CAST(value AS DECIMAL(15,2)) INTO daily_limit
    FROM system_settings
    WHERE key = 'transaction_limit_daily';
    
    SELECT 
        CAST(value AS DECIMAL(15,2)) INTO monthly_limit
    FROM system_settings
    WHERE key = 'transaction_limit_monthly';
    
    -- Calculate daily total
    SELECT COALESCE(SUM(amount), 0) INTO daily_total
    FROM transactions
    WHERE account_id = p_account_id
    AND created_at >= CURRENT_DATE
    AND status = 'completed';
    
    -- Calculate monthly total
    SELECT COALESCE(SUM(amount), 0) INTO monthly_total
    FROM transactions
    WHERE account_id = p_account_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed';
    
    -- Check limits
    IF (daily_total + p_amount) > daily_limit THEN
        RAISE EXCEPTION 'Daily transaction limit exceeded. Limit: %, Current: %, Attempted: %', 
            daily_limit, daily_total, p_amount;
    END IF;
    
    IF (monthly_total + p_amount) > monthly_limit THEN
        RAISE EXCEPTION 'Monthly transaction limit exceeded. Limit: %, Current: %, Attempted: %', 
            monthly_limit, monthly_total, p_amount;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create security alert
CREATE OR REPLACE FUNCTION create_security_alert(
    p_customer_id BIGINT,
    p_alert_type VARCHAR(50),
    p_severity alert_severity,
    p_description TEXT
)
RETURNS BIGINT AS $$
DECLARE
    alert_id BIGINT;
BEGIN
    INSERT INTO security_alerts (
        customer_id,
        alert_type,
        severity,
        description,
        status,
        created_at
    ) VALUES (
        p_customer_id,
        p_alert_type,
        p_severity,
        p_description,
        'open',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate KYC status
CREATE OR REPLACE FUNCTION validate_kyc_status(p_customer_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    required_docs_count INTEGER;
    verified_docs_count INTEGER;
    kyc_status_val kyc_status;
BEGIN
    -- Get count of required documents
    SELECT COUNT(*) INTO required_docs_count
    FROM documents d
    JOIN document_types dt ON d.document_type_id = dt.id
    JOIN cases c ON d.case_id = c.id
    WHERE c.customer_id = p_customer_id
    AND dt.is_required = true
    AND d.deleted_at IS NULL;
    
    -- Get count of verified documents
    SELECT COUNT(*) INTO verified_docs_count
    FROM documents d
    JOIN document_types dt ON d.document_type_id = dt.id
    JOIN cases c ON d.case_id = c.id
    WHERE c.customer_id = p_customer_id
    AND dt.is_required = true
    AND d.status = 'verified'
    AND d.deleted_at IS NULL;
    
    -- Update KYC status
    IF verified_docs_count = 0 THEN
        kyc_status_val := 'pending';
    ELSIF verified_docs_count < required_docs_count THEN
        kyc_status_val := 'in-progress';
    ELSIF verified_docs_count = required_docs_count THEN
        kyc_status_val := 'verified';
    END IF;
    
    -- Update customer KYC status
    UPDATE customers 
    SET kyc_status = kyc_status_val, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_customer_id;
    
    RETURN kyc_status_val = 'verified';
END;
$$ LANGUAGE plpgsql;

-- Create triggers

-- Trigger to generate account number on account creation
CREATE OR REPLACE FUNCTION trigger_generate_account_number()
RETURNS TRIGGER AS $$
DECLARE
    account_type_name VARCHAR(50);
BEGIN
    SELECT at.name INTO account_type_name
    FROM account_types at
    WHERE at.id = NEW.account_type_id;
    
    NEW.account_number := generate_account_number(account_type_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_account_number_generation
    BEFORE INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_account_number();

-- Trigger to generate case number on case creation
CREATE OR REPLACE FUNCTION trigger_generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.case_number := generate_case_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_case_number_generation
    BEFORE INSERT ON cases
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_case_number();

-- Trigger to update account balance on transaction completion
CREATE TRIGGER trigger_update_balance
    AFTER UPDATE OF status ON transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_account_balance();

-- Trigger to create initial balance record
CREATE OR REPLACE FUNCTION trigger_create_initial_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO balances (account_id, balance, available_balance, last_updated)
    VALUES (NEW.id, NEW.balance, NEW.balance, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initial_balance
    AFTER INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_initial_balance();

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_accounts
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_cases
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_documents
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Trigger to validate KYC status on document verification
CREATE OR REPLACE FUNCTION trigger_validate_kyc()
RETURNS TRIGGER AS $$
DECLARE
    customer_id_val BIGINT;
BEGIN
    -- Get customer ID from case
    SELECT c.customer_id INTO customer_id_val
    FROM cases c
    WHERE c.id = NEW.case_id;
    
    -- Validate KYC status
    PERFORM validate_kyc_status(customer_id_val);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kyc_validation
    AFTER UPDATE OF status ON documents
    FOR EACH ROW
    WHEN (NEW.status = 'verified' AND OLD.status != 'verified')
    EXECUTE FUNCTION trigger_validate_kyc();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get account summary
CREATE OR REPLACE FUNCTION get_account_summary(p_account_id BIGINT)
RETURNS TABLE (
    account_number VARCHAR(20),
    account_type VARCHAR(50),
    balance DECIMAL(15,2),
    available_balance DECIMAL(15,2),
    frozen_amount DECIMAL(15,2),
    status account_status,
    opened_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.account_number,
        at.name as account_type,
        b.balance,
        b.available_balance,
        b.frozen_amount,
        a.status,
        a.opened_at
    FROM accounts a
    JOIN account_types at ON a.account_type_id = at.id
    LEFT JOIN balances b ON a.id = b.account_id
    WHERE a.id = p_account_id
    AND a.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction history
CREATE OR REPLACE FUNCTION get_transaction_history(
    p_account_id BIGINT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    transaction_type VARCHAR(50),
    amount DECIMAL(15,2),
    status transaction_status,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        tt.name as transaction_type,
        t.amount,
        t.status,
        t.description,
        t.created_at,
        t.processed_at
    FROM transactions t
    JOIN transaction_types tt ON t.transaction_type_id = tt.id
    WHERE t.account_id = p_account_id
    AND t.deleted_at IS NULL
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
