/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/csvSerializer.ts

// ===== 类型定义（自 .d.ts 还原）=====
export interface ColumnDef {
    key: string;
    header: string;
}

export class CsvSerializer {
    /**
     * Escape a field value per RFC 4180.
     * If the value contains a comma, newline (\r or \n), or double quote,
     * wrap it in double quotes and escape internal double quotes by doubling them.
     */
    escapeField(value: string): string {
        if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    }
    /**
     * Serialize a single data row into a CSV line string (no trailing newline).
     * Missing or null/undefined values become empty strings.
     */
    serializeRow(columns: ColumnDef[], row: Record<string, any>): string {
        return columns
            .map((col) => {
            const raw = row[col.key];
            const str = raw == null ? '' : String(raw);
            return this.escapeField(str);
        })
            .join(',');
    }
    /**
     * Serialize columns + rows into a UTF-8 Buffer with BOM prefix.
     * First row is the header row built from ColumnDef.header values.
     */
    serialize(columns: ColumnDef[], rows: Record<string, any>[]): Buffer {
        const headerLine = columns.map((col) => this.escapeField(col.header)).join(',');
        const dataLines = rows.map((row) => this.serializeRow(columns, row));
        const csv = [headerLine, ...dataLines].join('\r\n');
        const bom = Buffer.from([0xef, 0xbb, 0xbf]);
        const content = Buffer.from(csv, 'utf-8');
        return Buffer.concat([bom, content]);
    }
}