
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Download, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { useSupabaseData } from "@/hooks/useSupabaseData";

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

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  batch_time: string;
  date: string;
  status: "present" | "absent";
  class: string;
  created_at: string;
}

const BATCH_TIMES = [
  "7:30-9:30",
  "9:30-11:30", 
  "3:00-5:00"
];

export function AttendanceSystem() {
  const { data: studentsData } = useSupabaseData("students");
  const { data: attendanceData, addItem: addAttendance, updateItem: updateAttendance } = useSupabaseData("attendance");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const students = studentsData as Student[];
  const attendance = attendanceData as AttendanceRecord[];

  const filteredStudents = selectedBatch && selectedBatch !== "all"
    ? students.filter(student => student.batch_time === selectedBatch)
    : students;

  const getTodaysAttendance = () => {
    return attendance.filter(record => 
      record.date === selectedDate && 
      (selectedBatch === "all" || !selectedBatch || record.batch_time === selectedBatch)
    );
  };

  const markAttendance = async (studentId: string, status: "present" | "absent") => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existingRecord = attendance.find(record => 
      record.student_id === studentId && record.date === selectedDate
    );

    if (existingRecord) {
      await updateAttendance(existingRecord.id, { status });
    } else {
      await addAttendance({
        student_id: studentId,
        student_name: student.name,
        batch_time: student.batch_time,
        class: student.class,
        date: selectedDate,
        status,
      });
    }

    toast({
      title: "Success",
      description: `Attendance marked as ${status} for ${student.name}`,
    });
  };

  const getStudentAttendanceStatus = (studentId: string) => {
    const record = attendance.find(record => 
      record.student_id === studentId && record.date === selectedDate
    );
    return record?.status;
  };

  const handleExportToExcel = () => {
    const attendanceDataForExport = attendance.map(record => ({
      Date: record.date,
      StudentName: record.student_name,
      BatchTime: record.batch_time,
      Status: record.status,
    }));
    
    exportToExcel(attendanceDataForExport, "Attendance_Data", "attendance");
    toast({
      title: "Success",
      description: "Attendance data exported to Excel successfully!",
    });
  };

  const todaysAttendance = getTodaysAttendance();
  const presentCount = todaysAttendance.filter(record => record.status === "present").length;
  const absentCount = todaysAttendance.filter(record => record.status === "absent").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance System</h2>
          <p className="text-gray-600">Track daily attendance for all students by batch</p>
        </div>
        <Button onClick={handleExportToExcel} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{filteredStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mark Attendance
          </CardTitle>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {BATCH_TIMES.map(batch => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const status = getStudentAttendanceStatus(student.id);
              return (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">Class {student.class} - {student.board} | Batch: {student.batch_time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === "present" ? "default" : "outline"}
                      onClick={() => markAttendance(student.id, "present")}
                      className={status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "absent" ? "destructive" : "outline"}
                      onClick={() => markAttendance(student.id, "absent")}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found. Please add students first.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
