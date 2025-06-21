
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Download, DollarSign, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { StudentFeeCard } from "./StudentFeeCard";
import { useFeeCalculations } from "@/hooks/useFeeCalculations";

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

interface FeeRecord {
  id: string;
  student_id: string;
  student_name: string;
  class: string;
  amount: number;
  term_type: string;
  term_number: number;
  due_date: string;
  paid_date?: string;
  status: "pending" | "paid" | "overdue";
  remaining_amount: number;
  total_paid: number;
  created_at: string;
}

export function FeeTracking() {
  const { data: studentsData, refetch: refetchStudents } = useSupabaseData("students");
  const { data: feeRecordsData, addItem: addFeeRecord, refetch: refetchFeeRecords } = useSupabaseData("fee_records");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [termNumber, setTermNumber] = useState("");
  const { toast } = useToast();

  const students = studentsData as Student[];
  const fees = feeRecordsData as FeeRecord[];

  // Recalculate statistics when data changes
  const { totalPending, totalPaid, overdueCount } = (() => {
    let pending = 0;
    let paid = 0;
    let overdue = 0;

    fees.forEach(fee => {
      const student = students.find(s => s.id === fee.student_id);
      if (student) {
        // Recalculate based on current student data
        const termDuration = student.term_type === "2 months" ? 2 : 
                            student.term_type === "3 months" ? 3 : 4;
        const yearlyFee = (12 / termDuration) * student.fee_amount;
        const currentTotalPaid = fee.total_paid || 0;
        const currentRemaining = Math.max(0, yearlyFee - currentTotalPaid);
        
        pending += currentRemaining;
        paid += currentTotalPaid;
        
        if (fee.status === "pending" && new Date(fee.due_date) < new Date()) {
          overdue++;
        }
      }
    });

    return { totalPending: pending, totalPaid: paid, overdueCount: overdue };
  })();

  const handleAddFeeRecord = async () => {
    if (!selectedStudent || !termNumber) {
      toast({
        title: "Error",
        description: "Please select a student and term number",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    const termDuration = student.term_type === "2 months" ? 2 : 
                        student.term_type === "3 months" ? 3 : 4;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + termDuration);

    // Calculate yearly fee
    const yearlyFee = (12 / termDuration) * student.fee_amount;

    const feeRecord = {
      student_id: student.id,
      student_name: student.name,
      class: student.class,
      amount: yearlyFee,
      term_type: student.term_type,
      term_number: parseInt(termNumber),
      due_date: dueDate.toISOString().split('T')[0],
      status: "pending" as const,
      remaining_amount: yearlyFee,
      total_paid: 0,
    };

    const result = await addFeeRecord(feeRecord);
    
    if (result) {
      setSelectedStudent("");
      setTermNumber("");
      setIsAddDialogOpen(false);
    }
  };

  const handlePaymentAdded = () => {
    refetchFeeRecords();
    refetchStudents();
  };

  const handleCardDeleted = () => {
    refetchFeeRecords();
    refetchStudents();
  };

  const handleExportToExcel = () => {
    const feeData = fees.map(fee => {
      const student = students.find(s => s.id === fee.student_id);
      if (!student) return null;
      
      const termDuration = student.term_type === "2 months" ? 2 : 
                          student.term_type === "3 months" ? 3 : 4;
      const yearlyFee = (12 / termDuration) * student.fee_amount;
      const totalPaid = fee.total_paid || 0;
      const remainingAmount = Math.max(0, yearlyFee - totalPaid);
      
      return {
        StudentName: fee.student_name,
        Class: fee.class,
        YearlyFee: yearlyFee,
        TotalPaid: totalPaid,
        RemainingAmount: remainingAmount,
        TermType: fee.term_type,
        TermNumber: fee.term_number,
        DueDate: fee.due_date,
        PaidDate: fee.paid_date || "Not Paid",
        Status: remainingAmount <= 0 ? "paid" : "pending",
      };
    }).filter(Boolean);
    
    exportToExcel(feeData, "Fee_Tracking_Data", "fees");
    toast({
      title: "Success",
      description: "Fee data exported to Excel successfully!",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fee Tracking</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage student fee payments and track individual student fees
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExportToExcel} 
            variant="outline" 
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" size="sm">
                <Plus className="w-4 h-4" />
                Add Fee Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Fee Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - Class {student.class} (₹{student.fee_amount}/{student.term_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term Number</label>
                  <Select value={termNumber} onValueChange={setTermNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(num => (
                        <SelectItem key={num} value={num.toString()}>Term {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddFeeRecord} className="w-full">
                  Add Fee Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Collected</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                  ₹{totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Pending Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600 truncate">
                  ₹{totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Overdue Payments</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Fee Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="w-5 h-5" />
            Student Fee Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {fees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No fee records found. Add fee records to get started.
            </div>
          )}
          
          {/* Responsive Grid for Fee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {fees.map((feeRecord) => {
              const student = students.find(s => s.id === feeRecord.student_id);
              if (!student) return null;
              
              return (
                <StudentFeeCard
                  key={feeRecord.id}
                  student={student}
                  feeRecord={feeRecord}
                  onPaymentAdded={handlePaymentAdded}
                  onCardDeleted={handleCardDeleted}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
