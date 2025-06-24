import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", icon: "🏠", id: "dashboard", adminOnly: true },
  { title: "Students", icon: "🧑‍🎓", id: "students", adminOnly: true },
  { title: "Attendance", icon: "📅", id: "attendance", adminOnly: true },
  { title: "Fee Tracking", icon: "💳", id: "fees", adminOnly: true },
  { title: "Notes", icon: "📖", id: "notes", adminOnly: false },
  { title: "Announcements", icon: "📢", id: "announcements", adminOnly: false },
  { title: "Memories", icon: "🎞️", id: "memories", adminOnly: false },
];

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { isAdmin } = useAuth();

  return (
    <aside className="min-h-screen w-64 bg-white bg-gradient-to-b from-blue-50 via-white to-white shadow-xl rounded-r-3xl flex flex-col p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 rounded-2xl p-3 shadow-lg">
          <span className="text-white text-3xl">🎓</span>
          </div>
          <div>
          <div className="font-extrabold text-xl text-blue-900">Mihir Classes</div>
          <div className="text-xs text-gray-500 font-medium">{isAdmin ? "Admin Panel" : "Management System"}</div>
        </div>
      </div>
      <div className="border-b border-gray-200 mb-4"></div>
      <div className="text-xs font-semibold text-gray-500 mb-2">Menu</div>
      <nav className="flex flex-col gap-1">
        {menuItems.map(item => (
          <button
            key={item.id}
                    onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-base font-medium
              ${activeSection === item.id ? 'bg-blue-100 text-blue-700 font-bold shadow border-l-4 border-blue-500' : 'hover:bg-gray-100 text-gray-700'}
              ${item.adminOnly && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={item.adminOnly && !isAdmin}
                  >
            <span className="text-xl">{item.icon}</span>
            <span>{item.title}</span>
                      {item.adminOnly && (
              <span className="ml-auto text-gray-400 text-xs">🔒</span>
            )}
          </button>
              ))}
      </nav>
    </aside>
  );
}
