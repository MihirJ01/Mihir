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
        if (!previewRef.current || payments.length === 0) {
          toast({
            title: "Error",
            description: "No payment data available to capture",
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
      }
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex items-center justify-center min-h-[90vh] flex-col py-8 sm:py-12">
          {/* Payment Details Header at the very top */}
          <div className="flex items-center justify-center w-full mb-2 mt-2">
            <DollarSign className="w-6 h-6 text-blue-600 mr-1" />
            <span className="text-xl font-bold text-gray-900">Payment Details - {student.name}</span>
          </div>

          <style>{captureModeStyle}</style>

          <div className="space-y-6">
            {/* Card preview for WhatsApp sharing */}
            <div ref={previewRef} className="w-full flex justify-center">
              <Card className={`w-full max-w-full sm:max-w-lg shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/60 rounded-3xl flex-grow mx-auto mt-4 min-h-[600px]${captureMode ? ' capture-mode' : ''} p-2 sm:p-6`}>
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
            </div>
            {/* WhatsApp Button below card, only if not loading and there is payment data */}
            {(!loading && payments.length > 0) && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={async () => {
                    setCaptureMode(true);
                    await new Promise(r => setTimeout(r, 500)); // allow DOM to update (increased to 500ms)
                    if (!previewRef.current) return;
                    try {
                      const canvas = await html2canvas(previewRef.current, { backgroundColor: '#fff', scale: 2 });
                      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                      if (!blob) throw new Error('Failed to capture image');
                      await navigator.clipboard.write([
                        new window.ClipboardItem({ 'image/png': blob as Blob })
                      ]);
                      toast({ title: 'Copied!', description: 'Fee card image copied. Paste it in WhatsApp Web.', variant: 'default' });
                      window.open('https://web.whatsapp.com/', '_blank');
                    } catch (err) {
                      toast({ title: 'Error', description: 'Failed to copy image to clipboard', variant: 'destructive' });
                    } finally {
                      setCaptureMode(false);
                    }
                  }}
                  style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
                  className="gap-2 font-semibold rounded-lg shadow px-6 py-2 text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16.001 3.2c-7.067 0-12.8 5.733-12.8 12.8 0 2.267.6 4.467 1.733 6.4l-1.867 6.933 7.067-1.867c1.867 1.067 4 1.6 6.133 1.6h.001c7.067 0 12.8-5.733 12.8-12.8s-5.733-12.8-12.8-12.8zm6.933 19.467c-.267.8-1.467 1.467-2 1.6-.533.133-1.2.267-2.067.133-.467-.067-1.067-.2-1.867-.4-4.133-1.067-6.8-5.067-7.067-5.333-.2-.267-1.733-2.267-1.733-4.267 0-2 .8-2.933 1.067-3.2.267-.267.6-.4.8-.4.2 0 .4 0 .533.007.167.007.4.027.6.467.233.533.8 1.867.867 2.007.067.133.133.267.067.4-.067.133-.1.2-.2.333-.1.133-.2.233-.267.333-.133.2-.267.4-.133.667.133.267.6 1.067 1.267 1.733.867.867 1.6 1.133 1.867 1.267.267.133.4.1.533-.067.133-.167.6-.667.767-.9.167-.233.333-.2.567-.133.233.067 1.467.7 1.733.833.267.133.433.2.5.333.067.133.067.767-.167 1.5-.233.733-.7 1.067-.933 1.2-.233.133-.467.2-.733.133-.267-.067-1.067-.4-2.067-1.267-1.067-.867-1.733-1.933-1.933-2.267-.2-.333-.2-.6-.133-.733.067-.133.2-.2.333-.267.133-.067.267-.133.4-.267.133-.133.267-.267.333-.4.067-.133.067-.267.067-.4 0-.133-.067-.267-.133-.4-.067-.133-.633-1.467-.867-2.007-.233-.533-.433-.467-.6-.467-.167 0-.333 0-.533.007-.2.007-.533.133-.8.4-.267.267-1.067 1.2-1.067 3.2 0 2 .933 4 1.733 4.267.267.267 2.933 4.267 7.067 5.333.8.2 1.4.333 1.867.4.867.133 1.533 0 2.067-.133.533-.133 1.733-.8 2-1.6.267-.8.267-1.467.2-1.6-.067-.133-.267-.2-.533-.267-.267-.067-1.6-.8-1.867-.9-.267-.1-.433-.133-.6.133-.167.267-.667.9-.767 1.033-.1.133-.2.2-.333.267-.133.067-.267.067-.4.067-.133 0-.267-.067-.4-.133-.267-.133-1.067-.4-1.867-1.267-.867-.867-1.133-1.6-1.267-1.867-.133-.267-.1-.4.067-.533.167-.133.667-.6.9-.767.233-.167.2-.333.133-.567-.067-.233-.7-1.467-.833-1.733-.133-.267-.2-.433-.333-.5-.133-.067-.767-.067-1.5.167-.733.233-1.067.7-1.2.933-.133.233-.2.467-.133.733.067.267.4 1.067 1.267 2.067.867 1.067 1.933 1.733 2.267 1.933.333.2.6.2.733.133.133-.067.2-.2.267-.333.067-.133.133-.267.267-.4.133-.133.267-.267.4-.333.133-.067.267-.067.4-.067.133 0 .267.067.4.133.267.133 1.067.4 1.867 1.267.867.867 1.133 1.6 1.267 1.867.133.267.1.4-.067.533-.167.133-.667.6-.9.767-.233.167-.2.333-.133.567.067.233.7 1.467.833 1.733.133.267.2.433.333.5.133.067.767.067 1.5-.167.733-.233 1.067-.7 1.2-.933.133-.233.2-.467.133-.733-.067-.267-.4-1.067-1.267-2.067-.867-1.067-1.933-1.733-2.267-1.933-.333-.2-.6-.2-.733-.133-.133.067-.2.2-.267.333-.067.133-.133.267-.267.4-.133.133-.267.267-.4.333-.133.067-.267.067-.4.067z"/></svg>
                  WhatsApp
                </Button>
              </div>
            )}

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
    const paidAmounts = termPayments.map(p => `${p.amount_paid}₹`).join(", ");
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
    <Card className="p-2 sm:p-4 bg-white/80 shadow border-0 mb-2">
      <table className="min-w-full text-xs border-2 border-blue-300 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-3">Term</th>
            <th className="border px-2 py-3">Fee</th>
            <th className="border px-2 py-3">Paid</th>
            <th className="border px-2 py-3">Paid Dates</th>
            <th className="border px-2 py-3">Remaining</th>
            <th className="border px-2 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term, idx) => (
            <tr key={term.term} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100 transition'}>
              <td className="border px-2 py-3 text-center font-semibold">{term.term}</td>
              <td className="border px-2 py-3 text-center">₹{term.fee}</td>
              <td className="border px-2 py-3 text-center">{term.paid}</td>
              <td className="border px-2 py-3 text-center">{term.paidDates || '-'}</td>
              <td className="border px-2 py-3 text-center">₹{term.remaining}</td>
              <td className="border px-2 py-3 text-center">
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
