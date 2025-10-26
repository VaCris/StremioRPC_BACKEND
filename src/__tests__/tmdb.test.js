import { jest, describe, test, expect, beforeEach } from '@jest/globals';
global.fetch = jest.fn();

describe('TMDb Module', () => {
    let tmdbModule;
    let cacheMock;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.unstable_mockModule('../cache.js', () => ({
            getCached: jest.fn(() => null),
            setCached: jest.fn(),
        }));

        cacheMock = await import('../cache.js');
        tmdbModule = await import('../tmdb.js');
        global.fetch.mockClear();
    });

    test('getImdbInfo debe llamar a fetch con la URL correcta y la API key', async () => {
        const imdbId = 'tt1234567';
        const apiKey = 'test-api-key';
        const mockResponseData = { movie_results: [{ id: 1 }] };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData,
        });

        await tmdbModule.getImdbInfo(imdbId, apiKey);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id&language=es-ES`
        );
        expect(cacheMock.setCached).toHaveBeenCalledTimes(1);
        expect(cacheMock.setCached).toHaveBeenCalledWith(`imdb-${imdbId}`, mockResponseData);
    });

    test('getEpisodeInfo debe llamar a fetch con la URL correcta', async () => {
        const tvId = '123';
        const season = '1';
        const episode = '5';
        const apiKey = 'test-api-key';
        const mockResponseData = { id: 10, name: 'Episode 5' };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData,
        });

        await tmdbModule.getEpisodeInfo(tvId, season, episode, apiKey);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(cacheMock.setCached).toHaveBeenCalledWith(`tv-${tvId}-s${season}e${episode}`, mockResponseData);
    });

    test('debe retornar datos de la caché si existen', async () => {
        const imdbId = 'tt7654321';
        const apiKey = 'test-key';
        const cachedData = { movie_results: [{ id: 2 }] };
        cacheMock.getCached.mockReturnValueOnce(cachedData);

        const result = await tmdbModule.getImdbInfo(imdbId, apiKey);

        expect(cacheMock.getCached).toHaveBeenCalledTimes(1);
        expect(cacheMock.getCached).toHaveBeenCalledWith(`imdb-${imdbId}`);
        expect(fetch).not.toHaveBeenCalled();
        expect(cacheMock.setCached).not.toHaveBeenCalled();
        expect(result).toEqual({ fromCache: true, data: cachedData });
    });

    test('debe lanzar un error si fetch falla', async () => {
        const imdbId = 'tt1111111';
        const apiKey = 'key';

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(tmdbModule.getImdbInfo(imdbId, apiKey)).rejects.toThrow('Error en TMDb: 500');
        expect(cacheMock.setCached).not.toHaveBeenCalled();
    });

});