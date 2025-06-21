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
}

const BATCH_TIMES = [
  "7:30-9:30",
  "9:30-11:30", 
  "3:00-5:00"
];

export function StudentManagement() {
  const { data: studentsData, loading, addItem, updateItem, deleteItem } = useSupabaseData("students", { column: "created_at", ascending: false });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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

  // Auto-set term type based on board selection
  const handleBoardChange = (board: string) => {
    setNewStudent({
      ...newStudent, 
      board,
      term_type: board === "CBSE" ? "4 months" : "3 months"
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
    };

    const result = await updateItem(editingStudent.id, updates);
    
    if (result) {
      setIsEditDialogOpen(false);
      setEditingStudent(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage student information and enrollment</p>
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
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                        <SelectItem key={num} value={num.toString()}>Class {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="board">Board *</Label>
                  <Select onValueChange={handleBoardChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE (4 months term)</SelectItem>
                      <SelectItem value="State Board">State Board (3 months term)</SelectItem>
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
                  <Label htmlFor="termType">Term Type *</Label>
                  <Select value={newStudent.term_type} onValueChange={(value) => setNewStudent({...newStudent, term_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-selected based on board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 months">3 Months (State Board)</SelectItem>
                      <SelectItem value="4 months">4 Months (CBSE)</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="editTermType">Term Type *</Label>
                <Select value={editingStudent.term_type} onValueChange={(value) => setEditingStudent({...editingStudent, term_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 months">2 Months</SelectItem>
                    <SelectItem value="3 months">3 Months</SelectItem>
                  </SelectContent>
                </Select>
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students ({filteredStudents.length})
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Username</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Class</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Board</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Batch Time</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Fee Amount</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Term Type</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{student.name}</td>
                    <td className="p-3 text-gray-700">{student.username}</td>
                    <td className="p-3 text-gray-700">Class {student.class}</td>
                    <td className="p-3 text-gray-700">{student.board}</td>
                    <td className="p-3 text-gray-700">{student.batch_time}</td>
                    <td className="p-3 text-gray-700">₹{student.fee_amount}</td>
                    <td className="p-3 text-gray-700">{student.term_type}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(student)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found. Add some students to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
