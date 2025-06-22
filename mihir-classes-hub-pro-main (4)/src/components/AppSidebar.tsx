import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Megaphone,
  GraduationCap,
  Lock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
    adminOnly: true,
  },
  {
    title: "Students",
    icon: Users,
    id: "students",
    adminOnly: true,
  },
  {
    title: "Attendance",
    icon: Calendar,
    id: "attendance",
    adminOnly: true,
  },
  {
    title: "Fee Tracking",
    icon: CreditCard,
    id: "fees",
    adminOnly: true,
  },
  {
    title: "Notes (Class 1-8)",
    icon: BookOpen,
    id: "notes",
    adminOnly: false,
  },
  {
    title: "Announcements",
    icon: Megaphone,
    id: "announcements",
    adminOnly: false,
  },
];

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { isAdmin } = useAuth();

  return (
    <Sidebar className="border-r border-gray-200 h-screen flex flex-col">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">Mihir Classes</h2>
            <p className="text-sm text-gray-600">
              {isAdmin ? "Admin Panel" : "Management System"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-semibold">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full justify-start transition-colors ${
                      activeSection === item.id 
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600" 
                        : "hover:bg-gray-100"
                    } ${item.adminOnly && !isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={item.adminOnly && !isAdmin}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex items-center gap-2">
                      {item.title}
                      {item.adminOnly && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
