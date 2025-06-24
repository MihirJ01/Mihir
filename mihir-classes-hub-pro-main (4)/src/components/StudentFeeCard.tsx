import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus, MoreVertical } from "lucide-react";
import { useFeeCalculations } from "@/hooks/useFeeCalculations";
import { PaymentDialog } from "./PaymentDialog";
import { FeeCardActions } from "./FeeCardActions";
import { StudentPaymentDetails } from "./StudentPaymentDetails";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  name: string;
  class: string;
  board: string;
  fee_amount: number;
  term_type: string;
}

interface FeeRecord {
  id: string;
  student_id: string;
  remaining_amount: number;
  total_paid: number;
  amount: number;
  status: string;
  term_number?: number;
}

interface StudentFeeCardProps {
  student: Student;
  feeRecords: FeeRecord[];
  onPaymentAdded: () => void;
  onCardDeleted: () => void;
  draggable?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

export function StudentFeeCard({ student, feeRecords, onPaymentAdded, onCardDeleted, draggable = false, onDragStart, onDragEnd }: StudentFeeCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const feeRecord = feeRecords[0];
  const { yearlyFee, totalPaid, remainingAmount } = useFeeCalculations(student, feeRecord);
  const { toast } = useToast();

  // Sort feeRecords by term_number for display
  const sortedFeeRecords = [...feeRecords].sort((a, b) => (a.term_number || 0) - (b.term_number || 0));

  // Ensure 4 terms for State Board
  let displayTerms = [...sortedFeeRecords];
  if (student.board === "State Board" && displayTerms.length < 4) {
    for (let i = displayTerms.length + 1; i <= 4; i++) {
      displayTerms.push({
        id: `placeholder-${i}`,
        student_id: student.id,
        term_number: i,
        amount: student.fee_amount,
        total_paid: 0,
        remaining_amount: student.fee_amount,
        status: "pending"
      });
    }
  }

  // Handler to reset all pending amounts to zero
  const handleResetPending = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const term of feeRecords) {
        await fetch(`/api/reset-fee-record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: term.id,
            total_paid: term.amount,
            remaining_amount: 0,
            status: 'paid',
            paid_date: today
          })
        });
      }
      toast({ title: 'Success', description: 'Pending amount reset to zero!' });
      onPaymentAdded();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset pending amount', variant: 'destructive' });
    }
  };

  const handleViewDetails = () => {
    setIsDetailsDialogOpen(true);
  };

  return (
    <Card
      className="w-full relative"
      draggable={draggable}
      onDragStart={draggable ? () => onDragStart && onDragStart(student.id) : undefined}
      onDragEnd={draggable ? () => onDragEnd && onDragEnd() : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{student.name}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Class {student.class} - {student.board}
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <FeeCardActions 
              student={student}
              feeRecord={feeRecord}
              onCardDeleted={onCardDeleted}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fee Information Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-blue-700">Yearly Fee</p>
            <p className="text-lg sm:text-xl font-bold text-blue-900">₹{yearlyFee.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-green-700">Total Paid</p>
            <p className="text-lg sm:text-xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs sm:text-sm font-medium text-orange-700">Remaining Amount</p>
          <p className="text-lg sm:text-xl font-bold text-orange-900">₹{remainingAmount.toLocaleString()}</p>
        </div>

        <div className="text-xs sm:text-sm text-gray-600">
          <p>Term: ₹{student.fee_amount} / {student.term_type}</p>
        </div>

        {/* Term-wise Fee Breakdown */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Term-wise Fee Status</h4>
          {displayTerms && displayTerms.length > 0 ? (
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Term</th>
                  <th className="border px-2 py-1">Fee</th>
                  <th className="border px-2 py-1">Paid</th>
                  <th className="border px-2 py-1">Remaining</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayTerms.map(term => (
                  <tr key={term.id}>
                    <td className="border px-2 py-1 text-center">{term.term_number}</td>
                    <td className="border px-2 py-1 text-center">₹{term.amount}</td>
                    <td className="border px-2 py-1 text-center">₹{term.total_paid || 0}</td>
                    <td className="border px-2 py-1 text-center">₹{term.remaining_amount || (term.amount - (term.total_paid || 0))}</td>
                    <td className="border px-2 py-1 text-center">{term.status === 'paid' ? 'Paid' : term.total_paid > 0 ? 'Partially Paid' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No term records found.</div>
          )}
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <Button 
            onClick={() => setIsPaymentDialogOpen(true)}
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
            disabled={remainingAmount <= 0}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </Button>

          <div className="flex justify-center sm:justify-end">
            <Button 
              onClick={handleViewDetails}
              variant="outline" 
              className="gap-2 w-full sm:w-auto" 
              size="sm"
            >
              View Details
            </Button>
          </div>
        </div>

        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          student={student}
          feeRecord={feeRecord}
          remainingAmount={remainingAmount}
          yearlyFee={yearlyFee}
          onPaymentAdded={onPaymentAdded}
        />

        <StudentPaymentDetails
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          student={student}
        />
      </CardContent>
    </Card>
  );
}
