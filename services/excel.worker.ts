import * as XLSX from 'xlsx';

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

       const ws = XLSX.utils.aoa_to_sheet(finalAOA);
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "MST Marks Summary");

       // Apply cell styles if needed (Note: xlsx-js-style might be needed for actual colors in worker)
       // Basic column widths
       const colWidths = tableHeaders.map((_: any, colIndex: number) => {
          let maxLen = tableHeaders[colIndex].length;
          tableData.forEach((row: any) => {
             const len = String(row[colIndex] || '').length;
             if (len > maxLen) maxLen = len;
          });
          return { wch: maxLen + 4 };
       });
       ws['!cols'] = colWidths;

       // Merges for header
       ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: tableHeaders.length - 1 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: tableHeaders.length - 1 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: tableHeaders.length - 1 } },
          { s: { r: 4, c: 0 }, e: { r: 4, c: tableHeaders.length - 1 } },
       ];

       const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
       (self as any).postMessage({ type: 'SUCCESS', payload: wbout }, [wbout]);
    } catch (error: any) {
       self.postMessage({ type: 'ERROR', payload: error.message });
    }
  }
};
