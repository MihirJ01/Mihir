import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Megaphone, Plus, Download, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetClass?: string;
  targetBoard?: "CBSE" | "State Board";
  priority: "low" | "medium" | "high";
  createdDate: string;
  isGeneral: boolean;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>("mihir-announcements", []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const { toast } = useToast();

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetClass: "",
    targetBoard: "",
    priority: "",
    isGeneral: true,
  });

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.priority) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      targetClass: newAnnouncement.isGeneral ? undefined : newAnnouncement.targetClass,
      targetBoard: newAnnouncement.isGeneral ? undefined : newAnnouncement.targetBoard as "CBSE" | "State Board",
      priority: newAnnouncement.priority as "low" | "medium" | "high",
      createdDate: new Date().toISOString().split('T')[0],
      isGeneral: newAnnouncement.isGeneral,
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      title: "",
      content: "",
      targetClass: "",
      targetBoard: "",
      priority: "",
      isGeneral: true,
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: "Announcement created successfully!",
    });
  };

  const filteredAnnouncements = filterPriority && filterPriority !== "all"
    ? announcements.filter(announcement => announcement.priority === filterPriority)
    : announcements;

  const handleExportToExcel = () => {
    const announcementData = announcements.map(announcement => ({
      Title: announcement.title,
      Content: announcement.content,
      TargetClass: announcement.targetClass || "General",
      TargetBoard: announcement.targetBoard || "All",
      Priority: announcement.priority,
      CreatedDate: announcement.createdDate,
      Type: announcement.isGeneral ? "General" : "Specific",
    }));
    
    exportToExcel(announcementData, "Announcements_Data", "announcements");
    toast({
      title: "Success",
      description: "Announcements data exported to Excel successfully!",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-600">Manage class announcements and notifications</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="Enter announcement title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <Textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Enter announcement content..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isGeneral"
                    checked={newAnnouncement.isGeneral}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, isGeneral: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="isGeneral" className="text-sm font-medium text-gray-700">
                    General announcement (for all students)
                  </label>
                </div>

                {!newAnnouncement.isGeneral && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
                      <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetClass: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(num => (
                            <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Board</label>
                      <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetBoard: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="State Board">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button onClick={handleAddAnnouncement} className="w-full">
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                    {announcement.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
                    </span>
                    {announcement.isGeneral ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        <Users className="w-3 h-3 inline mr-1" />
                        General
                      </span>
                    ) : (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        Class {announcement.targetClass} - {announcement.targetBoard}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {announcement.createdDate}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Found</h3>
            <p className="text-gray-600">Start by creating announcements for your students.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
