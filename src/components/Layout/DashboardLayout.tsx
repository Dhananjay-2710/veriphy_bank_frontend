// components/Layout/DashboardLayout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumbs } from "./Breadcrumbs";
import { SoftLogoutModal } from "../ui/SoftLogoutModal";
import { useAuth } from "../../contexts/AuthContextFixed";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSoftLogoutModal, setShowSoftLogoutModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse hidden lg:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 hidden lg:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500 hidden lg:block"></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 relative z-10">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogoutClick={() => setShowSoftLogoutModal(true)}
        />
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-4 sm:px-6 py-3">
          <Breadcrumbs />
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>

      {/* Soft Logout Modal - Rendered at layout level */}
      <SoftLogoutModal
        isOpen={showSoftLogoutModal}
        onClose={() => setShowSoftLogoutModal(false)}
        onSwitchUser={() => navigate('/login?switch=true')}
      />
    </div>
  );
}
