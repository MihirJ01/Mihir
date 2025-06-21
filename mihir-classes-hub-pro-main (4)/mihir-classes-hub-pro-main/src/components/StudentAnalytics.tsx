
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, BookOpen, CheckCircle, Clock } from "lucide-react";

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

interface WorkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: "submitted" | "pending" | "late";
  submission_date: string;
}

interface WorkAssignment {
  id: string;
  title: string;
  class: string;
  board: string;
  created_date: string;
  due_date: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function StudentAnalytics() {
  const { user } = useAuth();
  const { data: studentsData } = useSupabaseData("students");
  const { data: attendanceData } = useSupabaseData("attendance");
  const { data: submissionsData } = useSupabaseData("work_submissions");
  const { data: assignmentsData } = useSupabaseData("work_assignments");

  const students = studentsData as Student[];
  const attendance = attendanceData as AttendanceRecord[];
  const submissions = submissionsData as WorkSubmission[];
  const assignments = assignmentsData as WorkAssignment[];

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

  const studentSubmissions = currentStudent
    ? submissions.filter(s => s.student_id === currentStudent.id)
    : submissions;

  const relevantAssignments = currentStudent
    ? assignments.filter(a => a.class === currentStudent.class && a.board === currentStudent.board)
    : assignments;

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

  // Calculate work completion stats
  const workStats = relevantAssignments.map(assignment => {
    const submission = studentSubmissions.find(s => s.assignment_id === assignment.id);
    return {
      assignment: assignment.title,
      status: submission ? submission.status : "pending",
      dueDate: assignment.due_date,
      submitted: submission ? submission.submission_date : null
    };
  });

  const workCompletionData = [
    { name: "Submitted", value: workStats.filter(w => w.status === "submitted").length, color: COLORS[0] },
    { name: "Pending", value: workStats.filter(w => w.status === "pending").length, color: COLORS[1] },
    { name: "Late", value: workStats.filter(w => w.status === "late").length, color: COLORS[2] },
  ].filter(item => item.value > 0);

  const attendancePercentage = last30DaysAttendance.length > 0 
    ? Math.round((last30DaysAttendance.filter(a => a.status === "present").length / last30DaysAttendance.length) * 100)
    : 0;

  const workCompletionPercentage = relevantAssignments.length > 0
    ? Math.round((workStats.filter(w => w.status === "submitted").length / relevantAssignments.length) * 100)
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Work Completed</p>
                <p className="text-2xl font-bold text-green-600">{workCompletionPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-purple-600">{relevantAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Work</p>
                <p className="text-2xl font-bold text-orange-600">
                  {workStats.filter(w => w.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Work Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            {workCompletionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No assignment data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Assignment</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Due Date</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {workStats.slice(0, 10).map((work, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{work.assignment}</td>
                    <td className="p-3 text-gray-700">{work.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        work.status === "submitted" 
                          ? "bg-green-100 text-green-800"
                          : work.status === "late"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {work.status.charAt(0).toUpperCase() + work.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">
                      {work.submitted || "Not submitted"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {workStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assignments found for this student.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
