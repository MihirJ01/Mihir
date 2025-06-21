
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate the Excel file and download it
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};
