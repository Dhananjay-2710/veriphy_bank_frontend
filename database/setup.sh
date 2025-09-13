#!/bin/bash

# Veriphy Bank Database Setup Script
# This script sets up the PostgreSQL database for Veriphy Bank

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="veriphy_bank"
DB_USER="veriphy_user"
DB_PASSWORD="veriphy_secure_password_2025"
DB_HOST="localhost"
DB_PORT="5432"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL 13 or higher."
        exit 1
    fi
    
    # Check version
    PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    REQUIRED_VERSION="13.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PG_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "PostgreSQL version $PG_VERSION is too old. Please install PostgreSQL 13 or higher."
        exit 1
    fi
    
    print_success "PostgreSQL $PG_VERSION is installed"
}

# Function to check if database exists
check_database() {
    print_status "Checking if database exists..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Dropping existing database..."
            psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
            print_success "Database dropped"
        else
            print_status "Using existing database"
            return 0
        fi
    fi
}

# Function to create database and user
create_database() {
    print_status "Creating database and user..."
    
    # Create database
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "CREATE DATABASE $DB_NAME;"
    print_success "Database '$DB_NAME' created"
    
    # Create user
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    print_success "User '$DB_USER' created"
    
    # Grant privileges
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "ALTER USER $DB_USER CREATEDB;"
    print_success "Privileges granted"
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Run migrations in order
    for migration in 001_create_initial_schema.sql 002_insert_initial_data.sql 003_create_functions_and_triggers.sql; do
        migration_file="$SCRIPT_DIR/migrations/$migration"
        if [ -f "$migration_file" ]; then
            print_status "Running migration: $migration"
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
            print_success "Migration $migration completed"
        else
            print_error "Migration file not found: $migration_file"
            exit 1
        fi
    done
}

# Function to apply optimizations
apply_optimizations() {
    print_status "Applying database optimizations..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check if optimization files exist
    if [ -f "$SCRIPT_DIR/optimizations/partitioning_strategy.sql" ]; then
        print_status "Applying partitioning strategy..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/optimizations/partitioning_strategy.sql"
        print_success "Partitioning strategy applied"
    fi
    
    if [ -f "$SCRIPT_DIR/optimizations/performance_tuning.sql" ]; then
        print_status "Applying performance tuning..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/optimizations/performance_tuning.sql"
        print_success "Performance tuning applied"
    fi
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if tables exist
    TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    if [ "$TABLE_COUNT" -gt 20 ]; then
        print_success "Database tables created successfully ($TABLE_COUNT tables)"
    else
        print_error "Expected more than 20 tables, found $TABLE_COUNT"
        exit 1
    fi
    
    # Check if functions exist
    FUNCTION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public';")
    
    if [ "$FUNCTION_COUNT" -gt 10 ]; then
        print_success "Database functions created successfully ($FUNCTION_COUNT functions)"
    else
        print_error "Expected more than 10 functions, found $FUNCTION_COUNT"
        exit 1
    fi
    
    # Run health check
    print_status "Running database health check..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM database_health_check();"
    
    print_success "Database installation verified successfully!"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration file..."
    
    cat > .env << EOF
# Veriphy Bank Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Application Configuration
APP_ENV=development
LOG_LEVEL=info
SESSION_SECRET=$(openssl rand -hex 32)

# Security Configuration
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Feature Flags
WHATSAPP_ENABLED=true
AUDIT_LOGGING_ENABLED=true
TWO_FACTOR_AUTH_ENABLED=true
EOF

    print_success "Environment file created: .env"
    print_warning "Please review and update the .env file with your specific configuration"
}

# Function to display connection information
display_connection_info() {
    print_success "Database setup completed successfully!"
    echo
    echo "Connection Information:"
    echo "======================"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "Username: $DB_USER"
    echo "Password: $DB_PASSWORD"
    echo
    echo "Connection String:"
    echo "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo
    echo "Next Steps:"
    echo "==========="
    echo "1. Update your application configuration with the connection details"
    echo "2. Test the connection using: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo "3. Review the database documentation in database/README.md"
    echo "4. Run example queries from database/examples/common_queries.sql"
    echo
}

# Main execution
main() {
    echo "=========================================="
    echo "    Veriphy Bank Database Setup"
    echo "=========================================="
    echo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root. Consider using a non-root user for better security."
    fi
    
    # Check PostgreSQL
    check_postgresql
    
    # Check if database exists
    check_database
    
    # Create database if needed
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        create_database
    fi
    
    # Run migrations
    run_migrations
    
    # Ask about optimizations
    read -p "Do you want to apply performance optimizations? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apply_optimizations
    fi
    
    # Verify installation
    verify_installation
    
    # Create environment file
    create_env_file
    
    # Display connection information
    display_connection_info
}

# Run main function
main "$@"
