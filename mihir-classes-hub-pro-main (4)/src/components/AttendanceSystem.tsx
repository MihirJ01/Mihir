import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Download, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { TablesInsert } from "@/integrations/supabase/types";

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
  const { data: attendanceData, addItem: addAttendance, updateItem: updateAttendance, refetch: refetchAttendance } = useSupabaseData("attendance");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const { user } = useAuth();

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
    if (refetchAttendance) refetchAttendance();
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-6">
      {/* Enhanced Section Header */}
      <section className="bg-blue-50 rounded-xl px-3 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 shadow-sm border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span role="img" aria-label="attendance">📅</span>
            Attendance System
          </h2>
          <p className="text-gray-600 text-sm mt-1">Track daily attendance for all students by batch</p>
        </div>
        <Button onClick={handleExportToExcel} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </section>

      {/* Enhanced Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-gradient-to-br from-white via-green-50 to-green-100/60 rounded-2xl shadow-md border-0 transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 shadow-inner">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-green-700">Present Today</p>
              <p className="text-3xl font-extrabold text-green-600">{presentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-red-50 to-red-100/60 rounded-2xl shadow-md border-0 transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 shadow-inner">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-red-700">Absent Today</p>
              <p className="text-3xl font-extrabold text-red-600">{absentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-blue-50 to-blue-100/60 rounded-2xl shadow-md border-0 transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 shadow-inner">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-blue-700">Total Students</p>
              <p className="text-3xl font-extrabold text-blue-600">{filteredStudents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Mark Attendance Section */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/60">
        <CardHeader className="border-b border-blue-100 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-extrabold text-blue-900 tracking-tight">
            <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            Mark Attendance
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4 w-full">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-blue-200 rounded-xl px-3 sm:px-4 py-2 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all text-blue-900 font-semibold w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">Filter by Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl border-blue-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm text-blue-900 font-semibold">
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
          <div className="space-y-3 mt-4">
            {filteredStudents.map((student) => {
              const status = getStudentAttendanceStatus(student.id);
              return (
                <div key={student.id} className="flex items-center justify-between p-4 border border-blue-100 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h4 className="font-bold text-blue-900 text-lg">{student.name}</h4>
                    <p className="text-sm text-gray-600">Class {student.class} - {student.board} | Batch: {student.batch_time}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 ml-0 sm:ml-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant={status === "present" ? "default" : "outline"}
                      onClick={() => markAttendance(student.id, "present")}
                      className={`flex items-center gap-1 rounded-lg px-4 py-2 font-semibold border-2 ${status === "present" ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : "border-green-400 text-green-700 hover:bg-green-50"}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "absent" ? "destructive" : "outline"}
                      onClick={() => markAttendance(student.id, "absent")}
                      className={`flex items-center gap-1 rounded-lg px-4 py-2 font-semibold border-2 ${status === "absent" ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" : "border-red-400 text-red-700 hover:bg-red-50"}`}
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
