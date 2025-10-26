import { describe, test, expect } from '@jest/globals';
import { validateImdbId, validateTvParams, success, error } from '../utils.js';

describe('Utils Module', () => {
    test('validateImdbId debe retornar true para IDs válidos', () => {
        expect(validateImdbId('tt1234567')).toBe(true);
        expect(validateImdbId('tt12345678')).toBe(true);
    });

    test('validateImdbId debe retornar false para IDs inválidos', () => {
        expect(validateImdbId('tx1234567')).toBe(false);
        expect(validateImdbId('tt123456')).toBe(false); // < 7 dígitos
        expect(validateImdbId('tt123456789')).toBe(false); // > 8 dígitos
        expect(validateImdbId('1234567')).toBe(false);
        expect(validateImdbId(null)).toBe(false);
        expect(validateImdbId(undefined)).toBe(false);
    });

    test('validateTvParams debe retornar true para parámetros válidos', () => {
        expect(validateTvParams('123', '1', '1')).toBe(true);
    });

    test('validateTvParams debe retornar false para parámetros inválidos', () => {
        expect(validateTvParams('abc', '1', '1')).toBe(false);
        expect(validateTvParams('123', 'a', '1')).toBe(false);
        expect(validateTvParams('123', '1', 'x')).toBe(false);
        expect(validateTvParams('123', null, '1')).toBe(false);
    });

    test('success debe crear una Response JSON exitosa', async () => {
        const data = { message: 'ok' };
        const response = success(data);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
        await expect(response.json()).resolves.toEqual(data);
    });

    test('error debe crear una Response JSON de error', async () => {
        const message = 'Algo salió mal';
        const response = error(message, 400);
        expect(response.status).toBe(400);
        expect(response.headers.get('content-type')).toContain('application/json');
        await expect(response.json()).resolves.toEqual({ error: message });
    });

});