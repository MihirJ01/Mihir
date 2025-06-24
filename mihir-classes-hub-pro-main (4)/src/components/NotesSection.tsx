import { useState } from "react";
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
  const { data: notes, addItem, deleteItem } = useSupabaseData("notes", { column: "created_at", ascending: false });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedBoard, setSelectedBoard] = useState("all");
  const { toast } = useToast();

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    class: "",
    board: "",
    subject: "",
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes Section</h2>
          <p className="text-gray-600">Manage study notes for CBSE and State Board</p>
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
      </div>

      <div className="flex gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBoard} onValueChange={setSelectedBoard}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Board" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            <SelectItem value="CBSE">CBSE</SelectItem>
            <SelectItem value="State Board">State Board</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold">{note.title}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteItem(note.id)} className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <div className="flex gap-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Class {note.class}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{note.board}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{note.subject}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 line-clamp-4 whitespace-pre-line">{renderNoteContent(note.content)}</div>
              <p className="text-sm text-gray-500 mt-3">Created: {note.created_date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
