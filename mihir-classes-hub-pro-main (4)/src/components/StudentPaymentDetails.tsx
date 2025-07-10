import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, CreditCard } from "lucide-react";
import FeeCardExcelPreview from "./FeeCardExcelPreview";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

interface Student {
  id: string;
  name: string;
  class: string;
  board: string;
  fee_amount: number;
  term_type: string;
  photoUrl?: string;
}

interface Payment {
  id: string;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
  remarks?: string;
}

interface StudentPaymentDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

export interface StudentPaymentDetailsRef {
  captureExcelPreview: () => Promise<Blob | null>;
  previewNode?: HTMLDivElement | null;
}

// Add this style block at the top of the file (or in your global CSS if preferred)
const captureModeStyle = `
.capture-mode {
  background: #fff !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important;
  opacity: 1 !important;
  filter: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  animation: none !important;
  text-align: left !important;
  -webkit-font-smoothing: antialiased !important;
  font-smoothing: antialiased !important;
}
`;

export const StudentPaymentDetails = forwardRef<StudentPaymentDetailsRef, StudentPaymentDetailsProps>(
  ({ isOpen, onOpenChange, student }, ref) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const previewRef = useRef<HTMLDivElement>(null);
    const [captureMode, setCaptureMode] = useState(false);

    useImperativeHandle(ref, () => ({
      captureExcelPreview: async () => {
        if (!previewRef.current) {
          toast({
            title: "Error",
            description: "No card available to capture",
            variant: "destructive",
          });
          return null;
        }
        try {
          const canvas = await html2canvas(previewRef.current, { backgroundColor: '#fff', scale: 2 });
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
          });
          return blob;
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to capture Excel preview",
            variant: "destructive",
          });
          return null;
        }
      },
      previewNode: previewRef.current
    }));

    useEffect(() => {
      if (isOpen && student) {
        fetchPayments();
      }
    }, [isOpen, student]);

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('student_id', student.id)
          .order('payment_date', { ascending: true });

        if (error) {
          console.error('Error fetching payments:', error);
          toast({
            title: "Error",
            description: "Failed to fetch payment history",
            variant: "destructive",
          });
          return;
        }

        setPayments(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load payment details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const chartData = payments.map((payment, index) => {
      const cumulativeAmount = payments
        .slice(0, index + 1)
        .reduce((sum, p) => sum + Number(p.amount_paid), 0);
      
      return {
        date: new Date(payment.payment_date).toLocaleDateString(),
        amount: Number(payment.amount_paid),
        cumulative: cumulativeAmount,
        paymentMethod: payment.payment_method,
      };
    });

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);
    const termDuration = student.term_type === "2 months" ? 2 : 
                        student.term_type === "3 months" ? 3 : 4;
    const yearlyFee = (12 / termDuration) * student.fee_amount;
    const remainingAmount = Math.max(0, yearlyFee - totalPaid);

    const handleExportImage = async () => {
      if (!previewRef.current) return;
      const canvas = await html2canvas(previewRef.current, { backgroundColor: '#fff', scale: 2 });
      const link = document.createElement('a');
      link.download = `${student.name}_FeeCard.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-screen h-screen max-w-full max-h-full rounded-none p-0 flex flex-col sm:max-w-4xl sm:max-h-[90vh] sm:rounded-2xl sm:p-8 sm:items-center sm:justify-center sm:flex-col">
          <DialogTitle>Payment Details</DialogTitle>
          <div className="flex items-center justify-between w-full px-4 pt-4 sm:justify-center sm:pt-0 sm:px-0 sm:mb-2 sm:mt-2">
            <span className="text-lg font-bold text-gray-900 sm:text-xl">Payment Details - {student.name}</span>
            {/* The close button is rendered by DialogContent, so no need to add it here unless custom */}
          </div>
          <div className="flex-1 overflow-y-auto w-full px-2 pb-4 sm:w-full sm:px-0 sm:pb-0">
            <Card className="w-full max-w-full bg-gradient-to-br from-white via-blue-50 to-blue-100/60 rounded-none p-2 mx-auto sm:rounded-3xl sm:max-w-lg sm:p-6 sm:mt-4 sm:min-h-[600px]">
                <div className="w-full relative pt-4 sm:pt-6 pb-2 flex items-center justify-center">
                  <div className="absolute left-2 sm:left-6 top-1 flex items-center">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-blue-200 shadow-sm object-cover" />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-blue-200 shadow-sm bg-blue-200 flex items-center justify-center">
                        <span className="text-xl sm:text-3xl font-bold text-blue-800">
                          {student.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 justify-center">
                        <img src='/lovable-uploads/image.png' alt='Logo' className='w-6 h-6 sm:w-8 sm:h-8' />
                        <span className="text-2xl sm:text-3xl font-extrabold tracking-wide text-blue-900 drop-shadow">Mihir Classes</span>
                      </div>
                      <div className="h-1 w-20 sm:w-32 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full mt-2 mb-1" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-blue-900">
                        <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 font-bold align-middle">₹</span>
                        <span className="truncate bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1 text-sm sm:text-base">
                          {student.name}
                        </span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Class {student.class} - {student.board}
                      </p>
                    </div>
                  </div>
                  <div className="border-b border-blue-200 my-3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200 flex flex-col items-start shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-700">Yearly Fee</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-extrabold text-blue-900">₹{yearlyFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 sm:p-4 rounded-xl border border-green-200 flex flex-col items-start shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-5 h-5 text-green-500 font-bold align-middle">₹</span>
                        <span className="text-xs font-semibold text-green-700">Total Paid</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-extrabold text-green-900">₹{totalPaid.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 sm:p-4 rounded-xl border border-orange-200 flex flex-col items-start shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-700">Remaining Amount</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-orange-900">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Term: ₹{student.fee_amount} / {student.term_type}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Term-wise Fee Status</h4>
                    <div className="overflow-x-auto">
                      <TermWiseFeeTable student={student} payments={payments} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* WhatsApp Button and loading/empty states remain unchanged */}
              {loading ? (
                <div className="text-center py-8">Loading payment history...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment records found for this student.
                </div>
              ) : (
                <></>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    }
  );

// Helper component to render the term-wise fee table
function TermWiseFeeTable({ student, payments }) {
  // Calculate number of terms and per-term fee
  const termDuration = student.term_type === "2 months" ? 2 : student.term_type === "3 months" ? 3 : 4;
  const numberOfTerms = 12 / termDuration;
  const perTermFee = student.fee_amount;

  // Group payments by term
  let left = payments.map(p => Number(p.amount_paid));
  let paymentIdx = 0;
  const terms = [];
  for (let i = 1; i <= numberOfTerms; i++) {
    let termPaid = 0;
    let termLeft = perTermFee;
    let termPayments = [];
    while (paymentIdx < payments.length && termLeft > 0) {
      const pay = Math.min(left[paymentIdx], termLeft);
      if (pay > 0) {
        termPayments.push({ ...payments[paymentIdx], amount_paid: pay });
        left[paymentIdx] -= pay;
        termPaid += pay;
        termLeft -= pay;
      }
      if (left[paymentIdx] <= 0) paymentIdx++;
    }
    // Collect all payment dates for this term
    const paidDates = termPayments.map(p => {
      const d = new Date(p.payment_date);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }).join(", ");
    // Collect all paid amounts for this term
    const paidAmounts = termPayments.map(p => `₹${p.amount_paid}`).join(", ");
    terms.push({
      term: i,
      fee: perTermFee,
      paid: paidAmounts,
      remaining: perTermFee - termPaid,
      status: termPaid >= perTermFee ? 'Paid' : termPaid > 0 ? 'Partially Paid' : 'Pending',
      paidDates,
    });
  }

  return (
    <Card className="p-2 sm:p-3 bg-white/80 shadow border-0 mb-2 w-full max-w-4xl mx-auto">
      <table className="min-w-full text-[11px] border-2 border-blue-300 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-1 py-2">Term</th>
            <th className="border px-1 py-2">Fee</th>
            <th className="border px-1 py-2">Paid</th>
            <th className="border px-1 py-2">Paid Dates</th>
            <th className="border px-1 py-2">Remaining</th>
            <th className="border px-1 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term, idx) => (
            <tr key={term.term} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100 transition'}>
              <td className="border px-1 py-2 text-center font-semibold">{term.term}</td>
              <td className="border px-1 py-2 text-center">₹{term.fee}</td>
              <td className="border px-1 py-2 text-center">{term.paid}</td>
              <td className="border px-1 py-2 text-center">{term.paidDates || '-'}</td>
              <td className="border px-1 py-2 text-center">₹{term.remaining}</td>
              <td className="border px-1 py-2 text-center">
                <span className={
                  term.status === 'Paid'
                    ? 'text-green-700 font-bold'
                    : term.status === 'Partially Paid'
                    ? 'text-orange-700 font-bold'
                    : 'text-gray-600 font-bold'
                }>
                  {term.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export { TermWiseFeeTable };
