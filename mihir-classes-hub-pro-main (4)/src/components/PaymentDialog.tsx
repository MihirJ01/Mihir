import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  feeRecord?: FeeRecord;
  remainingAmount: number;
  yearlyFee: number;
  onPaymentAdded: () => void;
}

export function PaymentDialog({ 
  isOpen, 
  onOpenChange, 
  student, 
  feeRecord, 
  remainingAmount, 
  yearlyFee, 
  onPaymentAdded 
}: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [remarks, setRemarks] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (Number(amount) > remainingAmount) {
      toast({
        title: "Error", 
        description: "Payment amount cannot exceed remaining amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let paymentLeft = Number(amount);
      // Fetch all fee records for the student, ordered by term_number
      const { data: feeRecords, error: feeRecordsError } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .order('term_number', { ascending: true });
      if (feeRecordsError) throw new Error('Failed to fetch fee records');

      for (const term of feeRecords) {
        if (paymentLeft <= 0) break;
        const termRemaining = term.remaining_amount || (term.amount - (term.total_paid || 0));
        if (termRemaining <= 0) continue; // Already paid
        const payToThisTerm = Math.min(paymentLeft, termRemaining);

        // Insert payment record for this term
        const { error: paymentError } = await supabase
        .from('fee_payments')
        .insert({
          student_id: student.id,
            amount_paid: payToThisTerm,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          student_name: student.name,
          remarks: remarks || null,
            fee_record_id: term.id
          });
        if (paymentError) throw new Error('Failed to record payment');

        // Update fee record for this term
        const newTotalPaid = (term.total_paid || 0) + payToThisTerm;
        const newRemainingAmount = Math.max(0, term.amount - newTotalPaid);
        const newStatus = newRemainingAmount <= 0 ? "paid" : "pending";
        const { error: updateError } = await supabase
          .from('fee_records')
          .update({
            total_paid: newTotalPaid,
            remaining_amount: newRemainingAmount,
            status: newStatus,
            paid_date: newStatus === "paid" ? paymentDate : null
          })
          .eq('id', term.id);
        if (updateError) throw new Error('Failed to update fee record');

        paymentLeft -= payToThisTerm;
      }

      // Show success toast only once
      toast({
        title: "Success",
        description: "Payment recorded successfully!",
      });

      // Reset form
      setAmount("");
      setRemarks("");
      setPaymentMethod("cash");
      setPaymentDate(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      onPaymentAdded();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment - {student.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">Remaining Amount: ₹{remainingAmount.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={remainingAmount}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
