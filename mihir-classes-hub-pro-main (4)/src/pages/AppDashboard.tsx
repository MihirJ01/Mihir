import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { StudentManagement } from "@/components/StudentManagement";
import { AttendanceSystem } from "@/components/AttendanceSystem";
import { FeeTracking } from "@/components/FeeTracking";
import { NotesSection } from "@/components/NotesSection";
import { WorkSystem } from "@/components/WorkSystem";
import { Announcements } from "@/components/Announcements";
import { LoginPanel } from "@/components/LoginPanel";
import { UserDashboard } from "@/components/UserDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AppDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggedIn, isAdmin, isUser, logout, user } = useAuth();
  const isMobile = useIsMobile();

  if (!isLoggedIn) {
    return <LoginPanel />;
  }

  if (isUser && !isAdmin) {
    return <UserDashboard />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <ProtectedRoute requireAdmin>
            <Dashboard onNavigate={setActiveSection} />
          </ProtectedRoute>
        );
      case "students":
        return (
          <ProtectedRoute requireAdmin>
            <StudentManagement />
          </ProtectedRoute>
        );
      case "attendance":
        return (
          <ProtectedRoute requireAdmin>
            <AttendanceSystem />
          </ProtectedRoute>
        );
      case "fees":
        return (
          <ProtectedRoute requireAdmin>
            <FeeTracking />
          </ProtectedRoute>
        );
      case "notes":
        return <NotesSection />;
      case "work":
        return <WorkSystem />;
      case "announcements":
        return <Announcements />;
      default:
        return (
          <ProtectedRoute requireAdmin>
            <Dashboard onNavigate={setActiveSection} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : ''} ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
          <AppSidebar activeSection={activeSection} setActiveSection={(section) => {
            setActiveSection(section);
            if (isMobile) setSidebarOpen(false);
          }} />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b p-4 lg:p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl lg:text-4xl font-bold text-gray-900 mb-1 lg:mb-2">
                    Mihir Classes - Admin Panel
                  </h1>
                  <p className="text-sm lg:text-lg text-gray-600">
                    Complete Class Management System | Welcome, {user?.name}
                  </p>
                </div>
              </div>
              <Button onClick={logout} variant="outline" className="gap-2 text-xs lg:text-sm">
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderActiveSection()}
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AppDashboard; 