import ExcelJS from 'exceljs';

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'GENERATE_MST_EXCEL') {
    const { data, branchName, examName, examTitle, session, coordinatorName, tableHeaders } = payload;
    
    try {
       const now = new Date();
       const headerAOA = [
          ['ACROPOLIS INSTITUTE OF TECHNOLOGY AND RESEARCH'],
          ['DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING'],
          [`BRANCH SUMMARY: ${examTitle} | SESSION: ${session}`],
          [`BRANCH: ${branchName.toUpperCase()} | COORDINATOR: ${coordinatorName.toUpperCase()}`],
          [`GENERATED ON: ${now.toLocaleDateString()}`],
          []
       ];

       const tableData = data.map((row: any) => Object.values(row));
       const finalAOA = [...headerAOA, tableHeaders, ...tableData];

       const workbook = new ExcelJS.Workbook();
       const sheet = workbook.addWorksheet('MST Marks Summary');

       sheet.addRows(finalAOA);

       // Basic column widths
       sheet.columns.forEach((col, i) => {
          let maxLen = tableHeaders[i]?.length || 10;
          tableData.forEach((row: any) => {
             const len = String(row[i] || '').length;
             if (len > maxLen) maxLen = len;
          });
          col.width = maxLen + 4;
       });

       // Merges for header
       sheet.mergeCells(1, 1, 1, tableHeaders.length);
       sheet.mergeCells(2, 1, 2, tableHeaders.length);
       sheet.mergeCells(3, 1, 3, tableHeaders.length);
       sheet.mergeCells(4, 1, 4, tableHeaders.length);
       sheet.mergeCells(5, 1, 5, tableHeaders.length);

       const buffer = await workbook.xlsx.writeBuffer();
       (self as any).postMessage({ type: 'SUCCESS', payload: buffer }, [buffer]);
    } catch (error: any) {
       self.postMessage({ type: 'ERROR', payload: error.message });
    }
  }
};
