import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FileText, Plus, Download, Calendar, User, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface Assignment {
  id: string;
  title: string;
  description: string;
  board: "CBSE" | "State Board";
  subject: string;
  dueDate: string;
  createdDate: string;
  assignedStudents: string[];
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  status: "submitted" | "pending" | "late";
  remarks?: string;
}

export function WorkSystem() {
  const [students] = useLocalStorage("mihir-students", []);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>("mihir-assignments", []);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>("mihir-submissions", []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const { toast } = useToast();

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    board: "",
    subject: "",
    dueDate: "",
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);

  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.board || !newAssignment.subject || !newAssignment.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const eligibleStudents = students.map((student: any) => student.id);

    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title,
      description: newAssignment.description,
      board: newAssignment.board as "CBSE" | "State Board",
      subject: newAssignment.subject,
      dueDate: newAssignment.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      assignedStudents: eligibleStudents,
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({
      title: "",
      description: "",
      board: "",
      subject: "",
      dueDate: "",
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: `Assignment added and assigned to ${eligibleStudents.length} students!`,
    });
  };

  const markSubmission = (assignmentId: string, studentId: string, status: "submitted" | "late") => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existingSubmission = submissions.find(sub => 
      sub.assignmentId === assignmentId && sub.studentId === studentId
    );

    if (existingSubmission) {
      setSubmissions(submissions.map(sub => 
        sub.id === existingSubmission.id 
          ? { ...sub, status, submissionDate: new Date().toISOString().split('T')[0] }
          : sub
      ));
    } else {
      const newSubmission: Submission = {
        id: Date.now().toString() + studentId,
        assignmentId,
        studentId,
        studentName: student.name,
        submissionDate: new Date().toISOString().split('T')[0],
        status,
      };
      setSubmissions([...submissions, newSubmission]);
    }

    toast({
      title: "Success",
      description: `Submission marked as ${status} for ${student.name}`,
    });
  };

  const getSubmissionStatus = (assignmentId: string, studentId: string) => {
    const submission = submissions.find(sub => 
      sub.assignmentId === assignmentId && sub.studentId === studentId
    );
    return submission?.status || "pending";
  };

  const filteredAssignments = assignments;

  const handleExportToExcel = () => {
    const assignmentData = assignments.map(assignment => ({
      Title: assignment.title,
      Board: assignment.board,
      Subject: assignment.subject,
      Description: assignment.description,
      DueDate: assignment.dueDate,
      CreatedDate: assignment.createdDate,
      AssignedStudents: assignment.assignedStudents.length,
    }));
    
    exportToExcel(assignmentData, "Assignments_Data", "assignments");
    toast({
      title: "Success",
      description: "Assignment data exported to Excel successfully!",
    });
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    setDeleteDialogOpen(false);
    setDeleteAssignmentId(null);
    toast({ title: "Deleted", description: "Assignment deleted successfully!" });
  };

  const handleUpdateAssignment = () => {
    if (!editAssignment) return;
    if (!editAssignment.title || !editAssignment.description || !editAssignment.board || !editAssignment.subject || !editAssignment.dueDate) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setAssignments(assignments.map(a => a.id === editAssignment.id ? editAssignment : a));
    setEditDialogOpen(false);
    setEditAssignment(null);
    toast({ title: "Updated", description: "Assignment updated successfully!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Work System</h2>
          <p className="text-gray-600">Manage assignments and track submissions</p>
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
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Enter assignment title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                    <Select onValueChange={(value) => setNewAssignment({...newAssignment, board: value})}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                      placeholder="Enter subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Enter assignment description and instructions..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleAddAssignment} className="w-full">
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {filteredAssignments.map((assignment) => {
          const assignedStudents = students.filter(student => 
            assignment.assignedStudents.includes(student.id)
          );

          return (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow max-w-md relative">
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Assignment Actions">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditAssignment(assignment); setEditDialogOpen(true); }}>Update</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setDeleteAssignmentId(assignment.id); setDeleteDialogOpen(true); }}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      {assignment.title}
                    </CardTitle>
                    <div className="flex gap-2 mt-2 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{assignment.board}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{assignment.subject}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                      <Calendar className="w-4 h-4" />
                      Due: {assignment.dueDate}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{assignment.description}</p>
                {assignedStudents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Student Submissions:</h4>
                    {assignedStudents.map((student) => {
                      const status = getSubmissionStatus(assignment.id, student.id);
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              status === "submitted" 
                                ? "bg-green-100 text-green-800"
                                : status === "late"
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          {status === "pending" && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => markSubmission(assignment.id, student.id, "submitted")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Submitted
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => markSubmission(assignment.id, student.id, "late")}
                              >
                                Mark Late
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
            <p className="text-gray-600">Start by creating assignments for your students.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Assignment</DialogTitle>
          </DialogHeader>
          {editAssignment && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={editAssignment.title}
                  onChange={e => setEditAssignment({ ...editAssignment, title: e.target.value })}
                  placeholder="Enter assignment title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <Select value={editAssignment.board} onValueChange={value => setEditAssignment({ ...editAssignment, board: value as "CBSE" | "State Board" })}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    value={editAssignment.subject}
                    onChange={e => setEditAssignment({ ...editAssignment, subject: e.target.value })}
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={editAssignment.dueDate}
                    onChange={e => setEditAssignment({ ...editAssignment, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={editAssignment.description}
                  onChange={e => setEditAssignment({ ...editAssignment, description: e.target.value })}
                  placeholder="Enter assignment description and instructions..."
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateAssignment} className="w-full">Update Assignment</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteAssignment(deleteAssignmentId!)}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
