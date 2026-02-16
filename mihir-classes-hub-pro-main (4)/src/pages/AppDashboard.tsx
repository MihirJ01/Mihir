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
import { Memories } from "@/components/Memories";

const AppDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggedIn, isAdmin, isUser, logout, loading, loginWithGoogle, authError, clearAuthError } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-blue-700 font-semibold">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <LoginPanel loginWithGoogle={loginWithGoogle} authError={authError} clearAuthError={clearAuthError} />;
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
      case "fee-tracking":
        return (
          <ProtectedRoute requireAdmin>
            <FeeTracking />
          </ProtectedRoute>
        );
      case "notes":
        return <NotesSection />;
      case "announcements":
        return <Announcements />;
      case "memories":
        return <Memories />;
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
        <div className={`
          ${isMobile 
            ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' 
            : 'sticky top-0 h-screen'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}>
          <AppSidebar activeSection={activeSection} setActiveSection={(section) => {
            setActiveSection(section);
            if (isMobile) setSidebarOpen(false);
          }} />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <header className="w-full bg-gradient-to-r from-blue-50 via-white to-white shadow-sm py-6 px-8 rounded-b-3xl mb-6">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 block sm:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-7 h-7 text-blue-700" />
                </Button>
              )}
              <span className="text-blue-600 text-3xl">🎓</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight">
                  Mihir Classes <span className="font-light">- Admin Panel</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {/* Removed: <span className="text-gray-500 text-base">Complete Class Management System</span> */}
                  {/* Removed: <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full ml-2">Welcome, {user?.name}</span> */}
                </div>
              </div>
              <Button onClick={logout} variant="outline" className="gap-2 text-xs lg:text-sm ml-auto">
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Section headers for other pages can be added similarly in their respective components */}
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