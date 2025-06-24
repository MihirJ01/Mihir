import React from "react";

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

interface FeeCardExcelPreviewProps {
  student: Student;
  payments: Payment[];
  logoUrl: string;
}

const FEE_TERMS = ["1st Term", "2nd Term", "3rd Term", "4th Term"];

export default function FeeCardExcelPreview({ student, payments, logoUrl }: FeeCardExcelPreviewProps) {
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  const yearlyFee = 4 * student.fee_amount;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const balance = yearlyFee - totalPaid;

  // Map payments to terms (assume one payment per term for preview)
  const termPayments = FEE_TERMS.map((_, i) => payments[i] || null);

  return (
    <div className="bg-white border-2 border-black rounded-xl p-0 max-w-xl mx-auto shadow-xl overflow-visible" style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: 15 }}>
      {/* Header */}
      <div className="flex items-center border-b-2 border-black pb-2 mb-0 px-4 pt-4 bg-white">
        <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain mr-4" />
        <div className="flex-1">
          <div className="text-2xl font-extrabold text-center tracking-wide break-words">MIHIR Classes</div>
          <div className="text-center text-sm break-words">Sai Prasad Garden<br />B1-203</div>
        </div>
        <div className="text-right text-sm min-w-[110px]">
          <div className="font-bold">{year} - {nextYear.toString().slice(-2)}</div>
          <div>9867912899</div>
          <div>9867919289</div>
        </div>
      </div>
      {/* Student Info */}
      <div className="flex w-full border-b-2 border-black bg-white">
        <div className="flex items-center border-r-2 border-black min-h-[2.5rem] px-3 py-1 w-[40%] min-w-[40%] max-w-[40%] break-words">
          <span className="font-semibold">Student Name :-</span>
          <span className="ml-2">{student.name}</span>
        </div>
        <div className="flex items-center border-r-2 border-black min-h-[2.5rem] px-3 py-1 w-[20%] min-w-[20%] max-w-[20%] break-words">
          <span className="font-semibold">Board</span>
          <span className="ml-2">{student.board}</span>
        </div>
        <div className="flex items-center border-r-2 border-black min-h-[2.5rem] px-3 py-1 w-[20%] min-w-[20%] max-w-[20%] break-words">
          <span className="font-semibold">STD.:-</span>
          <span className="ml-2">{student.class}</span>
        </div>
        <div className="flex items-center min-h-[2.5rem] px-3 py-1 w-[20%] min-w-[20%] max-w-[20%] bg-black text-white font-bold justify-center rounded-tr-md border-black border-l-2 border-b-2 break-words">
          <div>
            <div className="text-xs">Yearly Fees</div>
            <div className="text-lg">{yearlyFee}</div>
          </div>
        </div>
      </div>
      {/* Term Table */}
      <div className="border-b-2 border-black w-full bg-white">
        <div className="flex w-full font-semibold text-center border-b-2 border-black">
          <div className="border-r-2 border-black bg-gray-100 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 py-1 break-words">Term</div>
          <div className="border-r-2 border-black bg-gray-100 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 py-1 break-words">Payable Fees</div>
          <div className="border-r-2 border-black bg-green-200 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 py-1 break-words">Date</div>
          <div className="border-r-2 border-black bg-green-200 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 py-1 break-words">Paid</div>
          <div className="min-h-[2.5rem] flex-1 px-2 py-1"></div>
        </div>
        {FEE_TERMS.map((term, i) => (
          <div className="flex w-full text-center border-b-2 border-black last:border-b-0 bg-white">
            <div className="border-r-2 border-black py-1 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 break-words">{term}</div>
            <div className="border-r-2 border-black py-1 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 break-words">{student.fee_amount}</div>
            <div className="border-r-2 border-black py-1 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 break-words">{termPayments[i]?.payment_date ? new Date(termPayments[i].payment_date).toLocaleDateString() : ""}</div>
            <div className="border-r-2 border-black py-1 min-h-[2.5rem] flex-1 flex items-center justify-center px-2 break-words">{termPayments[i]?.amount_paid ? termPayments[i].amount_paid : ""}</div>
            <div className="py-1 min-h-[2.5rem] flex-1 px-2 break-words"></div>
          </div>
        ))}
      </div>
      {/* Balance and Total */}
      <div className="flex w-full border-b-2 border-black bg-white">
        <div className="border-r-2 border-black font-bold text-xs py-1 flex items-center min-h-[2.5rem] px-2 w-[60%] min-w-[60%] max-w-[60%] break-words">
          Note :- Fees should be <span className="underline">payable on a term-wise</span>
        </div>
        <div className="border-r-2 border-black text-center font-bold py-1 min-h-[2.5rem] flex items-center justify-center w-[20%] min-w-[20%] max-w-[20%] break-words">Total Fees</div>
        <div className="text-center font-bold py-1 bg-red-600 text-white min-h-[2.5rem] flex items-center justify-center w-[20%] min-w-[20%] max-w-[20%] break-words">{yearlyFee}</div>
      </div>
      {/* Fee Payment Terms */}
      <div className="text-xs mt-2 px-4">
        <div className="font-bold">Fee Payment Terms</div>
        <ol className="list-decimal ml-5">
          <li>Payment Methods: Fees can be paid in <span className="font-bold">cash or online</span>.</li>
          <li>Payment Deadline: <span className="font-bold">the first week of the first month of each term</span>.</li>
          <li>No deductions will be made for vacations or Hindu festivals.</li>
          <li className="font-bold">Non-Refundable:</li>
        </ol>
        <div className="ml-5">Fees once paid are non-refundable.</div>
      </div>
      <div className="font-bold text-xs mt-2 px-4">Parental Responsibility</div>
      <div className="text-xs px-4">Parents/Guardians are responsible for paying fees on time.</div>
      <div className="text-xs font-bold mt-1 px-4">* Please pay ₹1000 in advance at the time of admission.</div>
    </div>
  );
} 