import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Download, DollarSign, AlertCircle, Users, Trash2, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { StudentFeeCard } from "./StudentFeeCard";
import { useFeeCalculations } from "@/hooks/useFeeCalculations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: feeRecordsData, addItem: addFeeRecord, refetch: refetchFeeRecords, deleteItem } = useSupabaseData("fee_records", { column: "created_at", ascending: true });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const { toast } = useToast();
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverDustbin, setDragOverDustbin] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  const students = studentsData as Student[];
  const fees = feeRecordsData as FeeRecord[];

  // Get unique batch times from students
  const batchOptions = Array.from(new Set(students.map(s => s.batch_time).filter(Boolean)));

  // Recalculate statistics when data changes
  const { totalPending, totalPaid, overdueCount } = (() => {
    let pending = 0;
    let paid = 0;
    let overdue = 0;

    fees
      .filter(fee => students.some(s => s.id === fee.student_id))
      .forEach(fee => {
        pending += fee.remaining_amount || 0;
        paid += fee.total_paid || 0;
        if (fee.status === "pending" && new Date(fee.due_date) < new Date()) {
          overdue++;
      }
    });

    return { totalPending: pending, totalPaid: paid, overdueCount: overdue };
  })();

  const handleAddFeeRecord = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;
    let numberOfTerms = 4;
    let termDuration = 3; // default for 4 terms (3 months per term)
    if (student.board === "CBSE") {
      termDuration = student.term_type === "2 months" ? 2 :
                     student.term_type === "3 months" ? 3 : 4;
      numberOfTerms = 12 / termDuration;
    }
    const perTermFee = student.fee_amount;
    for (let i = 1; i <= numberOfTerms; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + termDuration * (i - 1));
      const feeRecord = {
        student_id: student.id,
        student_name: student.name,
        class: student.class,
        amount: perTermFee,
        term_type: student.term_type,
        term_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        status: "pending" as const,
        remaining_amount: perTermFee,
        total_paid: 0,
      };
      await addFeeRecord(feeRecord);
    }
    setSelectedStudent("");
    setIsAddDialogOpen(false);
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

  // Handler to reset all pending amounts to zero
  const handleResetAllPending = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const fee of fees) {
        await supabase
          .from('fee_records')
          .update({
            total_paid: fee.amount,
            remaining_amount: 0,
            status: 'paid',
            paid_date: today
          })
          .eq('id', fee.id);
      }
      toast({ title: 'Success', description: 'All pending amounts reset to zero!' });
      refetchFeeRecords();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset pending amounts', variant: 'destructive' });
    }
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
                <Button onClick={handleAddFeeRecord} className="w-full">
                  Add Fee Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Batch Filter Dropdown */}
      <div className="flex justify-end mb-2">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batchOptions.map(batch => (
              <SelectItem key={batch} value={batch}>{batch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {students.map((student) => {
              const studentFeeRecords = fees.filter(fee => fee.student_id === student.id);
              if (studentFeeRecords.length === 0) return null;
              if (selectedBatch !== "all" && student.batch_time !== selectedBatch) return null;
              return (
                <StudentFeeCard
                  key={student.id}
                  student={student}
                  feeRecords={studentFeeRecords}
                  onPaymentAdded={handlePaymentAdded}
                  onCardDeleted={handleCardDeleted}
                  draggable={true}
                  onDragStart={(id) => setDraggingCardId(id)}
                  onDragEnd={() => setDraggingCardId(null)}
                />
              );
            })}
          </div>
          {/* Dustbin for drag-to-delete */}
          {draggingCardId && (
            <div
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
              onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
              onDragLeave={() => setDragOverDustbin(false)}
              onDrop={async e => {
                setDragOverDustbin(false);
                setDraggingCardId(null);
                // Delete the fee record for this card
                const fee = fees.find(f => f.student_id === draggingCardId);
                if (fee) {
                  await deleteItem(fee.id);
                  handleCardDeleted();
                }
              }}
              style={{ pointerEvents: "all" }}
            >
              <div className={`bg-white shadow-lg rounded-full p-4 border-2 ${dragOverDustbin ? "border-red-600" : "border-gray-300"}`}>
                <Trash2 className={`w-10 h-10 ${dragOverDustbin ? "text-red-600" : "text-gray-500"}`} />
              </div>
              <span className="mt-2 text-sm font-semibold text-gray-700">Drop here to delete</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
