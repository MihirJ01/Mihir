import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BookOpen, Plus, Download, FileText, MoreVertical, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import type { Database } from "@/integrations/supabase/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

type Note = Database['public']['Tables']['notes']['Row'];

function renderNoteContent(content: string) {
  // Split by whitespace and newlines, match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{part}</a>
      );
    }
    return part;
  });
}

export function NotesSection() {
  const { data: notes, addItem, deleteItem, refetch } = useSupabaseData("notes", { column: "created_at", ascending: false });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedBoard, setSelectedBoard] = useState("all");
  const { toast } = useToast();
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [dragOverDustbin, setDragOverDustbin] = useState(false);

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    class: "",
    board: "",
    subject: "",
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const isMobile = useIsMobile();
  const [fabOpen, setFabOpen] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content || !newNote.class || !newNote.board || !newNote.subject) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const noteData = {
      title: newNote.title,
      content: newNote.content,
      class: newNote.class,
      board: newNote.board as "CBSE" | "State Board",
      subject: newNote.subject,
    };

    const result = await addItem(noteData);
    
    if (result) {
      setNewNote({
        title: "",
        content: "",
        class: "",
        board: "",
        subject: "",
      });
      setIsAddDialogOpen(false);
      refetch();
    }
  };

  const typedNotes = notes as Note[];
  const filteredNotes = typedNotes.filter(note => {
    const classMatch = selectedClass === "all" || note.class === selectedClass;
    const boardMatch = selectedBoard === "all" || note.board === selectedBoard;
    return classMatch && boardMatch;
  });

  const handleExportToExcel = () => {
    const notesData = typedNotes.map(note => ({
      Title: note.title,
      Class: note.class,
      Board: note.board,
      Subject: note.subject,
      Content: note.content,
      CreatedDate: note.created_date,
    }));
    
    exportToExcel(notesData, "Notes_Data", "notes");
    toast({
      title: "Success",
      description: "Notes data exported to Excel successfully!",
    });
  };

  if (isMobile) {
    return (
      <div className="space-y-6 relative min-h-screen">
        {/* Floating FAB for actions */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="icon" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center" onClick={() => setFabOpen(v => !v)} aria-label="Open actions menu">
            <Plus className="w-8 h-8" />
          </Button>
          {fabOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 animate-fade-in">
              <Button onClick={handleExportToExcel} className="bg-white text-blue-700 border border-blue-200 shadow px-4 py-2 rounded-lg flex items-center gap-2">
                <Download className="w-5 h-5" /> Export to Excel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Note
              </Button>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48 bg-white border border-blue-200 shadow rounded-lg">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-48 bg-white border border-blue-200 shadow rounded-lg">
                  <SelectValue placeholder="All Boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  <SelectItem value="CBSE">CBSE</SelectItem>
                  <SelectItem value="State Board">State Board</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {/* Add Note Dialog (mobile) */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Enter note title"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <Select onValueChange={(value) => setNewNote({...newNote, class: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <Select onValueChange={(value) => setNewNote({...newNote, board: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    value={newNote.subject}
                    onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                    placeholder="Enter subject"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>Content</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowLinkInput(v => !v)} title="Attach Link">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Enter note content..."
                  rows={6}
                />
                {showLinkInput && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={linkValue}
                      onChange={e => setLinkValue(e.target.value)}
                      placeholder="Paste or type a link (https://...)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (linkValue) {
                          setNewNote(n => ({ ...n, content: n.content + (n.content ? "\n" : "") + linkValue }));
                          setLinkValue("");
                          setShowLinkInput(false);
                        }
                      }}
                      disabled={!linkValue}
                    >
                      Attach
                    </Button>
                  </div>
                )}
              </div>

              <Button onClick={handleAddNote} className="w-full">
                Add Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <Card key={note.id} 
              className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 animate-fade-in"
              draggable
              onDragStart={() => setDraggingNoteId(note.id)}
              onDragEnd={() => setDraggingNoteId(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900">
                      <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{note.title}</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">Class {note.class}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{note.board}</span>
                      {note.subject && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{note.subject}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={async () => { await deleteItem(note.id); refetch(); }} className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-800 break-words">
                  {renderNoteContent(note.content)}
                </div>
                <div className="text-xs text-gray-500 mt-2">Created: {note.created_date}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Dustbin for drag-to-delete */}
        {draggingNoteId && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
            onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
            onDragLeave={() => setDragOverDustbin(false)}
            onDrop={async e => {
              setDragOverDustbin(false);
              setDraggingNoteId(null);
              await deleteItem(draggingNoteId);
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
        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
              <p className="text-gray-600">Start by adding some study notes for your classes.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Section Header */}
      <section className="bg-blue-50 rounded-xl px-6 py-4 mb-6 shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span role="img" aria-label="notes">📚</span>
            Notes Section
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage study notes for CBSE and State Board</p>
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
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Enter note title"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <Select onValueChange={(value) => setNewNote({...newNote, class: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9].map(num => (
                          <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                    <Select onValueChange={(value) => setNewNote({...newNote, board: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="State Board">State Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      value={newNote.subject}
                      onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                      placeholder="Enter subject"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    <span>Content</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => setShowLinkInput(v => !v)} title="Attach Link">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Enter note content..."
                    rows={6}
                  />
                  {showLinkInput && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={linkValue}
                        onChange={e => setLinkValue(e.target.value)}
                        placeholder="Paste or type a link (https://...)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (linkValue) {
                            setNewNote(n => ({ ...n, content: n.content + (n.content ? "\n" : "") + linkValue }));
                            setLinkValue("");
                            setShowLinkInput(false);
                          }
                        }}
                        disabled={!linkValue}
                      >
                        Attach
                      </Button>
                    </div>
                  )}
                </div>

                <Button onClick={handleAddNote} className="w-full">
                  Add Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white/80 rounded-2xl shadow p-4 border border-blue-100">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48 rounded-xl border-blue-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm text-blue-900 font-semibold">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBoard} onValueChange={setSelectedBoard}>
          <SelectTrigger className="w-48 rounded-xl border-blue-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm text-blue-900 font-semibold">
            <SelectValue placeholder="All Boards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            <SelectItem value="CBSE">CBSE</SelectItem>
            <SelectItem value="State Board">State Board</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <Card key={note.id} 
            className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 animate-fade-in"
            draggable
            onDragStart={() => setDraggingNoteId(note.id)}
            onDragEnd={() => setDraggingNoteId(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900">
                    <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">Class {note.class}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{note.board}</span>
                    {note.subject && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-xs font-semibold">{note.subject}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={async () => { await deleteItem(note.id); refetch(); }} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-800 break-words">
                {renderNoteContent(note.content)}
              </div>
              <div className="text-xs text-gray-500 mt-2">Created: {note.created_date}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dustbin for drag-to-delete */}
      {draggingNoteId && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
          onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
          onDragLeave={() => setDragOverDustbin(false)}
          onDrop={async e => {
            setDragOverDustbin(false);
            setDraggingNoteId(null);
            await deleteItem(draggingNoteId);
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

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
            <p className="text-gray-600">Start by adding some study notes for your classes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
