import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
  board: string;
  batch_time: string;
  username: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: "present" | "absent";
  batch_time: string;
}

export function StudentAnalytics() {
  const { user } = useAuth();
  const { data: studentsData } = useSupabaseData("students");
  const { data: attendanceData } = useSupabaseData("attendance");

  const students = studentsData as Student[];
  const attendance = attendanceData as AttendanceRecord[];

  // Find current student if logged in as user
  const currentStudent = user?.role === "user" 
    ? students.find(s => s.username === user.name)
    : null;

  if (user?.role === "user" && !currentStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Student profile not found</div>
      </div>
    );
  }

  // Get student-specific data
  const studentAttendance = currentStudent 
    ? attendance.filter(a => a.student_id === currentStudent.id)
    : attendance;

  // Calculate attendance stats
  const last30DaysAttendance = studentAttendance
    .filter(a => {
      const recordDate = new Date(a.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    });

  const attendanceByWeek = last30DaysAttendance.reduce((acc, record) => {
    const week = Math.floor((new Date().getTime() - new Date(record.date).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekLabel = `Week ${4 - week}`;
    
    if (!acc[weekLabel]) {
      acc[weekLabel] = { week: weekLabel, present: 0, absent: 0 };
    }
    
    if (record.status === "present") {
      acc[weekLabel].present += 1;
    } else {
      acc[weekLabel].absent += 1;
    }
    
    return acc;
  }, {} as Record<string, { week: string; present: number; absent: number }>);

  const attendanceChartData = Object.values(attendanceByWeek).reverse();

  const attendancePercentage = last30DaysAttendance.length > 0 
    ? Math.round((last30DaysAttendance.filter(a => a.status === "present").length / last30DaysAttendance.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStudent ? `${currentStudent.name}'s Analytics` : "Student Analytics"}
          </h2>
          <p className="text-gray-600">
            {currentStudent 
              ? `Class ${currentStudent.class} - ${currentStudent.board} | Batch: ${currentStudent.batch_time}`
              : "Overview of student performance and attendance"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Attendance (30 days)</p>
                <p className="text-2xl font-bold text-blue-600">{attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend (Last 4 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
