
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";
import { useFeeCalculations } from "@/hooks/useFeeCalculations";
import { PaymentDialog } from "./PaymentDialog";
import { FeeCardActions } from "./FeeCardActions";
import { StudentPaymentDetails } from "./StudentPaymentDetails";

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
}

interface StudentFeeCardProps {
  student: Student;
  feeRecord?: FeeRecord;
  onPaymentAdded: () => void;
  onCardDeleted: () => void;
}

export function StudentFeeCard({ student, feeRecord, onPaymentAdded, onCardDeleted }: StudentFeeCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { yearlyFee, totalPaid, remainingAmount } = useFeeCalculations(student, feeRecord);

  const handleViewDetails = () => {
    setIsDetailsDialogOpen(true);
  };

  return (
    <Card className="w-full relative">
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
          <div className="flex-shrink-0">
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
