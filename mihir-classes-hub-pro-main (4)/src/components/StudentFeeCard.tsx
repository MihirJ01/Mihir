import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus, MoreVertical, Pencil } from "lucide-react";
import { useFeeCalculations } from "@/hooks/useFeeCalculations";
import { PaymentDialog } from "./PaymentDialog";
import { FeeCardActions } from "./FeeCardActions";
import { StudentPaymentDetails, StudentPaymentDetailsRef } from "./StudentPaymentDetails";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";

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
  paid_date?: string;
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

function EditFeeTermsDialog({ open, onOpenChange, terms, onSave }) {
  const [editedTerms, setEditedTerms] = useState(() => terms.map(term => ({ ...term, paid_date: term.paid_date || '' })));
  const [saving, setSaving] = useState(false);
  const [openPaymentsTerm, setOpenPaymentsTerm] = useState(null);

  // Refresh editedTerms when dialog opens or terms change
  useEffect(() => {
    if (open) {
      setEditedTerms(terms.map(term => ({ ...term, paid_date: term.paid_date || '' })));
    }
  }, [open, terms]);

  const handlePaidChange = (idx, value) => {
    setEditedTerms(editedTerms => editedTerms.map((term, i) => {
      if (i !== idx) return term;
      const paid = Number(value);
      const remaining = Math.max(0, term.amount - paid);
      let status = 'pending';
      if (remaining <= 0) status = 'paid';
      else if (paid > 0) status = 'partially_paid';
      return { ...term, total_paid: paid, remaining_amount: remaining, status };
    }));
  };

  const handleDateChange = (idx, value) => {
    setEditedTerms(editedTerms => editedTerms.map((term, i) => i === idx ? { ...term, paid_date: value } : term));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editedTerms);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Term-wise Fee</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left rounded-tl-lg">Term</th>
                <th className="px-3 py-2 text-left">Fee</th>
                <th className="px-3 py-2 text-left">Paid</th>
                <th className="px-3 py-2 text-left">Remaining</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left rounded-tr-lg">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {editedTerms.map((term, idx) => (
                <tr key={term.id} className="bg-white shadow rounded-lg">
                  <td className="px-3 py-2 font-semibold">{term.term_number}</td>
                  <td className="px-3 py-2">₹{term.amount}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24 focus:outline-blue-500"
                      value={term.total_paid}
                      min={0}
                      max={term.amount}
                      onChange={e => handlePaidChange(idx, e.target.value)}
                      disabled={saving}
                    />
                  </td>
                  <td className="px-3 py-2">₹{term.remaining_amount}</td>
                  <td className="px-3 py-2">
                    <span className={`font-medium ${term.status === 'paid' ? 'text-green-600' : term.status === 'partially_paid' ? 'text-orange-600' : 'text-gray-600'}`}>
                      {term.status === 'paid' ? 'Paid' : term.status === 'partially_paid' ? 'Partially Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      className="border rounded px-2 py-1 w-36 focus:outline-blue-500"
                      value={term.paid_date || ''}
                      onChange={e => handleDateChange(idx, e.target.value)}
                      disabled={saving}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white w-full py-2 text-base font-semibold rounded-lg shadow">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StudentFeeCard({ student, feeRecords, onPaymentAdded, onCardDeleted, draggable = false, onDragStart, onDragEnd }: StudentFeeCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const feeRecord = feeRecords[0];
  const { yearlyFee, totalPaid, remainingAmount } = useFeeCalculations(student, feeRecord);
  const { toast } = useToast();
  const paymentDetailsRef = useRef<StudentPaymentDetailsRef>(null);

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

  const handleSaveTerms = async (editedTerms) => {
    let hasError = false;
    for (const term of editedTerms) {
      // Update fee_records
      const { error } = await supabase
        .from('fee_records')
        .update({
          total_paid: term.total_paid,
          remaining_amount: term.remaining_amount,
          status: term.status,
          paid_date: term.paid_date || null,
        })
        .eq('id', term.id);
      if (error) {
        hasError = true;
        toast({ title: 'Error', description: `Failed to update term ${term.term_number}: ${error.message}`, variant: 'destructive' });
      }
      // Sync fee_payments for this term
      if (term.total_paid > 0) {
        // Check if a payment exists for this fee_record_id
        const { data: existingPayments, error: fetchError } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('fee_record_id', term.id);
        if (fetchError) {
          hasError = true;
          toast({ title: 'Error', description: `Failed to fetch payment for term ${term.term_number}: ${fetchError.message}`, variant: 'destructive' });
        } else if (existingPayments && existingPayments.length > 0) {
          // Update the first payment record
          const paymentId = existingPayments[0].id;
          const { error: updatePayError } = await supabase
            .from('fee_payments')
            .update({
              amount_paid: term.total_paid,
              payment_date: term.paid_date || null,
              student_id: term.student_id,
              student_name: term.student_name,
              fee_record_id: term.id,
            })
            .eq('id', paymentId);
          if (updatePayError) {
            hasError = true;
            toast({ title: 'Error', description: `Failed to update payment for term ${term.term_number}: ${updatePayError.message}`, variant: 'destructive' });
          }
        } else {
          // Insert a new payment record
          const { error: insertPayError } = await supabase
            .from('fee_payments')
            .insert({
              amount_paid: term.total_paid,
              payment_date: term.paid_date || null,
              student_id: term.student_id,
              student_name: term.student_name,
              fee_record_id: term.id,
            });
          if (insertPayError) {
            hasError = true;
            toast({ title: 'Error', description: `Failed to insert payment for term ${term.term_number}: ${insertPayError.message}`, variant: 'destructive' });
          }
        }
      } else {
        // If total_paid is 0, optionally delete any payment record for this term
        await supabase
          .from('fee_payments')
          .delete()
          .eq('fee_record_id', term.id);
      }
    }
    if (!hasError) {
      toast({ title: 'Success', description: 'Term-wise fee updated successfully!' });
    }
    onPaymentAdded();
  };

  const handleWhatsAppClick = async () => {
    try {
      // First open the payment details dialog to load the data
      setIsDetailsDialogOpen(true);
      
      // Wait for the dialog to open and data to load
      setTimeout(async () => {
        try {
          // Debug: log the previewNode
          console.log('previewNode:', paymentDetailsRef.current?.previewNode);
          const blob = await paymentDetailsRef.current?.captureExcelPreview();
          if (!blob) {
            toast({ title: 'Error', description: 'Failed to capture card image', variant: 'destructive' });
            setIsDetailsDialogOpen(false);
            return;
          }
          
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          
          toast({ title: 'Copied!', description: 'Fee report image copied to clipboard. Paste it in WhatsApp Web.' });
          window.open('https://web.whatsapp.com/', '_blank');
          
          // Close the dialog after copying
          setIsDetailsDialogOpen(false);
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to copy image to clipboard', variant: 'destructive' });
          setIsDetailsDialogOpen(false);
        }
      }, 2000); // Wait 2 seconds for dialog to load data
      
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to open payment details', variant: 'destructive' });
    }
  };

  return (
    <Card
      className="w-full relative bg-white/90 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 animate-fade-in"
      draggable={draggable}
      onDragStart={draggable ? () => onDragStart && onDragStart(student.id) : undefined}
      onDragEnd={draggable ? () => onDragEnd && onDragEnd() : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900">
              <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
              onEdit={() => setIsEditDialogOpen(true)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fee Information Grid - Responsive */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">Yearly Fee</p>
            <p className="text-xl font-bold text-blue-900">₹{yearlyFee.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-700">Total Paid</p>
            <p className="text-xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-xs font-semibold text-orange-700">Remaining Amount</p>
          <p className="text-xl font-bold text-orange-900">₹{remainingAmount.toLocaleString()}</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          <p>Term: ₹{student.fee_amount} / {student.term_type}</p>
        </div>
        {/* Term-wise Fee Breakdown */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Term-wise Fee Status</h4>
          {displayTerms && displayTerms.length > 0 ? (
            <table className="min-w-full text-xs border rounded-xl overflow-hidden">
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
        <div className="flex w-full justify-center mt-2">
          <div className="flex flex-row gap-2">
            <Button 
              onClick={() => setIsPaymentDialogOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto font-semibold rounded-lg shadow"
              disabled={remainingAmount <= 0}
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Payment
            </Button>
            <Button 
              onClick={handleWhatsAppClick}
              variant="outline" 
              className="gap-2 w-full sm:w-auto font-semibold rounded-lg shadow"
              size="sm"
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16.001 3.2c-7.067 0-12.8 5.733-12.8 12.8 0 2.267.6 4.467 1.733 6.4l-1.867 6.933 7.067-1.867c1.867 1.067 4 1.6 6.133 1.6h.001c7.067 0 12.8-5.733 12.8-12.8s-5.733-12.8-12.8-12.8zm6.933 19.467c-.267.8-1.467 1.467-2 1.6-.533.133-1.2.267-2.067.133-.467-.067-1.067-.2-1.867-.4-4.133-1.067-6.8-5.067-7.067-5.333-.2-.267-1.733-2.267-1.733-4.267 0-2 .8-2.933 1.067-3.2.267-.267.6-.4.8-.4.2 0 .4 0 .533.007.167.007.4.027.6.467.233.533.8 1.867.867 2.007.067.133.133.267.067.4-.067.133-.1.2-.2.333-.1.133-.2.233-.267.333-.133.2-.267.4-.133.667.133.267.6 1.067 1.267 1.733.867.867 1.6 1.133 1.867 1.267.267.133.4.1.533-.067.133-.167.6-.667.767-.9.167-.233.333-.2.567-.133.233.067 1.467.7 1.733.833.267.133.433.2.5.333.067.133.067.767-.167 1.5-.233.733-.7 1.067-.933 1.2-.233.133-.467.2-.733.133-.267-.067-1.067-.4-2.067-1.267-1.067-.867-1.733-1.933-1.933-2.267-.2-.333-.2-.6-.133-.733.067-.133.2-.2.333-.267.133-.067.267-.133.4-.267.133-.133.267-.267.333-.4.067-.133.067-.267.067-.4 0-.133-.067-.267-.133-.4-.067-.133-.633-1.467-.867-2.007-.233-.533-.433-.467-.6-.467-.167 0-.333 0-.533.007-.2.007-.533.133-.8.4-.267.267-1.067 1.2-1.067 3.2 0 2 .933 4 1.733 4.267.267.267 2.933 4.267 7.067 5.333.8.2 1.4.333 1.867.4.867.133 1.533 0 2.067-.133.533-.133 1.733-.8 2-1.6.267-.8.267-1.467.2-1.6-.067-.133-.267-.2-.533-.267-.267-.067-1.6-.8-1.867-.9-.267-.1-.433-.133-.6.133-.167.267-.667.9-.767 1.033-.1.133-.2.2-.333.267-.133.067-.267.067-.4.067-.133 0-.267-.067-.4-.133-.267-.133-1.067-.4-1.867-1.267-.867-.867-1.133-1.6-1.267-1.867-.133-.267-.1-.4.067-.533.167-.133.667-.6.9-.767.233-.167.2-.333.133-.567-.067-.233-.7-1.467-.833-1.733-.133-.267-.2-.433-.333-.5-.133-.067-.767-.067-1.5.167-.733.233-1.067.7-1.2.933-.133.233-.2.467-.133.733.067.267.4 1.067 1.267 2.067.867 1.067 1.933 1.733 2.267 1.933.333.2.6.2.733.133.133-.067.2-.2.267-.333.067-.133.133-.267.267-.4.133-.133.267-.267.4-.333.133-.067.267-.067.4-.067.133 0 .267.067.4.133.267.133 1.067.4 1.867 1.267.867.867 1.133 1.6 1.267 1.867.133.267.1.4-.067.533-.167.133-.667.6-.9.767-.233.167-.2.333-.133.567.067.233.7 1.467.833 1.733.133.267.2.433.333.5.133.067.767.067 1.5-.167.733-.233 1.067-.7 1.2-.933.133-.233.2-.467.133-.733-.067-.267-.4-1.067-1.267-2.067-.867-1.067-1.933-1.733-2.267-1.933-.333-.2-.6-.2-.733-.133-.133.067-.2.2-.267.333-.067.133-.133.267-.267.4-.133.133-.267.267-.4.333-.133.067-.267.067-.4.067z"/></svg>
            </Button>
            <Button 
              onClick={handleViewDetails}
              variant="outline" 
              className="gap-2 w-full sm:w-auto font-semibold rounded-lg shadow"
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

        <EditFeeTermsDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          terms={feeRecords}
          onSave={handleSaveTerms}
        />

        <StudentPaymentDetails
          ref={paymentDetailsRef}
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          student={student}
        />
      </CardContent>
    </Card>
  );
}
