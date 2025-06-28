import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, Users, Download, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  class: string;
  board: string;
  batch_time: string;
  username: string;
  password: string;
  fee_amount: number;
  term_type: string;
  created_at: string;
  profile_photo_url: string;
  phone?: string;
}

const BATCH_TIMES = [
  "7:30-9:30",
  "9:30-11:30", 
  "3:00-5:00"
];

export function StudentManagement() {
  const { data: studentsData, loading, addItem, updateItem, deleteItem, refetch: refetchStudents } = useSupabaseData("students", { column: "created_at", ascending: false });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [editProfilePhoto, setEditProfilePhoto] = useState<File | null>(null);
  const [editProfilePhotoUrl, setEditProfilePhotoUrl] = useState<string>("");
  const [editUploading, setEditUploading] = useState(false);
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [dragOverDustbin, setDragOverDustbin] = useState(false);
  const [editingField, setEditingField] = useState<{studentId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");

  const students = studentsData as Student[];

  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    board: "",
    batch_time: "",
    fee_amount: "",
    term_type: "",
    username: "",
    password: "",
  });

  // Remove auto-set term type based on board selection
  const handleBoardChange = (board: string) => {
    setNewStudent({
      ...newStudent, 
      board
    });
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.class || !newStudent.board || !newStudent.batch_time || !newStudent.fee_amount || !newStudent.term_type || !newStudent.username || !newStudent.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including batch time",
        variant: "destructive",
      });
      return;
    }

    // Check if username already exists
    if (students.some(student => student.username === newStudent.username)) {
      toast({
        title: "Error",
        description: "Username already exists. Please choose a different username.",
        variant: "destructive",
      });
      return;
    }

    const studentData = {
      name: newStudent.name,
      class: newStudent.class,
      board: newStudent.board as "CBSE" | "State Board",
      batch_time: newStudent.batch_time,
      username: newStudent.username,
      password: newStudent.password,
      fee_amount: parseInt(newStudent.fee_amount),
      term_type: newStudent.term_type as "2 months" | "3 months" | "4 months",
      profile_photo_url: profilePhotoUrl || "",
    };

    const result = await addItem(studentData);
    
    if (result) {
      setNewStudent({
        name: "",
        class: "",
        board: "",
        batch_time: "",
        fee_amount: "",
        term_type: "",
        username: "",
        password: "",
      });
      setIsAddDialogOpen(false);
      refetchStudents();
      toast({
        title: "Success",
        description: `${newStudent.name} has been added successfully.`,
      });
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;

    const updates = {
      name: editingStudent.name,
      class: editingStudent.class,
      board: editingStudent.board,
      batch_time: editingStudent.batch_time,
      fee_amount: editingStudent.fee_amount,
      term_type: editingStudent.term_type,
      profile_photo_url: editProfilePhotoUrl || editingStudent.profile_photo_url || "",
    };

    const result = await updateItem(editingStudent.id, updates);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      setEditProfilePhoto(null);
      setEditProfilePhotoUrl("");
      refetchStudents();
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      const result = await deleteItem(studentId);
      if (result) {
        toast({
          title: "Success",
          description: `${studentName} has been deleted successfully.`,
        });
        refetchStudents();
      }
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.batch_time.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    exportToExcel(students, "Students_Data", "students");
    toast({
      title: "Success",
      description: "Students data exported to Excel successfully!",
    });
  };

  // Helper to upload photo to Supabase Storage
  const uploadProfilePhoto = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    setUploading(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to upload photo', variant: 'destructive' });
      return '';
    }
    // Get public URL
    const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    return urlData?.publicUrl || '';
  };

  // Helper to delete photo from Supabase Storage
  const deleteProfilePhotoFromStorage = async (url: string) => {
    if (!url) return;
    // Extract the file path after the bucket name
    const match = url.match(/profile-photos\/(.*)$/);
    if (!match) return;
    const filePath = match[1];
    await supabase.storage.from('profile-photos').remove([filePath]);
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const field = editingField.field;
    let value: any = editValue;
    if (field === "fee_amount") value = parseInt(editValue);
    const result = await updateItem(editingField.studentId, { [field]: value });
    if (!result) {
      toast({
        title: "Error",
        description: `Failed to update ${field.replace('_', ' ')}`,
        variant: "destructive",
      });
      return;
    }
    setEditingField(null);
    refetchStudents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-6">
      {/* Enhanced Header */}


      {/* Enhanced Section Header */}
      <section className="bg-blue-50 rounded-xl px-6 py-4 mb-6 shadow-sm border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <span role="img" aria-label="students">🧑‍🎓</span>
          Student Management
        </h2>
        <p className="text-gray-600 text-sm mt-1">Manage student information and enrollment</p>
      </section>

      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          <Button onClick={handleExportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                    placeholder="Enter username for login"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                    placeholder="Enter password for login"
                  />
                </div>
                
                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Select onValueChange={(value) => setNewStudent({...newStudent, class: value})}>
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
                  <Label htmlFor="board">Board</Label>
                  <Select
                    value={newStudent.board}
                    onValueChange={val => handleBoardChange(val)}
                  >
                    <SelectTrigger id="board">
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batchTime">Batch Time *</Label>
                  <Select onValueChange={(value) => setNewStudent({...newStudent, batch_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch time" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCH_TIMES.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feeAmount">Fee Amount (₹) *</Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    value={newStudent.fee_amount}
                    onChange={(e) => setNewStudent({...newStudent, fee_amount: e.target.value})}
                    placeholder="Enter fee amount"
                  />
                </div>

                <div>
                  <Label htmlFor="term_type">Term Type</Label>
                  <Select
                    value={newStudent.term_type}
                    onValueChange={val => setNewStudent({ ...newStudent, term_type: val })}
                  >
                    <SelectTrigger id="term_type">
                      <SelectValue placeholder="Select term type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="4 months">4 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <Label>Profile Photo (optional)</Label>
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onDragOver={e => e.preventDefault()}
                    onDrop={async e => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setProfilePhoto(e.dataTransfer.files[0]);
                        const url = await uploadProfilePhoto(e.dataTransfer.files[0]);
                        setProfilePhotoUrl(url);
                      }
                    }}
                  >
                    <div className="relative">
                      <Avatar className="h-20 w-20 mb-2">
                        {profilePhotoUrl ? (
                          <AvatarImage src={profilePhotoUrl} alt="Profile Photo" />
                        ) : (
                          <AvatarFallback>
                            <span className="text-3xl">👤</span>
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {profilePhotoUrl && (
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                          onClick={() => {
                            setProfilePhoto(null);
                            setProfilePhotoUrl("");
                          }}
                          aria-label="Remove photo"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      )}
                    </div>
                    {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profile-photo-input"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          setProfilePhoto(e.target.files[0]);
                          const url = await uploadProfilePhoto(e.target.files[0]);
                          setProfilePhotoUrl(url);
                        }
                      }}
                    />
                    <label htmlFor="profile-photo-input" className="cursor-pointer text-blue-600 underline mt-1">Choose file</label>
                  </div>
                </div>

                <Button onClick={handleAddStudent} className="w-full">
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Student Name *</Label>
                <Input
                  id="editName"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>
              
              <div>
                <Label htmlFor="editClass">Class *</Label>
                <Select value={editingStudent.class} onValueChange={(value) => setEditingStudent({...editingStudent, class: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                      <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editBoard">Board *</Label>
                <Select value={editingStudent.board} onValueChange={(value) => setEditingStudent({...editingStudent, board: value})}>
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
                <Label htmlFor="editBatchTime">Batch Time *</Label>
                <Select value={editingStudent.batch_time} onValueChange={(value) => setEditingStudent({...editingStudent, batch_time: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch time" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_TIMES.map(batch => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editFeeAmount">Fee Amount (₹) *</Label>
                <Input
                  id="editFeeAmount"
                  type="number"
                  value={editingStudent.fee_amount.toString()}
                  onChange={(e) => setEditingStudent({...editingStudent, fee_amount: parseInt(e.target.value)})}
                  placeholder="Enter fee amount"
                />
              </div>

              <div>
                <Label htmlFor="edit_term_type">Term Type</Label>
                <Select
                  value={editingStudent.term_type}
                  onValueChange={val => setEditingStudent({...editingStudent, term_type: val})}
                >
                  <SelectTrigger id="edit_term_type">
                    <SelectValue placeholder="Select term type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="4 months">4 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Photo Upload for Edit */}
              <div>
                <Label>Profile Photo (optional)</Label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onDragOver={e => e.preventDefault()}
                  onDrop={async e => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setEditProfilePhoto(e.dataTransfer.files[0]);
                      setEditUploading(true);
                      const url = await uploadProfilePhoto(e.dataTransfer.files[0]);
                      setEditProfilePhotoUrl(url);
                      setEditUploading(false);
                    }
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-20 w-20 mb-2">
                      {editProfilePhotoUrl || editingStudent.profile_photo_url ? (
                        <AvatarImage src={editProfilePhotoUrl || editingStudent.profile_photo_url} alt="Profile Photo" />
                      ) : (
                        <AvatarFallback>
                          <span className="text-3xl">👤</span>
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {(editProfilePhotoUrl || editingStudent.profile_photo_url) && (
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        onClick={async () => {
                          if (editProfilePhotoUrl || editingStudent.profile_photo_url) {
                            await deleteProfilePhotoFromStorage(editProfilePhotoUrl || editingStudent.profile_photo_url);
                          }
                          setEditProfilePhoto(null);
                          setEditProfilePhotoUrl("");
                        }}
                        aria-label="Remove photo"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                  </div>
                  {editUploading && <span className="text-xs text-blue-600">Uploading...</span>}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="edit-profile-photo-input"
                    onChange={async e => {
                      if (e.target.files && e.target.files[0]) {
                        setEditProfilePhoto(e.target.files[0]);
                        setEditUploading(true);
                        const url = await uploadProfilePhoto(e.target.files[0]);
                        setEditProfilePhotoUrl(url);
                        setEditUploading(false);
                      }
                    }}
                  />
                  <label htmlFor="edit-profile-photo-input" className="cursor-pointer text-blue-600 underline mt-1">Choose file</label>
                </div>
              </div>

              <Button onClick={handleEditStudent} className="w-full">
                Update Student
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          {/* Enhanced Students Header and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-white via-blue-50 to-blue-100/60 rounded-2xl shadow p-4 border border-blue-100 mb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-blue-900 tracking-tight">
              <Users className="w-7 h-7 text-blue-600" />
              Students <span className="text-lg font-bold text-blue-500">({filteredStudents.length})</span>
            </CardTitle>
            <div className="relative w-full sm:w-auto max-w-xs">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-xl bg-white/70 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all placeholder:text-blue-400 text-blue-900"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-8">
                {filteredStudents.map(student => (
              <Card
                key={student.id}
                draggable
                onDragStart={() => setDraggingStudentId(student.id)}
                onDragEnd={() => setDraggingStudentId(null)}
                className="relative p-6 flex flex-col items-center bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-lg rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 animate-fade-in"
              >
                {/* Avatar and Board Badge */}
                <div className="relative mb-3">
                  <Avatar className="h-20 w-20 shadow-md border-2 border-blue-200">
                        {student.profile_photo_url ? (
                          <AvatarImage src={student.profile_photo_url} alt={student.name} />
                        ) : (
                      <AvatarFallback className="text-2xl">{student.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        )}
                      </Avatar>
                  {/* Board badge */}
                  <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold shadow ${student.board === 'CBSE' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{student.board}</span>
                </div>
                <div className="mt-1 font-bold text-xl text-blue-900">{student.name}</div>
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    {/* Class Widget */}
                    <div
                      className="bg-blue-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'class'}); setEditValue(student.class); }}
                    >
                      <span role="img" aria-label="class" className="text-blue-400">🏫</span>
                      {editingField?.studentId === student.id && editingField.field === 'class' ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-blue-400 outline-none w-12 text-center animate-pulse"
                        />
                      ) : (
                        <span>Class <span className="font-semibold">{student.class}</span></span>
                      )}
                    </div>
                    {/* Board Widget */}
                    <div
                      className="bg-green-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'board'}); setEditValue(student.board); }}
                    >
                      <span role="img" aria-label="board" className="text-green-400">🏷️</span>
                      {editingField?.studentId === student.id && editingField.field === 'board' ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-green-400 outline-none w-20 text-center animate-pulse"
                        />
                      ) : (
                        <span>Board <span className="font-semibold">{student.board}</span></span>
                      )}
                    </div>
                    {/* Batch Widget */}
                    <div
                      className="bg-purple-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'batch_time'}); setEditValue(student.batch_time); }}
                    >
                      <span role="img" aria-label="batch" className="text-purple-400">⏰</span>
                      {editingField?.studentId === student.id && editingField.field === 'batch_time' ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-purple-400 outline-none w-24 text-center animate-pulse"
                        />
                      ) : (
                        <span>Batch <span className="font-semibold">{student.batch_time}</span></span>
                      )}
                    </div>
                    {/* Username Widget */}
                    <div
                      className="bg-gray-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'username'}); setEditValue(student.username); }}
                    >
                      <span role="img" aria-label="username" className="text-gray-400">👤</span>
                      {editingField?.studentId === student.id && editingField.field === 'username' ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-gray-400 outline-none w-24 text-center animate-pulse"
                        />
                      ) : (
                        <span>Username <span className="font-semibold">{student.username}</span></span>
                      )}
                    </div>
                    {/* Fee per Term Widget */}
                    <div
                      className="bg-yellow-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'fee_amount'}); setEditValue(student.fee_amount.toString()); }}
                    >
                      <span role="img" aria-label="fee" className="text-yellow-400">💰</span>
                      {editingField?.studentId === student.id && editingField.field === 'fee_amount' ? (
                        <input
                          type="number"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-yellow-400 outline-none w-20 text-center animate-pulse"
                        />
                      ) : (
                        <span>Fee per Term <span className="font-semibold text-green-700">₹{student.fee_amount}</span></span>
                      )}
                    </div>
                    {/* Term Type Widget */}
                    <div
                      className="bg-orange-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'term_type'}); setEditValue(student.term_type); }}
                    >
                      <span role="img" aria-label="term" className="text-orange-400">📅</span>
                      {editingField?.studentId === student.id && editingField.field === 'term_type' ? (
                        <input
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-orange-400 outline-none w-20 text-center animate-pulse"
                        />
                      ) : (
                        <span>Term <span className="font-semibold">{student.term_type}</span></span>
                      )}
                    </div>
                    {/* Phone Number Widget */}
                    <div
                      className="bg-cyan-50 rounded-lg px-3 py-1 flex items-center gap-2 shadow-sm cursor-pointer"
                      onDoubleClick={() => { setEditingField({studentId: student.id, field: 'phone'}); setEditValue(student.phone || ''); }}
                    >
                      <span role="img" aria-label="phone" className="text-cyan-400">📞</span>
                      {editingField?.studentId === student.id && editingField.field === 'phone' ? (
                        <input
                          type="tel"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                          className="bg-transparent border-b border-cyan-400 outline-none w-32 text-center animate-pulse"
                        />
                      ) : (
                        <span>Phone <span className="font-semibold">{student.phone || 'N/A'}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full border-t border-gray-200 my-3"></div>
                <div className="mt-2 flex gap-3 w-full justify-center">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow" onClick={() => openEditDialog(student)}>
                    Edit
                          </Button>
                  <Button size="sm" variant="destructive" className="px-4 py-1 rounded shadow" onClick={() => handleDeleteStudent(student.id, student.name)} title="Delete this student">
                            Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {/* Dustbin for drag-to-delete */}
          {draggingStudentId && (
            <div
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
              onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
              onDragLeave={() => setDragOverDustbin(false)}
              onDrop={async e => {
                setDragOverDustbin(false);
                setDraggingStudentId(null);
                await handleDeleteStudent(draggingStudentId, students.find(s => s.id === draggingStudentId)?.name || "");
                refetchStudents();
              }}
              style={{ pointerEvents: "all" }}
            >
              <div className={`bg-white shadow-lg rounded-full p-4 border-2 ${dragOverDustbin ? "border-red-600" : "border-gray-300"}`}>
                <span role="img" aria-label="delete" className={`text-4xl ${dragOverDustbin ? "text-red-600" : "text-gray-500"}`}>🗑️</span>
              </div>
              <span className="mt-2 text-sm font-semibold text-gray-700">Drop here to delete</span>
            </div>
          )}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found. Add some students to get started.
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
