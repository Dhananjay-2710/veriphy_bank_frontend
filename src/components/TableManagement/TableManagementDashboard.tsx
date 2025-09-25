// =============================================================================
// TABLE MANAGEMENT DASHBOARD
// =============================================================================
// This dashboard provides access to all table management interfaces

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  Package, 
  Building2, 
  CheckSquare, 
  Bell, 
  FileText, 
  Settings,
  Shield,
  Workflow,
  AlertTriangle,
  BarChart3,
  Grid3X3,
  List,
  Search,
  TestTube
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { UserRole, TableName, getAccessibleTables } from '../../types/permissions';
import { UniversalCrudService } from '../../services/universal-crud-service';

// Import table managers
import { ProductsTableManager } from './ProductsTableManager';
import { DepartmentsTableManager } from './DepartmentsTableManager';
import { TasksTableManager } from './TasksTableManager';
import { NotificationsTableManager } from './NotificationsTableManager';
import { TableOperationsTester } from './TableOperationsTester';

// =============================================================================
// INTERFACES
// =============================================================================

interface TableInfo {
  name: TableName;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'core' | 'configuration' | 'advanced' | 'system';
  priority: number;
}

// =============================================================================
// TABLE CONFIGURATIONS
// =============================================================================

const TABLE_CONFIGS: TableInfo[] = [
  // Core Business Tables
  {
    name: 'organizations',
    displayName: 'Organizations',
    description: 'Manage organizations and their settings',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-blue-500',
    category: 'core',
    priority: 1
  },
  {
    name: 'users',
    displayName: 'Users',
    description: 'Manage user accounts and permissions',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-green-500',
    category: 'core',
    priority: 2
  },
  {
    name: 'customers',
    displayName: 'Customers',
    description: 'Manage customer information and profiles',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-purple-500',
    category: 'core',
    priority: 3
  },
  {
    name: 'cases',
    displayName: 'Cases',
    description: 'Manage loan applications and cases',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-orange-500',
    category: 'core',
    priority: 4
  },
  {
    name: 'documents',
    displayName: 'Documents',
    description: 'Manage document uploads and verification',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-indigo-500',
    category: 'core',
    priority: 5
  },
  {
    name: 'products',
    displayName: 'Products',
    description: 'Manage loan products and terms',
    icon: <Package className="h-5 w-5" />,
    color: 'bg-teal-500',
    category: 'core',
    priority: 6
  },
  {
    name: 'departments',
    displayName: 'Departments',
    description: 'Manage organizational departments',
    icon: <Building2 className="h-5 w-5" />,
    color: 'bg-cyan-500',
    category: 'core',
    priority: 7
  },
  {
    name: 'tasks',
    displayName: 'Tasks',
    description: 'Manage tasks and assignments',
    icon: <CheckSquare className="h-5 w-5" />,
    color: 'bg-emerald-500',
    category: 'core',
    priority: 8
  },
  {
    name: 'notifications',
    displayName: 'Notifications',
    description: 'Manage system notifications',
    icon: <Bell className="h-5 w-5" />,
    color: 'bg-pink-500',
    category: 'core',
    priority: 9
  },
  
  // Configuration Tables
  {
    name: 'document_types',
    displayName: 'Document Types',
    description: 'Configure document type requirements',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-slate-500',
    category: 'configuration',
    priority: 10
  },
  {
    name: 'roles',
    displayName: 'Roles',
    description: 'Manage user roles and permissions',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-500',
    category: 'configuration',
    priority: 11
  },
  {
    name: 'permissions',
    displayName: 'Permissions',
    description: 'Configure system permissions',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-rose-500',
    category: 'configuration',
    priority: 12
  },
  {
    name: 'task_types',
    displayName: 'Task Types',
    description: 'Configure task categories and types',
    icon: <CheckSquare className="h-5 w-5" />,
    color: 'bg-lime-500',
    category: 'configuration',
    priority: 13
  },
  {
    name: 'employment_types',
    displayName: 'Employment Types',
    description: 'Manage employment type classifications',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-amber-500',
    category: 'configuration',
    priority: 14
  },
  {
    name: 'system_settings',
    displayName: 'System Settings',
    description: 'Configure system-wide settings',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-gray-500',
    category: 'configuration',
    priority: 15
  },
  
  // Advanced Features
  {
    name: 'workflow_stages',
    displayName: 'Workflow Stages',
    description: 'Configure workflow stages and transitions',
    icon: <Workflow className="h-5 w-5" />,
    color: 'bg-violet-500',
    category: 'advanced',
    priority: 16
  },
  {
    name: 'workflow_transitions',
    displayName: 'Workflow Transitions',
    description: 'Manage workflow state transitions',
    icon: <Workflow className="h-5 w-5" />,
    color: 'bg-fuchsia-500',
    category: 'advanced',
    priority: 17
  },
  {
    name: 'compliance_issues',
    displayName: 'Compliance Issues',
    description: 'Track and manage compliance issues',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'bg-yellow-500',
    category: 'advanced',
    priority: 18
  },
  {
    name: 'approval_queues',
    displayName: 'Approval Queues',
    description: 'Manage approval workflows and queues',
    icon: <CheckSquare className="h-5 w-5" />,
    color: 'bg-sky-500',
    category: 'advanced',
    priority: 19
  },
  {
    name: 'feature_flags',
    displayName: 'Feature Flags',
    description: 'Manage feature toggles and flags',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-stone-500',
    category: 'advanced',
    priority: 20
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TableManagementDashboard() {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [accessibleTables, setAccessibleTables] = useState<TableName[]>([]);
  const [tableStats, setTableStats] = useState<Record<string, number>>({});
  
  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    if (user?.role) {
      const userRole = user.role as UserRole;
      const accessible = UniversalCrudService.getAccessibleTables(userRole);
      setAccessibleTables(accessible);
    }
  }, [user?.role]);
  
  useEffect(() => {
    loadTableStats();
  }, [accessibleTables]);
  
  // =============================================================================
  // DATA LOADING
  // =============================================================================
  
  const loadTableStats = async () => {
    if (!user?.role) return;
    
    const stats: Record<string, number> = {};
    
    for (const table of accessibleTables) {
      try {
        const options = {
          userRole: user.role as UserRole,
          userId: user.id,
          organizationId: user.organizationId,
          departmentId: user.departmentId,
          pagination: { page: 1, limit: 1 }
        };
        
        const result = await UniversalCrudService.read(table, options);
        stats[table] = result.total;
      } catch (error) {
        console.error(`Error loading stats for ${table}:`, error);
        stats[table] = 0;
      }
    }
    
    setTableStats(stats);
  };
  
  // =============================================================================
  // FILTERING AND SEARCH
  // =============================================================================
  
  const filteredTables = TABLE_CONFIGS.filter(table => {
    const matchesSearch = table.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || table.category === selectedCategory;
    const isAccessible = accessibleTables.includes(table.name);
    
    return matchesSearch && matchesCategory && isAccessible;
  }).sort((a, b) => a.priority - b.priority);
  
  const categories = [
    { key: 'all', label: 'All Tables', count: filteredTables.length },
    { key: 'core', label: 'Core Business', count: TABLE_CONFIGS.filter(t => t.category === 'core' && accessibleTables.includes(t.name)).length },
    { key: 'configuration', label: 'Configuration', count: TABLE_CONFIGS.filter(t => t.category === 'configuration' && accessibleTables.includes(t.name)).length },
    { key: 'advanced', label: 'Advanced Features', count: TABLE_CONFIGS.filter(t => t.category === 'advanced' && accessibleTables.includes(t.name)).length }
  ];
  
  // =============================================================================
  // RENDER TABLE COMPONENT
  // =============================================================================
  
  const renderTableComponent = () => {
    if (!selectedTable) return null;
    
    switch (selectedTable) {
      case 'products':
        return <ProductsTableManager />;
      case 'departments':
        return <DepartmentsTableManager />;
      case 'tasks':
        return <TasksTableManager />;
      case 'notifications':
        return <NotificationsTableManager />;
      case 'test_operations':
        return <TableOperationsTester />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Table Management Coming Soon
              </h3>
              <p className="text-gray-600">
                The {selectedTable} table management interface is under development.
              </p>
            </div>
          </div>
        );
    }
  };
  
  // =============================================================================
  // RENDER
  // =============================================================================
  
  if (selectedTable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedTable(null)}
            >
              ← Back to Tables
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {TABLE_CONFIGS.find(t => t.name === selectedTable)?.displayName}
              </h1>
              <p className="text-gray-600">
                {TABLE_CONFIGS.find(t => t.name === selectedTable)?.description}
              </p>
            </div>
          </div>
        </div>
        {renderTableComponent()}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600">Manage all database tables with full CRUD operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={loadTableStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button 
            onClick={() => setSelectedTable('test_operations' as TableName)}
            variant="outline"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Operations
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {categories.map(category => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tables Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTables.map(table => (
          <Card
            key={table.name}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTable(table.name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${table.color} text-white`}>
                  {table.icon}
                </div>
                <Badge variant="secondary">
                  {tableStats[table.name] || 0} records
                </Badge>
              </div>
              <CardTitle className="text-lg">{table.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{table.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {table.category}
                </Badge>
                <Button size="sm" variant="outline">
                  Manage →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Tables Found
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No tables match "${searchTerm}"` 
                : 'No tables available for your role'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
