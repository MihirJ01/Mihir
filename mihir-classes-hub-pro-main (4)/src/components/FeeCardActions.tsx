
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel } from "@/utils/excelExport";

interface FeeCardActionsProps {
  student: {
    id: string;
    name: string;
    class: string;
    board: string;
  };
  feeRecord?: {
    id: string;
  };
  onCardDeleted: () => void;
  onViewDetails: () => void;
}

export function FeeCardActions({ student, feeRecord, onCardDeleted, onViewDetails }: FeeCardActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleExportReport = async () => {
    try {
      const { data: payments, error } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('student_id', student.id)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch payment records",
          variant: "destructive",
        });
        return;
      }

      const reportData = payments.map(payment => ({
        StudentName: student.name,
        Class: student.class,
        Board: student.board,
        PaymentDate: payment.payment_date,
        AmountPaid: payment.amount_paid,
        PaymentMethod: payment.payment_method,
        Remarks: payment.remarks || 'N/A'
      }));

      exportToExcel(reportData, `${student.name}_Payment_Report`, "payments");
      
      toast({
        title: "Success",
        description: "Payment report exported successfully!",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export payment report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = async () => {
    setIsDeleting(true);
    try {
      if (feeRecord) {
        // Delete fee record
        const { error: feeError } = await supabase
          .from('fee_records')
          .delete()
          .eq('id', feeRecord.id);

        if (feeError) {
          console.error('Error deleting fee record:', feeError);
          throw new Error('Failed to delete fee record');
        }

        // Delete associated payments
        const { error: paymentsError } = await supabase
          .from('fee_payments')
          .delete()
          .eq('student_id', student.id);

        if (paymentsError) {
          console.error('Error deleting payments:', paymentsError);
        }
      }

      toast({
        title: "Success",
        description: "Fee card deleted successfully!",
      });

      onCardDeleted();
    } catch (error) {
      console.error('Error deleting fee card:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete fee card",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportReport} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Export Report
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onViewDetails} className="gap-2">
            <Eye className="w-4 h-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee card? This will remove all payment records for {student.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCard} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
