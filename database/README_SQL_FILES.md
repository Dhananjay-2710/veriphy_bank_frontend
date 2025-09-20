# 🗄️ SQL Files Organization Guide

This document explains the organized structure of SQL files in the Veriphy Bank database directory.

## 📁 Organized SQL File Structure

```
database/
├── README_SQL_FILES.md              # This file - SQL organization guide
├── migrations/                      # Migration files (unchanged)
│   ├── 001_create_initial_schema.sql
│   ├── 002_insert_initial_data.sql
│   └── 003_create_functions_and_triggers.sql
│   └── 004_create_background_processing_tables.sql
│   └── 005_create_authentication_tables.sql
│   └── 006_create_caching_performance_tables.sql
│   └── 007_create_system_settings_tables.sql
├── schema/                          # Schema definitions
│   ├── 001_create_saas_schema.sql
│   ├── 002_insert_saas_data.sql
│   ├── 003_create_saas_functions.sql
│   ├── 004_add_missing_components.sql
│   └── 005_add_missing_functions.sql
├── data/                            # Data insertion files
│   ├── comprehensive_mock_data_insert.sql
│   ├── comprehensive_mock_data_insert_part2.sql
│   ├── comprehensive_mock_data_insert_final.sql
│   └── insert_mock_data.sql
├── setup/                           # Setup and initialization scripts
│   ├── complete_database_setup.sql
│   ├── execute_comprehensive_data_insert.sql
│   └── run_system_settings_migration.sql
├── optimizations/                   # Performance optimization scripts
│   ├── partitioning_strategy.sql
│   └── performance_tuning.sql
└── examples/                        # Example queries and usage
    └── common_queries.sql
```

## 📊 File Categories

### 🔧 Migrations (`database/migrations/`)
**Purpose**: Database schema changes and migrations

**Files**:
- `001_create_initial_schema.sql` - Initial database schema
- `002_insert_initial_data.sql` - Initial data setup
- `003_create_functions_and_triggers.sql` - Database functions and triggers
- `004_create_background_processing_tables.sql` - Background processing tables
- `005_create_authentication_tables.sql` - Authentication system tables
- `006_create_caching_performance_tables.sql` - Caching and performance tables
- `007_create_system_settings_tables.sql` - System settings tables

**Usage**: Run in sequence to build the complete database schema.

### 🏗️ Schema (`database/schema/`)
**Purpose**: Schema definitions and SaaS-related database structures

**Files**:
- `001_create_saas_schema.sql` - SaaS schema creation
- `002_insert_saas_data.sql` - SaaS data insertion
- `003_create_saas_functions.sql` - SaaS-specific functions
- `004_add_missing_components.sql` - Additional schema components
- `005_add_missing_functions.sql` - Additional database functions

**Usage**: These are the core schema files for the SaaS version of the application.

### 📊 Data (`database/data/`)
**Purpose**: Data insertion and sample data population

**Files**:
- `comprehensive_mock_data_insert.sql` - Main mock data file
- `comprehensive_mock_data_insert_part2.sql` - Additional mock data
- `comprehensive_mock_data_insert_final.sql` - Final data insertion
- `insert_mock_data.sql` - Basic mock data insertion

**Usage**: Populate the database with sample data for testing and development.

### ⚙️ Setup (`database/setup/`)
**Purpose**: Database setup and initialization scripts

**Files**:
- `complete_database_setup.sql` - Complete database setup (recommended)
- `execute_comprehensive_data_insert.sql` - Execute comprehensive data insertion
- `run_system_settings_migration.sql` - System settings migration

**Usage**: Run these to set up a new database instance.

### 🚀 Optimizations (`database/optimizations/`)
**Purpose**: Performance optimization and database tuning

**Files**:
- `partitioning_strategy.sql` - Database partitioning strategy
- `performance_tuning.sql` - Performance tuning scripts

**Usage**: Apply optimizations to improve database performance.

### 📚 Examples (`database/examples/`)
**Purpose**: Example queries and usage patterns

**Files**:
- `common_queries.sql` - Frequently used database queries

**Usage**: Reference for common database operations and patterns.

## 🚀 Quick Start Guide

### Setting Up a New Database

1. **SQL Editor Method (Recommended)**
   ```sql
   -- Copy contents of setup/complete_database_setup.sql
   -- Paste into Supabase SQL Editor
   -- Click "Run"
   ```

2. **Manual Setup Method**
   ```bash
   # Run migration files in order
   # 001_create_initial_schema.sql
   # 002_insert_initial_data.sql
   # 003_create_functions_and_triggers.sql
   # ... continue with remaining migrations
   ```

3. **Populate with Sample Data**
   ```sql
   -- Run files from data/ directory
   -- comprehensive_mock_data_insert.sql
   -- insert_mock_data.sql
   ```

## 🔧 Development Workflow

### Adding New Tables
1. Create migration file in `migrations/` directory
2. Add schema definition to `schema/` directory if needed
3. Update documentation
4. Test with setup scripts

### Adding Sample Data
1. Create data insertion file in `data/` directory
2. Follow naming convention: `descriptive_name.sql`
3. Test with development database
4. Update documentation

### Performance Optimization
1. Add optimization scripts to `optimizations/` directory
2. Test with realistic data volumes
3. Document performance improvements
4. Update setup scripts if needed

## 📝 File Naming Conventions

### Migrations
- `XXX_descriptive_name.sql` (where XXX is sequential number)
- Examples: `001_create_initial_schema.sql`, `002_insert_initial_data.sql`

### Schema Files
- `XXX_descriptive_name.sql` (sequential numbering)
- Examples: `001_create_saas_schema.sql`, `002_insert_saas_data.sql`

### Data Files
- `descriptive_name.sql` (no numbering required)
- Examples: `comprehensive_mock_data_insert.sql`, `insert_mock_data.sql`

### Setup Files
- `descriptive_name.sql` (focus on clarity)
- Examples: `complete_database_setup.sql`, `run_system_settings_migration.sql`

## 🛠️ Tools and Scripts

### Node.js Scripts
- `populate_all_tables.js` - Complete database population
- `execute-system-settings-migration.js` - System settings migration
- `check-and-insert.js` - Data validation and insertion

### Shell Scripts
- `setup.sh` - Linux/Mac setup script
- `run_comprehensive_insert.sh` - Comprehensive data insertion
- `run_mock_data_insert.sh` - Mock data insertion

### Batch/PowerShell Scripts
- `run_comprehensive_insert.ps1` - Windows PowerShell setup
- `run_mock_data_insert.bat` - Windows batch setup

## 🚨 Troubleshooting

### Common Issues
1. **"Table doesn't exist" errors**
   - Check that migrations are run in correct order
   - Verify you're using the correct Supabase project

2. **Permission denied errors**
   - Ensure proper RLS policies are set up
   - Check user permissions in Supabase

3. **Data not showing up**
   - Verify RLS policies allow access
   - Check that data was inserted correctly
   - Refresh the application

### Debug Steps
1. Check Supabase logs for errors
2. Verify environment variables
3. Test with Database Test component
4. Review RLS policies in Supabase dashboard

## 📈 Monitoring and Maintenance

### Regular Tasks
- Monitor table sizes and performance
- Review and optimize slow queries
- Update indexes as data grows
- Archive old data appropriately

### Health Checks
- Verify all tables exist and have expected data
- Check RLS policies are working correctly
- Monitor query performance
- Review audit logs regularly

---

**Last Updated**: September 21, 2025
**Documentation Version**: 1.0

This organization ensures that all SQL files are logically grouped and easy to find for database management tasks.
