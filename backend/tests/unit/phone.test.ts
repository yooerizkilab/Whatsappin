import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidPhone } from '../../src/utils/phone';

describe('Phone Utility', () => {
    describe('normalizePhone', () => {
        it('should normalize Indonesian number with + prefix', () => {
            expect(normalizePhone('+628123456789')).toBe('628123456789');
        });

        it('should normalize Indonesian number with 0 prefix', () => {
            expect(normalizePhone('08123456789')).toBe('628123456789');
        });

        it('should normalize number with spaces and dashes', () => {
            expect(normalizePhone('0812-3456-789 ')).toBe('628123456789');
        });

        it('should return only digits for invalid but long enough numbers', () => {
            expect(normalizePhone('1234567890123')).toBe('1234567890123');
        });
    });

    describe('isValidPhone', () => {
        it('should return true for valid Indonesian number', () => {
            expect(isValidPhone('08123456789')).toBe(true);
            expect(isValidPhone('+628123456789')).toBe(true);
        });

        it('should return false for too short numbers', () => {
            expect(isValidPhone('12345')).toBe(false);
        });

        it('should return false for invalid characters', () => {
            // isValidPhone strips non-digits for the fallback check,
            // but let's see how it handles letters if they are in the middle
            expect(isValidPhone('0812abc3456')).toBe(false);
        });
    });
});
