
import { useMemo } from 'react';

interface Student {
  fee_amount: number;
  term_type: string;
}

interface FeeRecord {
  total_paid: number;
  amount: number;
}

export function useFeeCalculations(student: Student, feeRecord?: FeeRecord) {
  const yearlyFee = useMemo(() => {
    const termDuration = student.term_type === "2 months" ? 2 : 
                        student.term_type === "3 months" ? 3 : 4;
    return (12 / termDuration) * student.fee_amount;
  }, [student.fee_amount, student.term_type]);

  const totalPaid = feeRecord?.total_paid || 0;
  const remainingAmount = Math.max(0, yearlyFee - totalPaid);

  return {
    yearlyFee,
    totalPaid,
    remainingAmount
  };
}
