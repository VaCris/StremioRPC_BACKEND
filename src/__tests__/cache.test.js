import { jest, describe, test, expect, afterAll } from '@jest/globals';
import { getCached, setCached } from '../cache.js';

jest.useFakeTimers();

describe('Cache Module', () => {
    test('debe guardar un valor en la caché y recuperarlo correctamente', () => {
        const key = 'testKeySaveAndRetrieve';
        const data = { id: 1, value: 'test data 1' };
        setCached(key, data);
        const retrievedData = getCached(key);
        expect(retrievedData).toEqual(data);
        expect(retrievedData).not.toBeNull();
    });

    test('debe retornar null si la clave no existe en la caché', () => {
        const key = 'nonExistentKey';
        expect(getCached(key)).toBeNull();
    });

    test('debe retornar null si la entrada en la caché ha expirado', () => {
        const key = 'testKeyExpired';
        const data = { id: 2, value: 'this should expire' };
        const TTL = 5 * 60 * 1000;
        setCached(key, data);

        jest.advanceTimersByTime(TTL + 1);
        expect(getCached(key)).toBeNull();
    });

    test('NO debe retornar null si la entrada en la caché aún NO ha expirado', () => {
        const key = 'testKeyNotExpired';
        const data = { id: 3, value: 'this should still be valid' };
        const TTL = 5 * 60 * 1000;
        setCached(key, data);
        
        jest.advanceTimersByTime(TTL - 1);
        const retrievedData = getCached(key);
        expect(retrievedData).toEqual(data);
        expect(retrievedData).not.toBeNull();
    });

    test('debe actualizar correctamente el timestamp al sobreescribir una clave', () => {
        const key = 'testKeyOverwrite';
        const initialData = { value: 'initial' };
        const updatedData = { value: 'updated' };
        const TTL = 5 * 60 * 1000;
        setCached(key, initialData);

        jest.advanceTimersByTime(3 * 60 * 1000);
        expect(getCached(key)).toEqual(initialData);
        setCached(key, updatedData);

        jest.advanceTimersByTime(3 * 60 * 1000);
        expect(getCached(key)).toEqual(updatedData);
    });

});


afterAll(() => {
    jest.useRealTimers();
});