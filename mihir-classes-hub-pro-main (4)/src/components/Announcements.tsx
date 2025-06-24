import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Download, Calendar, Users, MoreVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type AnnouncementsProps = {
  readOnly?: boolean;
};

export function Announcements({ readOnly = false }: AnnouncementsProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_class: "",
    target_board: "",
    priority: "",
    is_general: true,
  });
  const [draggingAnnouncementId, setDraggingAnnouncementId] = useState<string | null>(null);
  const [dragOverDustbin, setDragOverDustbin] = useState(false);

  // Use Supabase for announcements
  const {
    data: announcements = [],
    addItem,
    updateItem,
    deleteItem,
    loading,
    refetch,
  } = useSupabaseData("announcements", { column: "created_date", ascending: false });

  // State for editing and deleting
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.priority) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    await addItem({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      target_class: newAnnouncement.is_general ? null : newAnnouncement.target_class,
      target_board: newAnnouncement.is_general ? null : (newAnnouncement.target_board || null),
      priority: newAnnouncement.priority,
      is_general: newAnnouncement.is_general,
      created_date: new Date().toISOString().split('T')[0],
    });
    setNewAnnouncement({
      title: "",
      content: "",
      target_class: "",
      target_board: "",
      priority: "",
      is_general: true,
    });
    setIsAddDialogOpen(false);
    refetch();
  };

  const handleUpdateAnnouncement = async () => {
    if (!editAnnouncement) return;
    if (!editAnnouncement.title || !editAnnouncement.content || !editAnnouncement.priority) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    await updateItem(editAnnouncement.id, {
      title: editAnnouncement.title,
      content: editAnnouncement.content,
      target_class: editAnnouncement.is_general ? null : editAnnouncement.target_class,
      target_board: editAnnouncement.is_general ? null : (editAnnouncement.target_board || null),
      priority: editAnnouncement.priority,
      is_general: editAnnouncement.is_general,
    });
    setEditDialogOpen(false);
    setEditAnnouncement(null);
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteAnnouncementId) return;
    await deleteItem(deleteAnnouncementId);
    setDeleteDialogOpen(false);
    setDeleteAnnouncementId(null);
    refetch();
  };

  const filteredAnnouncements = filterPriority && filterPriority !== "all"
    ? announcements.filter(announcement => announcement.priority === filterPriority)
    : announcements;

  const handleExportToExcel = () => {
    const announcementData = announcements.map(announcement => ({
      Title: announcement.title,
      Content: announcement.content,
      TargetClass: announcement.target_class || "General",
      TargetBoard: announcement.target_board || "All",
      Priority: announcement.priority,
      CreatedDate: announcement.created_date,
      Type: announcement.is_general ? "General" : "Specific",
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-6">
      {/* Enhanced Section Header */}
      <section className="bg-blue-50 rounded-xl px-6 py-4 mb-6 shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span role="img" aria-label="announcements">📢</span>
            Announcements
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage class announcements and notifications</p>
        </div>
        {!readOnly && (
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
                      checked={newAnnouncement.is_general}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, is_general: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="isGeneral" className="text-sm font-medium text-gray-700">
                    General announcement (for all students)
                  </label>
                </div>
                  {!newAnnouncement.is_general && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
                        <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, target_class: value})}>
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
                        <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, target_board: value})}>
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
        )}
      </section>
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white/80 rounded-2xl shadow p-4 border border-blue-100">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48 rounded-xl border-blue-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm text-blue-900 font-semibold">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Announcements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filteredAnnouncements.map(announcement => (
          <Card key={announcement.id} 
            className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 animate-fade-in"
            draggable={!readOnly}
            onDragStart={() => !readOnly && setDraggingAnnouncementId(announcement.id)}
            onDragEnd={() => !readOnly && setDraggingAnnouncementId(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900">
                    <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{announcement.title}</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>{announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority</span>
                    {announcement.target_class && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">Class {announcement.target_class}</span>}
                    {announcement.target_board && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{announcement.target_board}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  {!readOnly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={async () => { await deleteItem(announcement.id); refetch(); }} className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-800 break-words whitespace-pre-line">{announcement.content}</div>
              <div className="text-xs text-gray-500 mt-2">Created: {announcement.created_date}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Dustbin for drag-to-delete */}
      {draggingAnnouncementId && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
          onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
          onDragLeave={() => setDragOverDustbin(false)}
          onDrop={async e => {
            setDragOverDustbin(false);
            setDraggingAnnouncementId(null);
            await deleteItem(draggingAnnouncementId);
            refetch();
          }}
          style={{ pointerEvents: "all" }}
        >
          <div className={`bg-white shadow-lg rounded-full p-4 border-2 ${dragOverDustbin ? "border-red-600" : "border-gray-300"}`}>
            <span role="img" aria-label="delete" className={`text-4xl ${dragOverDustbin ? "text-red-600" : "text-gray-500"}`}>🗑️</span>
          </div>
          <span className="mt-2 text-sm font-semibold text-gray-700">Drop here to delete</span>
        </div>
      )}
      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Found</h3>
            <p className="text-gray-600">Start by creating announcements for your students.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Announcement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Announcement</DialogTitle>
          </DialogHeader>
          {editAnnouncement && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={editAnnouncement.title}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <Textarea
                  value={editAnnouncement.content}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select value={editAnnouncement.priority} onValueChange={value => setEditAnnouncement({ ...editAnnouncement, priority: value })}>
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
                  id="isGeneralEdit"
                  checked={editAnnouncement.is_general}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, is_general: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="isGeneralEdit" className="text-sm font-medium text-gray-700">
                  General announcement (for all students)
                </label>
              </div>
              {!editAnnouncement.is_general && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
                    <Select value={editAnnouncement.target_class || ""} onValueChange={value => setEditAnnouncement({ ...editAnnouncement, target_class: value })}>
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
                    <Select value={editAnnouncement.target_board || ""} onValueChange={value => setEditAnnouncement({ ...editAnnouncement, target_board: value })}>
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
              <Button onClick={handleUpdateAnnouncement} className="w-full">Update Announcement</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAnnouncement}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
