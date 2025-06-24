import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

type Student = Database['public']['Tables']['students']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];
type FeeRecord = Database['public']['Tables']['fee_records']['Row'];

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data: students } = useSupabaseData("students");
  const { data: attendance } = useSupabaseData("attendance");
  const { data: feeRecords } = useSupabaseData("fee_records");
  const { toast } = useToast();

  const typedStudents = students as Student[];
  const typedAttendance = attendance as AttendanceRecord[];
  const typedFeeRecords = feeRecords as FeeRecord[];

  const totalStudents = typedStudents.length;
  const presentToday = typedAttendance.filter(record => 
    record.date === new Date().toISOString().split('T')[0] && record.status === 'present'
  ).length;
  
  const pendingFees = typedFeeRecords.filter(fee => fee.status === 'pending').length;
  const totalRevenue = typedFeeRecords.filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Pending Fees",
      value: pendingFees,
      icon: CreditCard,
      color: "bg-orange-500",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'attendance':
        if (onNavigate) {
          onNavigate('attendance');
          toast({
            title: "Navigation",
            description: "Redirected to Attendance System",
          });
        }
        break;
      case 'students':
        if (onNavigate) {
          onNavigate('students');
          toast({
            title: "Navigation",
            description: "Redirected to Student Management",
          });
        }
        break;
      case 'announcements':
        if (onNavigate) {
          onNavigate('announcements');
          toast({
            title: "Navigation",
            description: "Redirected to Announcements",
          });
        }
        break;
      case 'export':
        toast({
          title: "Export Data",
          description: "Data export functionality will be implemented soon",
        });
        break;
      default:
        toast({
          title: "Action",
          description: "Quick action performed",
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="transition-transform duration-200 hover:scale-105 hover:shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/60 shadow-lg rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`w-12 h-12 rounded-xl shadow-md flex items-center justify-center ${stat.color} bg-opacity-90 bg-blur-[2px]`}>
                <stat.icon className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-md border-0 bg-white/80 backdrop-blur">
          <CardHeader className="p-4 lg:p-6 border-b border-blue-100">
            <CardTitle className="text-lg font-bold text-blue-900 tracking-tight flex items-center gap-2">
              <span role="img" aria-label="activities">📝</span>
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 shadow-sm">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-800 font-medium">
                  {totalStudents} students enrolled in the system
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400 shadow-sm">
                <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-800 font-medium">
                  Attendance tracking active for today
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400 shadow-sm">
                <CreditCard className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-gray-800 font-medium">
                  Fee collection system operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/60 backdrop-blur">
          <CardHeader className="p-4 lg:p-6 border-b border-blue-100">
            <CardTitle className="text-lg font-bold text-blue-900 tracking-tight flex items-center gap-2">
              <span role="img" aria-label="actions">⚡</span>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="space-y-3">
              <Button 
                onClick={() => handleQuickAction('attendance')}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all justify-start text-sm font-semibold shadow-md rounded-lg flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Mark Today's Attendance
              </Button>
              <Button 
                onClick={() => handleQuickAction('students')}
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-all justify-start text-sm font-semibold shadow-md rounded-lg flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Add New Student
              </Button>
              <Button 
                onClick={() => handleQuickAction('announcements')}
                className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-all justify-start text-sm font-semibold shadow-md rounded-lg flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Create Announcement
              </Button>
              <Button 
                onClick={() => handleQuickAction('export')}
                className="w-full bg-orange-600 text-white hover:bg-orange-700 transition-all justify-start text-sm font-semibold shadow-md rounded-lg flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Export Data to Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
