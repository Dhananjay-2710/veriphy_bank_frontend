// =============================================================================
// NAVIGATION CONSTANTS & ROUTE DEFINITIONS
// =============================================================================

import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield,
  CheckCircle,
  Clock,
  MessageCircle,
  Settings,
  Database,
  Workflow,
  Building,
  Layers,
  AlertTriangle,
  UserCheck,
  Zap,
  FileType,
  Activity,
  GitBranch,
  Monitor,
  UserCog,
  Key,
  Package,
  Link
} from 'lucide-react';

// =============================================================================
// ROUTE DEFINITIONS
// =============================================================================

export const ROUTES = {
  // Main Routes
  HOME: '/',
  LOGIN: '/login',
  
  // Dashboard Routes
  DASHBOARD: '/',
  
  // Case Management Routes
  CASES: '/cases',
  CASE_DETAIL: '/case/:caseId',
  
  // Document Management Routes
  DOCUMENT_MANAGER: '/document-manager',
  DOCUMENT_MANAGER_CASE: '/document-manager/:caseId',
  
  // Communication Routes
  COMMUNICATOR: '/communicator',
  
  // Workload Management Routes
  WORKLOAD: '/workload',
  WORKLOAD_MANAGEMENT: '/workload-management',
  
  // Team Management Routes
  TEAM: '/team',
  
  // Approval Routes
  APPROVAL_QUEUE: '/approval-queue',
  APPROVAL_QUEUE_NEW: '/approval-queue-new',
  
  // Compliance Routes
  COMPLIANCE_REVIEW: '/compliance-review',
  COMPLIANCE_REPORTS: '/compliance-reports',
  PENDING_REVIEWS: '/pending-reviews',
  
  // Admin Routes
  USER_MANAGEMENT: '/user-management',
  SYSTEM_SETTINGS: '/system-settings',
  SYSTEM_SETTINGS_NEW: '/system-settings-new',
  ORGANIZATION_SETTINGS: '/organization-settings',
  AUDIT_LOGS: '/audit-logs',
  ANALYTICS: '/analytics',
  
  // Feature Management Routes
  FEATURE_FLAGS: '/feature-flags',
  SYSTEM_INTEGRATIONS: '/system-integrations',
  
  // New Admin Management Routes
  LOAN_APPLICATION_MANAGEMENT: '/admin/loan-applications',
  TASK_CATEGORY_MANAGEMENT: '/admin/task-categories',
  COMPLIANCE_ISSUE_MANAGEMENT: '/admin/compliance-issues',
  USER_PROFILE_MANAGEMENT: '/admin/user-profiles',
  WORKFLOW_MANAGEMENT: '/admin/workflow',
  BACKGROUND_PROCESSING: '/admin/background-processing',
  CACHE_MANAGEMENT: '/admin/cache-management',
  ENTITY_MANAGEMENT: '/admin/entities',
  
  // Enhanced Super Admin Routes
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  WORKFLOW_DESIGNER: '/super-admin/workflow-designer',
  ADVANCED_USER_MANAGEMENT: '/super-admin/users',
  SYSTEM_MONITORING: '/super-admin/monitoring',
} as const;

// =============================================================================
// NAVIGATION ITEM INTERFACE
// =============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  roles: string[];
  description?: string;
  children?: NavigationItem[];
  isExternal?: boolean;
  isNew?: boolean;
  badge?: string;
}

// =============================================================================
// ROLE-BASED NAVIGATION MENUS
// =============================================================================

export const NAVIGATION_MENUS: Record<string, NavigationItem[]> = {
  'super-admin': [
    {
      id: 'dashboard',
      label: 'Super Admin Dashboard',
      icon: Activity,
      path: ROUTES.SUPER_ADMIN_DASHBOARD,
      roles: ['super-admin'],
      description: 'Real-time system overview and analytics',
      isNew: true
    },
    {
      id: 'system-monitoring',
      label: 'System Monitoring',
      icon: Monitor,
      path: ROUTES.SYSTEM_MONITORING,
      roles: ['super-admin'],
      description: 'Real-time system performance monitoring',
      isNew: true
    },
    {
      id: 'user-management',
      label: 'Advanced User Management',
      icon: UserCog,
      path: ROUTES.ADVANCED_USER_MANAGEMENT,
      roles: ['super-admin'],
      description: 'Advanced user management with bulk operations',
      isNew: true
    },
    {
      id: 'workflow-designer',
      label: 'Workflow Designer',
      icon: GitBranch,
      path: ROUTES.WORKFLOW_DESIGNER,
      roles: ['super-admin'],
      description: 'Design and manage business workflows',
      isNew: true
    },
    {
      id: 'organizations',
      label: 'Organizations',
      icon: Building,
      path: '/super-admin/organizations',
      roles: ['super-admin'],
      description: 'Manage all organizations'
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Layers,
      path: '/super-admin/departments',
      roles: ['super-admin'],
      description: 'Manage all departments'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/super-admin/customers',
      roles: ['super-admin'],
      description: 'Manage all customers'
    },
    {
      id: 'system-settings',
      label: 'Global Settings',
      icon: Shield,
      path: ROUTES.SYSTEM_SETTINGS,
      roles: ['super-admin', 'admin'],
      description: 'System-wide configuration'
    },
    {
      id: 'audit-logs',
      label: 'System Audit',
      icon: FileText,
      path: ROUTES.AUDIT_LOGS,
      roles: ['super-admin', 'admin', 'auditor'],
      description: 'System audit logs and compliance'
    },
    {
      id: 'super-admin-audit-logs',
      label: 'Super Admin Audit Logs',
      icon: Shield,
      path: '/super-admin/audit-logs',
      roles: ['super-admin'],
      description: 'Comprehensive audit logs for Super Admin operations',
      isNew: true
    },
    {
      id: 'analytics',
      label: 'Global Analytics',
      icon: BarChart3,
      path: ROUTES.ANALYTICS,
      roles: ['super-admin', 'admin', 'manager'],
      description: 'System-wide analytics and reporting'
    },
    {
      id: 'admin-tools',
      label: 'Admin Tools',
      icon: Settings,
      path: '/admin',
      roles: ['super-admin', 'admin'],
      description: 'Advanced administrative tools',
      children: [
        {
          id: 'loan-applications',
          label: 'Loan Applications',
          icon: FileText,
          path: ROUTES.LOAN_APPLICATION_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Manage loan applications'
        },
        {
          id: 'task-categories',
          label: 'Task Categories',
          icon: Layers,
          path: ROUTES.TASK_CATEGORY_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Manage task categories'
        },
        {
          id: 'compliance-issues',
          label: 'Compliance Issues',
          icon: AlertTriangle,
          path: ROUTES.COMPLIANCE_ISSUE_MANAGEMENT,
          roles: ['super-admin', 'admin', 'compliance'],
          description: 'Track and manage compliance issues'
        },
        {
          id: 'user-profiles',
          label: 'User Profiles',
          icon: UserCheck,
          path: ROUTES.USER_PROFILE_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Manage user profiles and accounts'
        },
        {
          id: 'workflow-management',
          label: 'Workflow Management',
          icon: Workflow,
          path: ROUTES.WORKFLOW_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Configure workflows and processes'
        },
        {
          id: 'background-processing',
          label: 'Background Processing',
          icon: Zap,
          path: ROUTES.BACKGROUND_PROCESSING,
          roles: ['super-admin', 'admin'],
          description: 'Monitor background jobs and processes'
        },
        {
          id: 'cache-management',
          label: 'Cache Management',
          icon: Database,
          path: ROUTES.CACHE_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Manage application caching'
        },
        {
          id: 'entity-management',
          label: 'Entity Management',
          icon: Settings,
          path: ROUTES.ENTITY_MANAGEMENT,
          roles: ['super-admin', 'admin'],
          description: 'Manage system entities'
        }
      ]
    }
  ],

          'admin': [
            {
              id: 'dashboard',
              label: 'Admin Dashboard',
              icon: Home,
              path: ROUTES.DASHBOARD,
              roles: ['admin'],
              description: 'Admin dashboard overview'
            },
            {
              id: 'department-management',
              label: 'Department Management',
              icon: Building,
              path: '/admin/departments',
              roles: ['admin'],
              description: 'Manage organizational departments'
            },
            {
              id: 'roles-management',
              label: 'Roles Management',
              icon: Shield,
              path: '/admin/roles',
              roles: ['admin'],
              description: 'Manage user roles and permissions'
            },
            {
              id: 'permissions-management',
              label: 'Permissions Management',
              icon: Key,
              path: '/admin/permissions',
              roles: ['admin'],
              description: 'Configure system permissions'
            },
            {
              id: 'products-management',
              label: 'Products Management',
              icon: Package,
              path: '/admin/products',
              roles: ['admin'],
              description: 'Manage loan products and configurations'
            },
            {
              id: 'sub-products-management',
              label: 'Sub-Products Management',
              icon: Layers,
              path: '/admin/sub-products',
              roles: ['admin'],
              description: 'Manage sub-products and variants'
            },
            {
              id: 'document-types-management',
              label: 'Document Types Management',
              icon: FileType,
              path: '/admin/document-types',
              roles: ['admin'],
              description: 'Manage document types and configurations'
            },
            {
              id: 'documents-management',
              label: 'Documents Management',
              icon: FileText,
              path: '/admin/documents',
              roles: ['admin'],
              description: 'Manage system-wide documents and verification'
            },
            {
              id: 'product-document-mapping',
              label: 'Product Document Mapping',
              icon: Link,
              path: '/admin/product-document-mapping',
              roles: ['admin'],
              description: 'Manage document requirements for products and sub-products'
            },
            {
              id: 'audit-logs',
              label: 'Audit Logs',
              icon: FileText,
              path: ROUTES.AUDIT_LOGS,
              roles: ['admin'],
              description: 'Organization audit logs'
            }
          ],

  'manager': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      roles: ['manager'],
      description: 'Manager dashboard'
    },
    {
      id: 'team',
      label: 'Team Oversight',
      icon: Users,
      path: ROUTES.TEAM,
      roles: ['manager'],
      description: 'Manage team members'
    },
    {
      id: 'team-management',
      label: 'Team Management',
      icon: UserCog,
      path: '/team-management',
      roles: ['manager'],
      description: 'Advanced team management'
    },
    {
      id: 'cases',
      label: 'All Cases',
      icon: FileText,
      path: ROUTES.CASES,
      roles: ['manager'],
      description: 'View all team cases'
    },
    {
      id: 'document-manager',
      label: 'Document Manager',
      icon: FileType,
      path: ROUTES.DOCUMENT_MANAGER,
      roles: ['manager'],
      description: 'Manage documents'
    },
    {
      id: 'communicator',
      label: 'Customer Chat',
      icon: MessageCircle,
      path: ROUTES.COMMUNICATOR,
      roles: ['manager'],
      description: 'Customer communication'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: ROUTES.ANALYTICS,
      roles: ['manager'],
      description: 'Team performance analytics'
    },
    {
      id: 'analytics-dashboard',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      path: '/analytics-dashboard',
      roles: ['manager'],
      description: 'Advanced analytics dashboard'
    }
  ],

  'salesperson': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      roles: ['salesperson'],
      description: 'Personal dashboard'
    },
    {
      id: 'cases',
      label: 'My Cases',
      icon: FileText,
      path: ROUTES.CASES,
      roles: ['salesperson'],
      description: 'My assigned cases'
    },
    {
      id: 'document-manager',
      label: 'Document Manager',
      icon: FileType,
      path: ROUTES.DOCUMENT_MANAGER,
      roles: ['salesperson'],
      description: 'Manage case documents'
    },
    {
      id: 'communicator',
      label: 'Customer Chat',
      icon: MessageCircle,
      path: ROUTES.COMMUNICATOR,
      roles: ['salesperson'],
      description: 'Customer communication'
    },
    {
      id: 'workload',
      label: 'Workload Planner',
      icon: Calendar,
      path: ROUTES.WORKLOAD,
      roles: ['salesperson'],
      description: 'Plan and manage workload'
    },
    {
      id: 'workload-management',
      label: 'Workload Management',
      icon: Calendar,
      path: ROUTES.WORKLOAD_MANAGEMENT,
      roles: ['salesperson'],
      description: 'Advanced workload management'
    }
  ],

  'credit-ops': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      roles: ['credit-ops'],
      description: 'Credit operations dashboard'
    },
    {
      id: 'approval-queue',
      label: 'Approval Queue',
      icon: CheckCircle,
      path: ROUTES.APPROVAL_QUEUE,
      roles: ['credit-ops'],
      description: 'Review and approve applications'
    },
    {
      id: 'approval-queue-new',
      label: 'Approval Queue (New)',
      icon: CheckCircle,
      path: ROUTES.APPROVAL_QUEUE_NEW,
      roles: ['credit-ops'],
      description: 'Enhanced approval queue interface'
    },
    {
      id: 'compliance-reports',
      label: 'Compliance Reports',
      icon: BarChart3,
      path: ROUTES.COMPLIANCE_REPORTS,
      roles: ['credit-ops', 'compliance'],
      description: 'Generate compliance reports'
    },
    {
      id: 'compliance-review',
      label: 'Compliance Review',
      icon: Shield,
      path: ROUTES.COMPLIANCE_REVIEW,
      roles: ['credit-ops', 'compliance'],
      description: 'Review compliance issues'
    },
    {
      id: 'pending-reviews',
      label: 'Pending Reviews',
      icon: Clock,
      path: ROUTES.PENDING_REVIEWS,
      roles: ['credit-ops'],
      description: 'Items pending review'
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: FileText,
      path: ROUTES.CASES,
      roles: ['credit-ops'],
      description: 'View and manage cases'
    }
  ],

  'compliance': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      roles: ['compliance'],
      description: 'Compliance dashboard'
    },
    {
      id: 'compliance-issues',
      label: 'Compliance Issues',
      icon: AlertTriangle,
      path: ROUTES.COMPLIANCE_ISSUE_MANAGEMENT,
      roles: ['compliance', 'admin'],
      description: 'Track compliance issues'
    },
    {
      id: 'compliance-reports',
      label: 'Compliance Reports',
      icon: BarChart3,
      path: ROUTES.COMPLIANCE_REPORTS,
      roles: ['compliance', 'credit-ops'],
      description: 'Generate compliance reports'
    },
    {
      id: 'compliance-review',
      label: 'Compliance Review',
      icon: Shield,
      path: ROUTES.COMPLIANCE_REVIEW,
      roles: ['compliance', 'credit-ops'],
      description: 'Review compliance issues'
    },
    {
      id: 'pending-reviews',
      label: 'Pending Reviews',
      icon: Clock,
      path: ROUTES.PENDING_REVIEWS,
      roles: ['compliance'],
      description: 'Items pending compliance review'
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: FileText,
      path: ROUTES.CASES,
      roles: ['compliance'],
      description: 'View and review cases'
    }
  ],

  'auditor': [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: ROUTES.DASHBOARD,
      roles: ['auditor'],
      description: 'Auditor dashboard'
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileText,
      path: ROUTES.AUDIT_LOGS,
      roles: ['auditor', 'admin', 'super-admin'],
      description: 'System audit logs'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: ROUTES.ANALYTICS,
      roles: ['auditor'],
      description: 'Audit analytics'
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: FileText,
      path: ROUTES.CASES,
      roles: ['auditor'],
      description: 'View and audit cases'
    },
    {
      id: 'system-health',
      label: 'System Health',
      icon: Monitor,
      path: '/system-health',
      roles: ['auditor'],
      description: 'Monitor system health and performance'
    }
  ]
};

// =============================================================================
// NAVIGATION UTILITIES
// =============================================================================

export const getNavigationForRole = (role: string): NavigationItem[] => {
  return NAVIGATION_MENUS[role] || [];
};

export const getNavigationItem = (role: string, itemId: string): NavigationItem | null => {
  const menu = getNavigationForRole(role);
  const findItem = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.id === itemId) return item;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findItem(menu);
};

export const isRouteAccessible = (role: string, path: string): boolean => {
  const menu = getNavigationForRole(role);
  const checkPath = (items: NavigationItem[]): boolean => {
    return items.some(item => {
      if (item.path === path) return true;
      if (item.children) return checkPath(item.children);
      return false;
    });
  };
  return checkPath(menu);
};

// =============================================================================
// BREADCRUMB UTILITIES
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: any;
}

export const getBreadcrumbs = (role: string, currentPath: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' }
  ];

  const menu = getNavigationForRole(role);
  
  const findPath = (items: NavigationItem[], parentPath: string = ''): boolean => {
    for (const item of items) {
      const fullPath = parentPath + item.path;
      if (fullPath === currentPath) {
        breadcrumbs.push({
          label: item.label,
          path: fullPath,
          icon: item.icon
        });
        return true;
      }
      if (item.children) {
        const childFound = findPath(item.children, fullPath);
        if (childFound) {
          breadcrumbs.push({
            label: item.label,
            path: fullPath,
            icon: item.icon
          });
          return true;
        }
      }
    }
    return false;
  };

  findPath(menu);
  return breadcrumbs;
};

// =============================================================================
// NAVIGATION STATE MANAGEMENT
// =============================================================================

export interface NavigationState {
  currentPath: string;
  previousPath: string;
  breadcrumbs: BreadcrumbItem[];
  isNavigating: boolean;
  navigationHistory: string[];
}

export const initialNavigationState: NavigationState = {
  currentPath: '/',
  previousPath: '',
  breadcrumbs: [{ label: 'Home', path: '/' }],
  isNavigating: false,
  navigationHistory: ['/']
};
