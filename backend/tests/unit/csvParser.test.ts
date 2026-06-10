import { describe, it, expect } from 'vitest';
import { extractTemplateVars, resolveTemplate, resolveTemplateFromContact } from '../../src/utils/csvParser';

describe('CSV Parser & Template Engine', () => {
    describe('extractTemplateVars', () => {
        it('should extract variables from template', () => {
            const template = 'Hello {{name}}, your order {{orderId}} is ready!';
            const vars = extractTemplateVars(template);
            expect(vars).toContain('name');
            expect(vars).toContain('orderId');
            expect(vars.length).toBe(2);
        });

        it('should deduplicate variables', () => {
            const template = 'Hi {{name}}, welcome {{name}}!';
            const vars = extractTemplateVars(template);
            expect(vars.length).toBe(1);
        });
    });

    describe('resolveTemplate', () => {
        it('should replace variables with values', () => {
            const result = resolveTemplate('Hello {{name}}!', { name: 'John' });
            expect(result).toBe('Hello John!');
        });

        it('should replace missing variables with empty string', () => {
            const result = resolveTemplate('Hello {{name}}!', {});
            expect(result).toBe('Hello !');
        });
    });

    describe('resolveTemplateFromContact', () => {
        it('should resolve using contact data', () => {
            const result = resolveTemplateFromContact(
                'Hi {{name}}, your email is {{email}}',
                { name: 'Alice', phone: '628123456789', email: 'alice@example.com' }
            );
            expect(result).toBe('Hi Alice, your email is alice@example.com');
        });
    });
});
