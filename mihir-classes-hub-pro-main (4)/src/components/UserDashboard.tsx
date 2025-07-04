import { StudentAnalytics } from "./StudentAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Announcements } from "./Announcements";
import { Bell, BookOpen, Video, Sparkles, Star, School, Target, Home, Calendar, DollarSign, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Memories } from "@/components/Memories";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { StudentPaymentDetails, TermWiseFeeTable } from './StudentPaymentDetails';

export function UserDashboard() {
  const { user, logout } = useAuth();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [announcements] = useLocalStorage("mihir-announcements", []);
  const [readIds, setReadIds] = useLocalStorage("mihir-announcements-read", []);
  const { data: notes = [] } = useSupabaseData("notes", { column: "created_at", ascending: false });
  const { data: students = [] } = useSupabaseData("students");
  const student = students.find((s: any) => s.username === user?.name);
  const profilePhotoUrl = (student && 'profile_photo_url' in student) ? (student as any).profile_photo_url : "";
  const userClass = user?.class;
  const userBoard = user?.board;
  const userNotes = notes.filter((note: any) => note.class === userClass && note.board === userBoard);
  const { data: attendanceData = [] } = useSupabaseData("attendance");
  const studentAttendance = student ? attendanceData.filter((a: any) => a.student_id === student.id) : [];
  const last30DaysAttendance = studentAttendance.filter((a: any) => {
    const recordDate = new Date(a.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  });
  const attendancePercentage = last30DaysAttendance.length > 0
    ? Math.round((last30DaysAttendance.filter(a => a.status === "present").length / last30DaysAttendance.length) * 100)
    : 0;
  const attendanceByWeek = last30DaysAttendance.reduce((acc: any, record: any) => {
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
  }, {});
  const attendanceChartData = Object.values(attendanceByWeek).reverse();
  const { data: payments = [] } = useSupabaseData("fee_payments");

  // Find unread announcements
  const unread = announcements.filter((a: any) => !readIds.includes(a.id));

  // Mark all as read when opening announcements
  useEffect(() => {
    if (showAnnouncements && announcements.length > 0) {
      setReadIds(announcements.map((a: any) => a.id));
  }
  }, [showAnnouncements, announcements, setReadIds]);

  // Helper: Render only the fee card (copy the Card JSX from StudentPaymentDetails, but as a FeeCardPreview component)
  function FeeCardPreview({ student, payments, yearlyFee, totalPaid, remainingAmount }) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/60 rounded-3xl flex-grow mx-auto mt-4 min-h-[400px] p-2 sm:p-4">
        <div className="w-full relative pt-2 sm:pt-4 pb-1 flex items-center justify-center">
          <div className="absolute left-2 sm:left-4 top-1 flex items-center">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-blue-200 shadow-sm object-cover" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-blue-200 shadow-sm bg-blue-200 flex items-center justify-center">
                <span className="text-lg sm:text-2xl font-bold text-blue-800">
                  {student.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 sm:gap-2 justify-center">
                <img src='/lovable-uploads/image.png' alt='Logo' className='w-5 h-5 sm:w-6 sm:h-6' />
                <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-blue-900 drop-shadow">Mihir Classes</span>
              </div>
              <div className="h-1 w-14 sm:w-20 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full mt-2 mb-1" />
            </div>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-bold text-blue-900">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="truncate bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 text-xs sm:text-sm">
                  {student.name}
                </span>
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                Class {student.class} - {student.board}
              </p>
            </div>
          </div>
          <div className="border-b border-blue-200 my-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-2 sm:p-3 rounded-xl border border-blue-200 flex flex-col items-start shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700">Yearly Fee</span>
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-blue-900">₹{yearlyFee.toLocaleString()}</span>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 p-2 sm:p-3 rounded-xl border border-green-200 flex flex-col items-start shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-700">Total Paid</span>
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-green-900">₹{totalPaid.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-2 sm:p-3 rounded-xl border border-orange-200 flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-orange-700">Remaining Amount</span>
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-orange-900">₹{remainingAmount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-600">
            <p>Term: ₹{student.fee_amount} / {student.term_type}</p>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold mb-2">Term-wise Fee Status</h4>
            <div className="overflow-x-auto">
              <TermWiseFeeTable student={student} payments={payments} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Decorative background elements (from Hero & LoginPanel) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50 -z-10"></div>
      {/* Animated Bubbles */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse -z-10"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-200 rounded-full opacity-30 animate-pulse delay-1000 -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-25 animate-bounce delay-500 -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000 -z-10"></div>
      <div className="absolute top-10 left-10 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1500 -z-10"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-bounce delay-2500 -z-10"></div>
      {/* Floating Lucide Icons */}
      <div className="absolute top-32 left-20 animate-float delay-1000 -z-10">
        <Sparkles className="h-8 w-8 text-yellow-400 opacity-60" />
      </div>
      <div className="absolute top-48 right-32 animate-float delay-2000 -z-10">
        <BookOpen className="h-6 w-6 text-blue-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-32 animate-float delay-500 -z-10">
        <Target className="h-7 w-7 text-green-400 opacity-60" />
      </div>
      <div className="absolute bottom-48 right-20 animate-float delay-1500 -z-10">
        <Star className="h-6 w-6 text-purple-400 opacity-60" />
      </div>
      <div className="absolute top-1/3 left-10 animate-float delay-2500 -z-10">
        <School className="h-8 w-8 text-green-400 opacity-50" />
      </div>
      <div className="absolute top-1/4 right-12 animate-float delay-3000 -z-10">
        <Star className="h-5 w-5 text-yellow-400 opacity-50" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 animate-float delay-3500 -z-10">
        <Star className="h-5 w-5 text-pink-400 opacity-60" />
      </div>
      {/* Decorative gradient lines */}
      <div className="absolute top-1/4 left-0 w-2 h-24 bg-gradient-to-b from-blue-400 to-transparent opacity-30 -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-2 h-32 bg-gradient-to-t from-yellow-400 to-transparent opacity-30 -z-10"></div>
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-500 to-blue-400 shadow-md border-b border-blue-200 rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex flex-col sm:flex-row justify-between items-center py-2 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
            <Button variant="ghost" size="icon" aria-label="Home" className="rounded-full bg-blue-100 hover:bg-blue-200 shadow-md mr-2" onClick={() => { setShowMemories(false); setShowNotes(false); setShowAnnouncements(false); }}>
              <Home className="w-6 h-6 text-blue-600" />
            </Button>
            <span className="text-2xl sm:text-3xl mr-1 sm:mr-2">👤</span>
            <div>
              <div className="text-white font-extrabold text-base sm:text-lg md:text-2xl drop-shadow">User Dashboard</div>
              <div className="text-blue-100 font-medium text-xs sm:text-sm -mt-1">Welcome, {student?.name || user?.name}!</div>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 items-center w-full sm:w-auto justify-center sm:justify-end">
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => { setShowMemories(true); setShowNotes(false); setShowAnnouncements(false); }} aria-label="Memories" className="rounded-full bg-blue-100 hover:bg-blue-200 shadow-md">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </Button>
              <span className="text-[10px] sm:text-xs text-white mt-1">Memories</span>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => { setShowNotes(true); setShowMemories(false); setShowAnnouncements(false); }} aria-label="Notes" className="rounded-full bg-blue-100 hover:bg-blue-200 shadow-md">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </Button>
              <span className="text-[10px] sm:text-xs text-white mt-1">Notes</span>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => { setShowAnnouncements(true); setShowMemories(false); setShowNotes(false); }} aria-label="Announcements" className="rounded-full bg-blue-100 hover:bg-blue-200 shadow-md">
                <span className="relative">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  {unread.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
                  )}
                </span>
              </Button>
              <span className="text-[10px] sm:text-xs text-white mt-1">Announcements</span>
            </div>
            <Button onClick={logout} variant="outline" className="rounded-full bg-white/80 hover:bg-blue-50 shadow-md ml-2 sm:ml-4 text-xs sm:text-sm px-2 sm:px-4">Logout</Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {!showMemories && !showNotes && !showAnnouncements && (
          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4 sm:gap-8 mt-6 sm:mt-10 animate-float">
            {/* Profile Card */}
            <Card className="w-full max-w-xs sm:max-w-sm shadow-2xl border-0 bg-white/60 backdrop-blur-lg rounded-3xl p-0 relative overflow-visible flex-shrink-0 mx-auto lg:mx-0">
              <CardContent className="flex flex-col items-center py-6 sm:py-8 px-3 sm:px-6">
                <div className="relative mb-3">
                  <span className="absolute -inset-1 rounded-full bg-blue-300 opacity-30 blur-xl animate-pulse"></span>
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-blue-400 shadow-xl">
                    {profilePhotoUrl ? (
                      <AvatarImage src={profilePhotoUrl} alt="Profile Photo" />
                    ) : (
                      <AvatarFallback>
                        <span className="text-3xl sm:text-4xl">👤</span>
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-1 tracking-tight drop-shadow text-center">{student?.name || user?.name}&apos;s Analytics</div>
                <div className="flex flex-wrap gap-2 mb-2 justify-center">
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm shadow">Class {student?.class || user?.class}</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs sm:text-sm shadow">{student?.board || user?.board}</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs sm:text-sm shadow">Batch: {student?.batch_time}</span>
                </div>
                <div className="mt-2 sm:mt-4 flex flex-col items-center">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Attendance (30 days)</div>
                  <div className="w-16 h-16 sm:w-24 sm:h-24">
                    <CircularProgressbar
                      value={attendancePercentage}
                      text={`${attendancePercentage}%`}
                      styles={buildStyles({
                        pathColor: '#2563eb',
                        textColor: '#2563eb',
                        trailColor: '#dbeafe',
                        backgroundColor: '#fff',
                        textSize: '1.1rem',
                        pathTransitionDuration: 0.7,
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Attendance Graph Card */}
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/60 backdrop-blur-lg rounded-3xl flex-grow mx-auto lg:mx-0 mt-4 lg:mt-0">
              <CardHeader className="px-3 sm:px-6 pt-4 pb-2">
                <CardTitle className="text-base sm:text-lg">Attendance Trend (Last 4 Weeks)</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#10B981" name="Present" />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Excel Sheet Preview for the logged-in user */}
        {!showMemories && !showNotes && !showAnnouncements && student && (
          <div className="mt-8 flex flex-col items-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Your Fee Card Preview</h2>
            <div className="w-full flex justify-center">
              {(() => {
                const studentPayments = payments.filter((p: any) => p.student_id === student.id);
                const totalPaid = studentPayments.reduce((sum: number, payment: any) => sum + Number(payment.amount_paid), 0);
                const termDuration = student.term_type === "2 months" ? 2 : student.term_type === "3 months" ? 3 : 4;
                const yearlyFee = (12 / termDuration) * student.fee_amount;
                const remainingAmount = Math.max(0, yearlyFee - totalPaid);
                return (
                  <FeeCardPreview
                    student={student}
                    payments={studentPayments}
                    yearlyFee={yearlyFee}
                    totalPaid={totalPaid}
                    remainingAmount={remainingAmount}
                  />
                );
              })()}
            </div>
          </div>
        )}
        {showMemories ? (
          <div className="space-y-4">
            <Memories isUserView />
          </div>
        ) : showNotes ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600" />Notes for Class {userClass} ({userBoard})</h2>
            {userNotes.length === 0 ? (
              <div className="text-gray-600">No notes available for your class and board.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNotes.map((note: any) => (
                  <div key={note.id} className="bg-white rounded-lg shadow p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-lg">{note.title}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Class {note.class}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{note.board}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{note.subject}</span>
                    </div>
                    <div className="text-gray-700 mb-2 line-clamp-4">{note.content}</div>
                    <div className="text-xs text-gray-500">Created: {note.created_date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : showAnnouncements ? (
          <div>
            <Announcements readOnly />
          </div>
        ) : (
          <StudentAnalytics />
        )}
      </div>
    </div>
  );
}
