
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, CreditCard } from "lucide-react";

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

export function StudentPaymentDetails({ isOpen, onOpenChange, student }: StudentPaymentDetailsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

          {loading ? (
            <div className="text-center py-8">Loading payment history...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment records found for this student.
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Trend (Cumulative)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            `₹${Number(value).toLocaleString()}`, 
                            name === 'cumulative' ? 'Total Paid' : 'Payment Amount'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Individual Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                        />
                        <Bar dataKey="amount" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">₹{Number(payment.amount_paid).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                          </p>
                          {payment.remarks && (
                            <p className="text-sm text-gray-500 italic">{payment.remarks}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
