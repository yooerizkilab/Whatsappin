import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalizes a phone number to E.164 format (without the +)
 * Example: +62 812-3456-789 -> 628123456789
 * If invalid, returns the original input stripped of non-digits
 */
export const normalizePhone = (phone: string, defaultCountry = 'ID'): string => {
    const cleaned = phone.replace(/\D/g, '');

    // Try to parse with libphonenumber
    const phoneNumber = parsePhoneNumberFromString(phone.startsWith('+') ? phone : `+${phone}`);
    if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.format('E.164').replace('+', '');
    }

    // Fallback if country code is missing but it's long enough
    const phoneNumberFallback = parsePhoneNumberFromString(phone, defaultCountry as any);
    if (phoneNumberFallback && phoneNumberFallback.isValid()) {
        return phoneNumberFallback.format('E.164').replace('+', '');
    }

    return cleaned;
};

/**
 * Checks if a phone number is valid internationally
 */
export const isValidPhone = (phone: string, defaultCountry = 'ID'): boolean => {
    const phoneNumber = parsePhoneNumberFromString(phone.startsWith('+') ? phone : `+${phone}`);
    if (phoneNumber && phoneNumber.isValid()) return true;

    const phoneNumberFallback = parsePhoneNumberFromString(phone, defaultCountry as any);
    if (phoneNumberFallback && phoneNumberFallback.isValid()) return true;

    // Relaxed fallback: accept if digit length looks reasonable (10-16)
    // Covers Indonesian numbers (62 + 8-14 subscriber digits) and various intl formats
    // seperti nomor WA Indonesia yang bisa 10-15 digit (628xx...)
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 16;
};
