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

export const StudentPaymentDetails = forwardRef<StudentPaymentDetailsRef, StudentPaymentDetailsProps>(
  ({ isOpen, onOpenChange, student }, ref) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const previewRef = useRef<HTMLDivElement>(null);

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Payment Details - {student.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="text-lg font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Yearly Fee</p>
                      <p className="text-lg font-bold text-blue-600">₹{yearlyFee.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-lg font-bold text-orange-600">₹{remainingAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {/* TODO: Implement PDF export */}}>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* TODO: Implement Excel export */}}>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportImage}>Export as Image</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading payment history...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payment records found for this student.
              </div>
            ) : (
              <>
                <div ref={previewRef}>
                  <FeeCardExcelPreview student={student} payments={payments} logoUrl="/lovable-uploads/image.png" />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
