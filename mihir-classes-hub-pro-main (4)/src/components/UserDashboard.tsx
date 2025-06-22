import { StudentAnalytics } from "./StudentAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Announcements } from "./Announcements";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function UserDashboard() {
  const { user, logout } = useAuth();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [announcements] = useLocalStorage("mihir-announcements", []);
  const [readIds, setReadIds] = useLocalStorage("mihir-announcements-read", []);

  // Find unread announcements
  const unread = announcements.filter((a: any) => !readIds.includes(a.id));

  // Mark all as read when opening announcements
  useEffect(() => {
    if (showAnnouncements && announcements.length > 0) {
      setReadIds(announcements.map((a: any) => a.id));
    }
  }, [showAnnouncements, announcements, setReadIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setShowAnnouncements(true)} aria-label="Announcements">
                <span className="relative">
                  <Bell className="w-6 h-6" />
                  {unread.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
                  )}
                </span>
              </Button>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAnnouncements ? (
          <div>
            <div className="mb-4">
              <Button variant="outline" onClick={() => setShowAnnouncements(false)}>
                ← Back to Dashboard
              </Button>
            </div>
            <Announcements readOnly />
          </div>
        ) : (
          <StudentAnalytics />
        )}
      </div>
    </div>
  );
}
