# Veriphy Bank Database Documentation

## Overview

This database layer is designed for Veriphy Bank, a fintech banking system that handles loan processing, KYC compliance, document management, and WhatsApp integration. The database is built on PostgreSQL with a focus on security, scalability, and performance.

## Architecture

### Core Modules

1. **User & Authentication**
   - User management with role-based access control
   - Session management and security
   - Audit logging for all user actions

2. **Customer Management**
   - Customer profiles with KYC information
   - Risk profiling and assessment
   - Document verification tracking

3. **Account & Banking**
   - Multiple account types (savings, current, loan, etc.)
   - Real-time balance tracking
   - Transaction management with double-entry bookkeeping

4. **Case Management**
   - Loan application processing
   - Document collection and verification
   - Approval workflow management

5. **Compliance & Security**
   - Comprehensive audit trails
   - Security alerts and monitoring
   - Regulatory compliance reporting

## Database Schema

### Key Tables

- **users**: System users (staff, admins, auditors)
- **customers**: Bank customers with KYC information
- **accounts**: Bank accounts with balance tracking
- **transactions**: All financial transactions
- **cases**: Loan applications and processing cases
- **documents**: Document management and verification
- **compliance_logs**: Audit and compliance tracking
- **whatsapp_messages**: WhatsApp communication logs

### Security Features

- All sensitive data encrypted at rest
- Comprehensive audit logging
- Role-based access control
- Session management
- Security alerts system
- Soft deletes for data retention

## Installation & Setup

### Prerequisites

- PostgreSQL 13 or higher
- 8GB+ RAM recommended
- SSD storage for optimal performance

### 1. Database Setup

```bash
# Create database
createdb veriphy_bank

# Connect to database
psql veriphy_bank
```

### 2. Run Migrations

Execute the migration files in order:

```bash
# 1. Create initial schema
psql veriphy_bank -f database/migrations/001_create_initial_schema.sql

# 2. Insert initial data
psql veriphy_bank -f database/migrations/002_insert_initial_data.sql

# 3. Create functions and triggers
psql veriphy_bank -f database/migrations/003_create_functions_and_triggers.sql
```

### 3. Apply Optimizations (Optional)

For production environments:

```bash
# Apply partitioning strategy
psql veriphy_bank -f database/optimizations/partitioning_strategy.sql

# Apply performance tuning
psql veriphy_bank -f database/optimizations/performance_tuning.sql
```

### 4. Verify Installation

```sql
-- Check if all tables are created
\dt

-- Check if functions are created
\df

-- Check if indexes are created
\di

-- Run health check
SELECT * FROM database_health_check();
```

## Configuration

### Environment Variables

Set these environment variables for your application:

```bash
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/veriphy_bank

# Application settings
APP_ENV=production
LOG_LEVEL=info
SESSION_SECRET=your-secret-key

# Security settings
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret
```

### PostgreSQL Configuration

For production, update `postgresql.conf`:

```ini
# Memory settings
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Connection settings
max_connections = 200

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 4GB

# Logging
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_lock_waits = on
```

## Usage Examples

### Basic Operations

```sql
-- Get account balance
SELECT * FROM get_cached_account_balance(1);

-- Get transaction history
SELECT * FROM get_optimized_transaction_history(1, 50, 0);

-- Create new customer
INSERT INTO users (email, password_hash, first_name, last_name, phone)
VALUES ('customer@example.com', crypt('password123', gen_salt('bf')), 'John', 'Doe', '+91-9876543210');

-- Create customer profile
INSERT INTO customers (user_id, pan_number, aadhaar_number, date_of_birth, gender, employment_type)
VALUES (1, 'ABCDE1234F', '123456789012', '1990-01-01', 'male', 'salaried');
```

### Advanced Queries

See `database/examples/common_queries.sql` for comprehensive query examples including:
- Account management
- Transaction processing
- Case management
- Document verification
- Compliance reporting
- Performance monitoring

## Performance Optimization

### Partitioning Strategy

The database uses table partitioning for high-volume tables:

- **transactions**: Partitioned by month
- **audit_logs**: Partitioned by month
- **compliance_logs**: Partitioned by month

### Indexing Strategy

- Primary indexes on all foreign keys
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Covering indexes for frequently accessed data

### Materialized Views

- `mv_account_summary`: Pre-computed account information
- `mv_transaction_summary`: Daily transaction aggregations
- `mv_case_metrics`: Case processing statistics

### Maintenance

```sql
-- Refresh materialized views
SELECT refresh_all_materialized_views();

-- Create new partitions
SELECT create_monthly_partitions();

-- Clean up old data
SELECT drop_old_partitions(12); -- Keep 12 months

-- Run routine maintenance
SELECT perform_routine_maintenance();
```

## Security Best Practices

### Data Encryption

- All passwords hashed with bcrypt
- Sensitive data encrypted at rest
- Document files encrypted before storage

### Access Control

- Role-based permissions system
- Principle of least privilege
- Regular access reviews

### Audit Trail

- All data changes logged
- User action tracking
- Compliance reporting

### Monitoring

```sql
-- Check security alerts
SELECT * FROM security_alerts WHERE status = 'open';

-- Monitor user activity
SELECT * FROM audit_logs WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';

-- Check for suspicious activity
SELECT * FROM get_suspicious_activity_report();
```

## Backup & Recovery

### Backup Strategy

```bash
# Full database backup
pg_dump veriphy_bank > veriphy_bank_backup.sql

# Compressed backup
pg_dump veriphy_bank | gzip > veriphy_bank_backup.sql.gz

# Continuous archiving (WAL)
pg_basebackup -D /backup/veriphy_bank -Ft -z -P
```

### Recovery

```bash
# Restore from backup
psql veriphy_bank < veriphy_bank_backup.sql

# Point-in-time recovery
pg_restore -d veriphy_bank veriphy_bank_backup.sql
```

## Monitoring & Maintenance

### Health Checks

```sql
-- Database health check
SELECT * FROM database_health_check();

-- Performance metrics
SELECT * FROM performance_metrics;

-- Table bloat analysis
SELECT * FROM get_table_bloat();

-- Slow query analysis
SELECT * FROM get_slow_queries(1000);
```

### Regular Maintenance Tasks

1. **Daily**
   - Refresh materialized views
   - Clean up expired sessions
   - Monitor security alerts

2. **Weekly**
   - Analyze table statistics
   - Check for table bloat
   - Review slow queries

3. **Monthly**
   - Create new partitions
   - Drop old partitions
   - Full database analysis

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check PostgreSQL service status
   - Verify connection parameters
   - Check firewall settings

2. **Performance Issues**
   - Run `EXPLAIN ANALYZE` on slow queries
   - Check index usage
   - Monitor system resources

3. **Data Issues**
   - Check audit logs
   - Verify referential integrity
   - Run data validation queries

### Support

For technical support:
- Check PostgreSQL logs: `/var/log/postgresql/`
- Monitor system resources: `htop`, `iostat`
- Review application logs
- Contact database administrator

## API Integration

### Connection String

```javascript
const connectionString = 'postgresql://username:password@localhost:5432/veriphy_bank';
```

### Example Queries in Application

```javascript
// Get account balance
const balance = await db.query('SELECT * FROM get_cached_account_balance($1)', [accountId]);

// Create transaction
const transaction = await db.query(`
  INSERT INTO transactions (account_id, transaction_type_id, amount, description)
  VALUES ($1, $2, $3, $4)
  RETURNING *
`, [accountId, typeId, amount, description]);

// Get case documents
const documents = await db.query(`
  SELECT * FROM documents WHERE case_id = $1 AND deleted_at IS NULL
`, [caseId]);
```

## Contributing

### Database Changes

1. Create migration files in `database/migrations/`
2. Update documentation
3. Test changes thoroughly
4. Review with team

### Naming Conventions

- Tables: `snake_case`, plural
- Columns: `snake_case`
- Functions: `snake_case`
- Indexes: `idx_tablename_columnname`

## License

This database schema is part of the Veriphy Bank project and is proprietary software.
