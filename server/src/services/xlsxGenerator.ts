/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/xlsxGenerator.ts

import exceljs from 'exceljs';

// ===== 类型定义（自 .d.ts 还原）=====
import type { ColumnDef } from './csvSerializer';

export class XlsxGenerator {
    /**
     * Generate a single-sheet XLSX file.
     */
    async generate(sheetName: string, columns: ColumnDef[], rows: Record<string, any>[]): Promise<Buffer> {
        const workbook = new exceljs.Workbook();
        this.addSheet(workbook, sheetName, columns, rows);
        const arrayBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(arrayBuffer);
    }
    /**
     * Generate a multi-sheet XLSX file (e.g. admin batch export).
     */
    async generateMultiSheet(sheets: {
        name: string;
        columns: ColumnDef[];
        rows: Record<string, any>[];
    }[]): Promise<Buffer> {
        const workbook = new exceljs.Workbook();
        for (const sheet of sheets) {
            this.addSheet(workbook, sheet.name, sheet.columns, sheet.rows);
        }
        const arrayBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(arrayBuffer);
    }
    /**
     * Add a worksheet to the workbook with proper column definitions and typed data.
     */
    addSheet(workbook, sheetName, columns, rows) {
        const worksheet = workbook.addWorksheet(sheetName);
        // Set columns with headers and reasonable widths
        worksheet.columns = columns.map((col) => ({
            header: col.header,
            key: col.key,
            width: Math.max(col.header.length * 2, 12),
        }));
        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        // Add data rows with type preservation
        for (const row of rows) {
            const rowData = {};
            for (const col of columns) {
                rowData[col.key] = this.formatCellValue(row[col.key]);
            }
            worksheet.addRow(rowData);
        }
        // Apply date format to cells that contain Date objects
        worksheet.eachRow((excelRow, rowNumber) => {
            if (rowNumber === 1)
                return; // skip header
            excelRow.eachCell((cell) => {
                if (cell.value instanceof Date) {
                    cell.numFmt = 'YYYY-MM-DD';
                }
            });
        });
    }
    /**
     * Convert a raw value to the appropriate Excel type.
     * - Date strings (ISO 8601) → Date objects (Excel date format)
     * - Numbers → preserved as numbers
     * - null/undefined → empty string
     */
    formatCellValue(value) {
        if (value == null) {
            return '';
        }
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            // Detect ISO date strings like "2024-01-15" or "2024-01-15T10:30:00.000Z"
            if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(value)) {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        return value;
    }
}