
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
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">
                  {totalStudents} students enrolled in the system
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Attendance tracking active for today
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Fee collection system operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="space-y-3">
              <Button 
                onClick={() => handleQuickAction('attendance')}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors justify-start text-xs sm:text-sm"
              >
                Mark Today's Attendance
              </Button>
              <Button 
                onClick={() => handleQuickAction('students')}
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors justify-start text-xs sm:text-sm"
              >
                Add New Student
              </Button>
              <Button 
                onClick={() => handleQuickAction('announcements')}
                className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors justify-start text-xs sm:text-sm"
              >
                Create Announcement
              </Button>
              <Button 
                onClick={() => handleQuickAction('export')}
                className="w-full bg-orange-600 text-white hover:bg-orange-700 transition-colors justify-start text-xs sm:text-sm"
              >
                Export Data to Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
