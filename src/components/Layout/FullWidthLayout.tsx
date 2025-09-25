// components/Layout/FullWidthLayout.tsx
import React from "react";
import { Header } from "./Header";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContextFixed";
import { 
  Users, 
  Settings, 
  Activity, 
  Database, 
  BarChart3,
  Monitor,
  Shield,
  Workflow
} from "lucide-react";

interface FullWidthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showQuickActions?: boolean;
}

export function FullWidthLayout({ 
  children, 
  showHeader = true, 
  showQuickActions = true 
}: FullWidthLayoutProps) {
  const { user } = useAuth();

  const quickActions = [
    {
      label: "User Management",
      icon: Users,
      href: "/advanced-user-management",
      description: "Manage users across all organizations"
    },
    {
      label: "System Health",
      icon: Monitor,
      href: "/system-monitoring",
      description: "Monitor system performance"
    },
    {
      label: "Workflow Designer",
      icon: Workflow,
      href: "/workflow-designer",
      description: "Design business workflows"
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      description: "System analytics and reports"
    },
    {
      label: "Audit Logs",
      icon: Activity,
      href: "/audit-logs",
      description: "System audit trails"
    },
    {
      label: "Database",
      icon: Database,
      href: "#database",
      description: "Database management tools"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Optional Header */}
      {showHeader && (
        <>
          <Header />
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  System-wide management and monitoring
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {user?.role?.toUpperCase()}
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  SUPER ADMIN
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            {showQuickActions && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (action.href.startsWith('#')) {
                          // Handle special actions
                          return;
                        }
                        window.location.href = action.href;
                      }}
                      className="flex items-center space-x-2 whitespace-nowrap hover:bg-blue-50 hover:border-blue-300"
                      title={action.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Full-width main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
