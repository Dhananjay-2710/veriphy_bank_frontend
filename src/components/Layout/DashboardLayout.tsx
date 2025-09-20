// components/Layout/DashboardLayout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "../../contexts/AuthContextFixed";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar changes based on role */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
