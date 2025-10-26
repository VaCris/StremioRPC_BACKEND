import { getCached, setCached } from './cache.js';

/**
 * Función genérica para hacer fetch a la API de TMDb con caché.
 * @param {string} url - URL completa de la API.
 * @param {string} cacheKey - Clave única para la caché.
 * @returns {Promise<object>}
 */
async function fetchWithCache(url, cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) {
        return { fromCache: true, data: cached };
    }

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Error en TMDb: ${res.status}`);
    }

    const data = await res.json();
    setCached(cacheKey, data);
    return { fromCache: false, data };
}

/**
 * Obtiene información basada en un IMDB ID.
 * @param {string} imdbId
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
export function getImdbInfo(imdbId, apiKey) {
    const cacheKey = `imdb-${imdbId}`;
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id&language=es-ES`;
    return fetchWithCache(url, cacheKey);
}

/**
 * Obtiene información de un episodio de TV.
 * @param {string} tvId
 * @param {string} season
 * @param {string} episode
 * @param {string} apiKey 
 * @returns {Promise<object>}
 */
export function getEpisodeInfo(tvId, season, episode, apiKey) {
    const cacheKey = `tv-${tvId}-s${season}e${episode}`;
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${apiKey}&language=es-ES`;
    return fetchWithCache(url, cacheKey);
}