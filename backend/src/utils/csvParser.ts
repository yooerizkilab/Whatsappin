import { parse } from 'csv-parse/sync';

export interface CsvContact {
    name: string;
    phone: string;
    email?: string;
    group?: string;
    link?: string;
}

export function parseCsvContacts(csvBuffer: Buffer): CsvContact[] {
    const records = parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as Record<string, string>[];

    return records.map((row) => ({
        name: row['name'] || row['Name'] || '',
        phone: normalizePhone(row['phone'] || row['Phone'] || row['number'] || row['Number'] || ''),
        email: row['email'] || row['Email'] || undefined,
        group: row['group'] || row['Group'] || undefined,
        link: row['link'] || row['Link'] || undefined,
    })).filter((c) => c.name && c.phone);
}

export function normalizePhone(phone: string): string {
    // Remove non-digits
    let cleaned = phone.replace(/\D/g, '');
    // If starts with 0, replace with 62 (Indonesia default — adapt as needed)
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
}

export function resolveTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}
