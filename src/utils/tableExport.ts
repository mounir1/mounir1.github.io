// Table Export Utilities
// Provides functions to export table data in various formats

export interface ExportColumn {
  id: string;
  header: string;
  accessor?: (row: any) => any;
  accessorKey?: string;
}

export interface ExportOptions {
  format?: 'csv' | 'json' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
  visibleColumnsOnly?: boolean;
}

// Convert data to CSV format
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions = {}
): void {
  const {
    filename = `export-${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders = true,
  } = options;

  // Prepare CSV content
  const csvContent: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    const headers = columns.map(col => `"${col.header}"`);
    csvContent.push(headers.join(','));
  }

  // Add data rows
  data.forEach(row => {
    const rowData = columns.map(col => {
      let value: any;

      if (col.accessor) {
        value = col.accessor(row);
      } else if (col.accessorKey) {
        value = row[col.accessorKey];
      } else {
        value = '';
      }

      // Handle different value types
      if (value === null || value === undefined) {
        return '""';
      } else if (Array.isArray(value)) {
        return `"${value.join(', ')}"`;
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return `"${String(value).replace(/"/g, '""')}"`;
      }
    });

    csvContent.push(rowData.join(','));
  });

  // Create and download file
  const csvString = csvContent.join('\n');
  downloadFile(csvString, filename, 'text/csv');
}

// Convert data to JSON format
export function exportToJSON(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions = {}
): void {
  const { filename = `export-${new Date().toISOString().split('T')[0]}.json` } =
    options;

  // Transform data using column definitions
  const transformedData = data.map(row => {
    const transformedRow: any = {};

    columns.forEach(col => {
      let value: any;

      if (col.accessor) {
        value = col.accessor(row);
      } else if (col.accessorKey) {
        value = row[col.accessorKey];
      } else {
        value = null;
      }

      transformedRow[col.id] = value;
    });

    return transformedRow;
  });

  // Create JSON string with proper formatting
  const jsonString = JSON.stringify(transformedData, null, 2);
  downloadFile(jsonString, filename, 'application/json');
}

// Export to Excel format (simplified XLSX)
export function exportToXLSX(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions = {}
): void {
  // For a complete XLSX implementation, you would use a library like 'xlsx'
  // For now, we'll export as CSV with .xlsx extension
  const { filename = `export-${new Date().toISOString().split('T')[0]}.xlsx` } =
    options;

  // Note: XLSX export not fully implemented. Exporting as CSV instead.
  exportToCSV(data, columns, {
    ...options,
    filename: filename.replace('.xlsx', '.csv'),
  });
}

// Generic export function
export function exportTable(
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  switch (options.format) {
    case 'csv':
      exportToCSV(data, columns, options);
      break;
    case 'json':
      exportToJSON(data, columns, options);
      break;
    case 'xlsx':
      exportToXLSX(data, columns, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Utility function to download a file
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

// Utility to filter data for export
export function filterDataForExport(
  data: any[],
  selectedRows: Set<string>,
  getRowId: (row: any, index: number) => string,
  selectedOnly: boolean = false
): any[] {
  if (!selectedOnly || selectedRows.size === 0) {
    return data;
  }

  return data.filter((row, index) => selectedRows.has(getRowId(row, index)));
}

// Utility to filter columns for export
export function filterColumnsForExport(
  columns: ExportColumn[],
  visibleColumns: Set<string>,
  visibleOnly: boolean = false
): ExportColumn[] {
  if (!visibleOnly) {
    return columns.filter(col => col.id !== 'actions'); // Exclude action columns by default
  }

  return columns.filter(
    col => visibleColumns.has(col.id) && col.id !== 'actions'
  );
}

// Utility to generate filename with timestamp
export function generateExportFilename(
  baseName: string = 'table-export',
  format: string = 'csv'
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}-${timestamp}.${format}`;
}

// Advanced CSV options
export interface CSVOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  lineBreak?: string;
  withBOM?: boolean; // Byte Order Mark for UTF-8
}

// Advanced CSV export with custom options
export function exportToCSVAdvanced(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  csvOptions: CSVOptions = {}
): void {
  const {
    delimiter = ',',
    quote = '"',
    escape = '"',
    lineBreak = '\n',
    withBOM = true,
  } = csvOptions;

  const csvContent: string[] = [];

  // Add BOM for proper UTF-8 encoding in Excel
  if (withBOM) {
    csvContent.push('\uFEFF');
  }

  // Add headers
  const headers = columns.map(
    col =>
      `${quote}${col.header.replace(new RegExp(quote, 'g'), escape + quote)}${quote}`
  );
  csvContent.push(headers.join(delimiter));

  // Add data rows
  data.forEach(row => {
    const rowData = columns.map(col => {
      let value: any;

      if (col.accessor) {
        value = col.accessor(row);
      } else if (col.accessorKey) {
        value = row[col.accessorKey];
      } else {
        value = '';
      }

      // Handle different value types
      if (value === null || value === undefined) {
        return `${quote}${quote}`;
      } else if (Array.isArray(value)) {
        const arrayString = value.join(', ');
        return `${quote}${arrayString.replace(new RegExp(quote, 'g'), escape + quote)}${quote}`;
      } else if (typeof value === 'object') {
        const objectString = JSON.stringify(value);
        return `${quote}${objectString.replace(new RegExp(quote, 'g'), escape + quote)}${quote}`;
      } else {
        const stringValue = String(value);
        return `${quote}${stringValue.replace(new RegExp(quote, 'g'), escape + quote)}${quote}`;
      }
    });

    csvContent.push(rowData.join(delimiter));
  });

  // Create and download file
  const csvString = csvContent.join(lineBreak);
  downloadFile(csvString, filename, 'text/csv');
}

export default {
  exportTable,
  exportToCSV,
  exportToJSON,
  exportToXLSX,
  exportToCSVAdvanced,
  filterDataForExport,
  filterColumnsForExport,
  generateExportFilename,
};
