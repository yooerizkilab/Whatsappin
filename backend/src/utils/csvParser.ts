import { parse } from 'csv-parse/sync';

export interface CsvContact {
    name: string;
    phone: string;
    email?: string;
    group?: string;
    link?: string;
    metadata?: Record<string, string>; // Extra columns from CSV
}

const KNOWN_COLUMNS = ['name', 'phone', 'number', 'email', 'group'];

export function parseCsvContacts(csvBuffer: Buffer): CsvContact[] {
    const records = parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as Record<string, string>[];

    return records.map((row) => {
        const rowLower = Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
        );

        const contact: CsvContact = {
            name: rowLower['name'] || rowLower['Name'] || '',
            phone: normalizePhone(rowLower['phone'] || rowLower['number'] || rowLower['Number'] || ''),
            email: rowLower['email'] || undefined,
            group: rowLower['group'] || undefined,
        };

        // Collect extra columns into metadata (e.g. link, address, etc.)
        const metadata: Record<string, string> = {};
        for (const [key, value] of Object.entries(rowLower)) {
            if (!KNOWN_COLUMNS.includes(key) && value) {
                metadata[key] = value;
            }
        }
        if (Object.keys(metadata).length > 0) {
            contact.metadata = metadata;
        }

        return contact;
    }).filter((c) => c.name && c.phone);
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

/**
 * Extract all {{variable}} names from a template string
 */
export function extractTemplateVars(template: string): string[] {
    const vars: string[] = [];
    template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        vars.push(key);
        return '';
    });
    return [...new Set(vars)];
}

/**
 * Resolve template variables from contact data + metadata
 * Checks (in order): known fields, metadata, then empty string
 */
export function resolveTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

/**
 * Auto-resolve template variables from a contact record.
 * - Known fields: name, phone, email
 * - Metadata: any extra columns from CSV (link, address, etc.)
 */
export function resolveTemplateFromContact(
    template: string,
    contact: { name: string; phone: string; email?: string | null; metadata?: Record<string, string> | null }
): string {
    const vars: Record<string, string> = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email || '',
        // Also spread metadata so any {{var}} resolves if present
        ...(contact.metadata || {}),
    };
    return resolveTemplate(template, vars);
}
