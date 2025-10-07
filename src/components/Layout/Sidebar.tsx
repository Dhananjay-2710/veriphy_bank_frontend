import { useAuth } from '../../contexts/AuthContextFixed';
import { Link, useLocation } from "react-router-dom";
import { getNavigationForRole, NavigationItem } from '../../constants/navigation';
import veriphyLogo from '../../assets/images/veriphy.io.png';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ }: SidebarProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <aside className="w-64 h-full backdrop-blur-xl bg-white/10 border-r border-white/20 text-white flex flex-col">
        {/* You can put a spinner or skeleton loader here */}
        <div className="p-6 text-blue-200">Loading...</div>
      </aside>
    );
  }

  const getMenuItems = (): NavigationItem[] => {
    if (!user) {
      return []; // Return an empty array if there's no user
    }
    return getNavigationForRole(user.role || '');
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 h-full backdrop-blur-xl bg-white/10 border-r border-white/20 text-white flex flex-col">
      <div className="p-6 border-b border-white/20">
        <div className="flex flex-col items-center">
          <img 
            src={veriphyLogo} 
            alt="Veriphy Logo" 
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain mb-2"
          />
          <p className="text-xs text-blue-200/80 text-center">Secure Document Workflow</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <li key={item.id}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-blue-200">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ul className="ml-4 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                        
                        return (
                          <li key={child.id}>
                            <Link
                              to={child.path}
                              className={`
                                w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm
                                transition-colors duration-200
                                ${isChildActive 
                                  ? "bg-blue-500/30 text-white backdrop-blur-sm"
                                  : "text-blue-200/80 hover:bg-white/10 hover:text-white"}
                              `}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span className="font-medium">{child.label}</span>
                              {child.isNew && (
                                <span className="ml-auto bg-green-500/30 text-xs px-2 py-1 rounded-full backdrop-blur-sm">New</span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md
                      transition-colors duration-200
                      ${isActive 
                        ? "bg-blue-500/30 text-white backdrop-blur-sm"
                        : "text-blue-200/80 hover:bg-white/10 hover:text-white"}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-auto bg-green-500/30 text-xs px-2 py-1 rounded-full backdrop-blur-sm">New</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="text-xs text-blue-200/80">
          <p>Secure • Compliant • Encrypted</p>
          <p className="mt-1">© 2025 Happy Bank of India</p>
        </div>
      </div>
    </aside>
  );
}