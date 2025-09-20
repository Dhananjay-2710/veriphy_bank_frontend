# 🗄️ Database Documentation

This folder contains all documentation related to the Veriphy Bank database schema, setup, and management.

## 📁 Files Overview

### Setup and Configuration
- **[README.md](README.md)** - Complete database setup guide
- **[DATABASE_INTEGRATION_SUMMARY.md](DATABASE_INTEGRATION_SUMMARY.md)** - Integration status overview

### Schema Documentation
- **[SCHEMA_SUMMARY.md](SCHEMA_SUMMARY.md)** - Complete database schema overview
- **[COMPLETE_SCHEMA_SUMMARY.md](COMPLETE_SCHEMA_SUMMARY.md)** - Detailed schema v2 documentation
- **[SCHEMA_V2_SUMMARY.md](SCHEMA_V2_SUMMARY.md)** - Schema v2 summary
- **[erd.md](erd.md)** - Entity Relationship Diagram

### Data Population
- **[COMPREHENSIVE_INSERT_README.md](COMPREHENSIVE_INSERT_README.md)** - Guide for data insertion
- **[supabase_connection_commands.md](supabase_connection_commands.md)** - Connection setup commands

## 🏗️ Database Schema Overview

The Veriphy Bank database includes **40+ tables** organized into:

### Core Tables (9 Fully Integrated)
- **Users & Authentication**: users, roles, user_roles
- **Business Logic**: cases, customers, documents, tasks
- **System**: logs, notifications

### Partially Integrated (7 Tables)
- **Management**: organizations, departments, permissions
- **Products**: products, sub_products, document_types

### Not Yet Integrated (24 Tables)
- **Workflow Management**: case assignment, approvals, SLA policies
- **File Management**: file storage, document signing
- **System Infrastructure**: caching, job queues, webhooks

## 🚀 Quick Setup Guide

### 1. SQL Editor Method (Recommended)
```bash
# Copy contents of database/setup/complete_database_setup.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

### 2. Node.js Script Method
```bash
cd database
npm install
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
npm run setup
```

## 📊 Schema Features

### Security
- Row Level Security (RLS) policies
- Comprehensive audit trails
- Role-based access control
- Secure session management

### Performance
- Table partitioning by date
- Comprehensive indexing
- Materialized views
- Optimized queries

### Scalability
- Horizontal scaling support
- Connection pooling
- Performance monitoring
- Caching strategies

## 🔧 Key Relationships

1. **Users ↔ Customers** (1:1) - User profiles and customer data
2. **Customers ↔ Cases** (1:many) - Customer loan applications
3. **Cases ↔ Documents** (1:many) - Case documentation
4. **Users ↔ Roles** (many:many) - Role-based permissions

## 📝 Development Guidelines

### Adding New Tables
1. Create migration file in `database/migrations/`
2. Update `SCHEMA_SUMMARY.md` with new schema
3. Add TypeScript interfaces to `src/types/index.ts`
4. Update integration documentation

### Database Changes
1. Never modify existing tables directly
2. Always create migration files
3. Test changes thoroughly
4. Update documentation

### Performance Optimization
1. Add appropriate indexes
2. Consider partitioning for large tables
3. Use proper data types
4. Optimize query performance

## 🛠️ Tools and Scripts

### Migration Files
Located in `database/migrations/`:
- `001_create_initial_schema.sql` - Initial schema
- `002_insert_initial_data.sql` - Sample data
- `003_create_functions_and_triggers.sql` - Database functions

### Setup Scripts
- `complete_database_setup.sql` - Complete setup
- `populate_all_tables.js` - Node.js population script
- `setup.sh` - Linux/Mac setup script

## 🚨 Troubleshooting

### Common Issues
1. **"Table doesn't exist"** - Run complete setup script
2. **Permission denied** - Check RLS policies
3. **Performance issues** - Review indexing strategy
4. **Data not showing** - Verify RLS allows access

### Debug Steps
1. Check Supabase logs
2. Verify environment variables
3. Test with Database Test component
4. Review RLS policies

## 📈 Monitoring and Maintenance

### Regular Tasks
- Monitor table sizes and performance
- Review and optimize slow queries
- Update indexes as needed
- Archive old data appropriately

### Health Checks
- Verify all tables exist and have data
- Check RLS policies are working
- Monitor query performance
- Review audit logs regularly

---

This documentation ensures the database is properly documented, maintained, and optimized for the Veriphy Bank application.