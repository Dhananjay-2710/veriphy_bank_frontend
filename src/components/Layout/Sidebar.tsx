import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield,
  CheckCircle,
  Clock,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({  }: SidebarProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* You can put a spinner or skeleton loader here */}
        <div className="p-6 text-gray-400">Loading...</div>
      </aside>
    );
  }

  const getMenuItems = () => {
    if (!user) {
      return []; // Return an empty array if there's no user
    }
    console.log("User role in Sidebar:", user.role);
    switch (user.role) {
      case 'super-admin':
      return [
        { id: 'dashboard', label: 'Master Dashboard', icon: Home },
        { id: 'user-management', label: 'User Management', icon: Users },
        { id: 'all-orgs', label: 'Organizations', icon: Users },
        { id: 'settings', label: 'Global Settings', icon: Shield },
        { id: 'audit', label: 'System Audit', icon: FileText },
        { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
      ];
      case 'salesperson':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'cases', label: 'My Cases', icon: FileText },
          { id: 'document-manager', label: 'Document Manager', icon: FileText },
          { id: 'communicator', label: 'Customer Chat', icon: MessageCircle },
          { id: 'workload', label: 'Workload Planner', icon: Calendar },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'team', label: 'Team Oversight', icon: Users },
          { id: 'cases', label: 'All Cases', icon: FileText },
          { id: 'document-manager', label: 'Document Manager', icon: FileText },
          { id: 'communicator', label: 'Customer Chat', icon: MessageCircle },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ];
      case 'credit-ops':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'approval-queue', label: 'Approval Queue', icon: CheckCircle },
          { id: 'compliance-reports', label: 'Compliance Reports', icon: BarChart3 },
          { id: 'compliance-review', label: 'Compliance Review', icon: Shield },
          { id: 'pending-reviews', label: 'Pending Reviews', icon: Clock },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'user-management', label: 'User Management', icon: Users },
          { id: 'system-settings', label: 'System Settings', icon: Shield },
          { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-semibold">VERIPHY</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Secure Document Workflow</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.id);
            // const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md
                    transition-colors duration-200
                    ${isActive 
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
            // return (
            //   <li key={item.id}>
            //     <button
            //       onClick={() => setActiveView(item.id)}
            //       className={`
            //         w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left
            //         transition-colors duration-200
            //         ${isActive 
            //           ? 'bg-blue-600 text-white' 
            //           : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            //         }
            //       `}
            //     >
            //       <Icon className="h-5 w-5" />
            //       <span className="font-medium">{item.label}</span>
            //     </button>
            //   </li>
            // );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">
          <p>Secure • Compliant • Encrypted</p>
          <p className="mt-1">© 2025 Happy Bank of India</p>
        </div>
      </div>
    </aside>
  );
}