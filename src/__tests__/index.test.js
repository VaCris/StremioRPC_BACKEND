import { jest, describe, test, expect, beforeEach } from '@jest/globals';
describe('Worker Fetch Handler (Integration)', () => {
    let worker;
    let tmdbMock;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.unstable_mockModule('../tmdb.js', () => ({
            getImdbInfo: jest.fn(),
            getEpisodeInfo: jest.fn(),
        }));

        tmdbMock = await import('../tmdb.js');
        worker = (await import('../index.js')).default;
    });

    const mockEnv = { TMDB_KEY: 'fake-api-key' };

    test('debe manejar una solicitud de IMDB válida', async () => {
        const imdbId = 'tt1234567';
        const mockTmdbResponse = { fromCache: false, data: { movie_results: [{ id: 1 }] } };

        tmdbMock.getImdbInfo.mockResolvedValueOnce(mockTmdbResponse);

        const request = new Request(`https://example.com/?imdbId=${imdbId}`);
        const response = await worker.fetch(request, mockEnv);

        expect(tmdbMock.getImdbInfo).toHaveBeenCalledTimes(1);
        expect(tmdbMock.getImdbInfo).toHaveBeenCalledWith(imdbId, mockEnv.TMDB_KEY);
        expect(tmdbMock.getEpisodeInfo).not.toHaveBeenCalled();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(mockTmdbResponse);
    });

    test('debe manejar una solicitud de TV válida', async () => {
        const tvId = '123', season = '1', episode = '1';
        const mockTmdbResponse = { fromCache: false, data: { name: 'Pilot' } };

        tmdbMock.getEpisodeInfo.mockResolvedValueOnce(mockTmdbResponse);

        const request = new Request(`https://example.com/?tvId=${tvId}&season=${season}&episode=${episode}`);
        const response = await worker.fetch(request, mockEnv);

        expect(tmdbMock.getEpisodeInfo).toHaveBeenCalledTimes(1);
        expect(tmdbMock.getEpisodeInfo).toHaveBeenCalledWith(tvId, season, episode, mockEnv.TMDB_KEY);
        expect(tmdbMock.getImdbInfo).not.toHaveBeenCalled();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(mockTmdbResponse);
    });

    test('debe retornar error 400 si falta imdbId o params de TV', async () => {
        const request = new Request('https://example.com/');
        const response = await worker.fetch(request, mockEnv);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Parámetros faltantes o incorrectos' });
        expect(tmdbMock.getImdbInfo).not.toHaveBeenCalled();
        expect(tmdbMock.getEpisodeInfo).not.toHaveBeenCalled();
    });

    test('debe retornar error 400 para imdbId inválido', async () => {
        const request = new Request('https://example.com/?imdbId=invalid');
        const response = await worker.fetch(request, mockEnv);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'imdbId inválido' });
        expect(tmdbMock.getImdbInfo).not.toHaveBeenCalled();
    });

    test('debe retornar error 400 para parámetros de TV inválidos', async () => {
        const request = new Request('https://example.com/?tvId=abc&season=1&episode=1');
        const response = await worker.fetch(request, mockEnv);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Parámetros de TV inválidos' });
        expect(tmdbMock.getEpisodeInfo).not.toHaveBeenCalled();
    });

    test('debe retornar error 500 si falta TMDB_KEY', async () => {
        const request = new Request('https://example.com/?imdbId=tt1234567');
        const response = await worker.fetch(request, {});

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: 'La variable TMDB_KEY no está configurada' });
    });

    test('debe retornar error 500 si tmdb lanza una excepción', async () => {
        const imdbId = 'tt1234567';
        const errorMessage = 'Error de red simulado';

        tmdbMock.getImdbInfo.mockRejectedValueOnce(new Error(errorMessage));

        const request = new Request(`https://example.com/?imdbId=${imdbId}`);
        const response = await worker.fetch(request, mockEnv);

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: errorMessage });
        expect(tmdbMock.getImdbInfo).toHaveBeenCalledTimes(1);
    });

});