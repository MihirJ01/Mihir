import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ExcelJS from 'exceljs';

interface FeeCardActionsProps {
  student: {
    id: string;
    name: string;
    class: string;
    board: string;
    term_type: string;
    fee_amount: number;
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
      // Load the MihirClasses Card.xlsx template
      const response = await fetch('/MihirClasses Card.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1); // Use the first sheet

      // Fill in student name at C7
      worksheet.getCell('C7').value = student.name;
      // Fill in board at E7
      worksheet.getCell('E7').value = student.board;
      // Fill in class at F6 as 'Std {class}'
      worksheet.getCell('F6').value = `Std ${student.class}`;
      // Fill in yearly fees at F8
      let termDuration = 12;
      if (student.term_type === '2 months') termDuration = 2;
      else if (student.term_type === '3 months') termDuration = 3;
      else if (student.term_type === '4 months') termDuration = 4;
      const yearlyFee = (12 / termDuration) * student.fee_amount;
      worksheet.getCell('F8').value = yearlyFee;
      // Fill in term 1 fees at D10
      worksheet.getCell('D10').value = student.fee_amount;
      // Fill in term 2 fees at D13
      worksheet.getCell('D13').value = student.fee_amount;
      // Fill in term 3 fees at D16
      worksheet.getCell('D16').value = student.fee_amount;
      // Fill in term 4 fees at D19
      worksheet.getCell('D19').value = student.fee_amount;

      // Fetch term 1 fee record
      const { data: term1FeeRecords } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_number', 1);
      const term1FeeRecord = term1FeeRecords?.[0];
      if (term1FeeRecord) {
        // Fetch payments for term 1
        const { data: payments } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('fee_record_id', term1FeeRecord.id)
          .order('payment_date', { ascending: true });
        // Fill E10/F10, E11/F11, E12/F12
        payments?.slice(0, 3).forEach((payment, idx) => {
          worksheet.getCell(`E${10 + idx}`).value = payment.payment_date;
          worksheet.getCell(`F${10 + idx}`).value = payment.amount_paid;
        });
      }
      // Fetch term 2 fee record
      const { data: term2FeeRecords } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_number', 2);
      const term2FeeRecord = term2FeeRecords?.[0];
      if (term2FeeRecord) {
        // Fetch payments for term 2
        const { data: payments } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('fee_record_id', term2FeeRecord.id)
          .order('payment_date', { ascending: true });
        // Fill E13/F13, E14/F14, E15/F15
        payments?.slice(0, 3).forEach((payment, idx) => {
          worksheet.getCell(`E${13 + idx}`).value = payment.payment_date;
          worksheet.getCell(`F${13 + idx}`).value = payment.amount_paid;
        });
      }
      // Fetch term 3 fee record
      const { data: term3FeeRecords } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_number', 3);
      const term3FeeRecord = term3FeeRecords?.[0];
      if (term3FeeRecord) {
        // Fetch payments for term 3
        const { data: payments } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('fee_record_id', term3FeeRecord.id)
          .order('payment_date', { ascending: true });
        // Fill E16/F16, E17/F17, E18/F18
        payments?.slice(0, 3).forEach((payment, idx) => {
          worksheet.getCell(`E${16 + idx}`).value = payment.payment_date;
          worksheet.getCell(`F${16 + idx}`).value = payment.amount_paid;
        });
      }
      // Fetch term 4 fee record
      const { data: term4FeeRecords } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_number', 4);
      const term4FeeRecord = term4FeeRecords?.[0];
      if (term4FeeRecord) {
        // Fetch payments for term 4
        const { data: payments } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('fee_record_id', term4FeeRecord.id)
          .order('payment_date', { ascending: true });
        // Fill E19/F19, E20/F20, E21/F21
        payments?.slice(0, 3).forEach((payment, idx) => {
          worksheet.getCell(`E${19 + idx}`).value = payment.payment_date;
          worksheet.getCell(`F${19 + idx}`).value = payment.amount_paid;
        });
      }

      // Download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `FeeCard_${student.name}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Fee report exported successfully!",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export fee report",
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
