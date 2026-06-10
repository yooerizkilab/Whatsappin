import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/utils/hash';

describe('Hash Utility', () => {
    it('should hash a password and verify it', async () => {
        const password = 'mysecretpassword';
        const hashed = await hashPassword(password);

        expect(hashed).toBeDefined();
        expect(hashed).not.toBe(password);

        const isMatch = await comparePassword(password, hashed);
        expect(isMatch).toBe(true);
    });

    it('should return false for wrong password', async () => {
        const password = 'mysecretpassword';
        const hashed = await hashPassword(password);

        const isMatch = await comparePassword('wrongpassword', hashed);
        expect(isMatch).toBe(false);
    });
});
