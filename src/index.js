import { getImdbInfo, getEpisodeInfo } from './tmdb.js';
import { success, error, validateImdbId, validateTvParams } from './utils.js';

export default {
    async fetch(request, env) {
        const TMDB_KEY = env?.TMDB_KEY || globalThis?.TMDB_KEY;

        if (!TMDB_KEY) {
            return error("La variable TMDB_KEY no está configurada", 500);
        }

        try {
            const url = new URL(request.url);
            const imdbId = url.searchParams.get("imdbId");
            const tvId = url.searchParams.get("tvId");
            const season = url.searchParams.get("season");
            const episode = url.searchParams.get("episode");
            if (imdbId) {
                if (!validateImdbId(imdbId)) {
                    return error("imdbId inválido", 400);
                }
                const data = await getImdbInfo(imdbId, TMDB_KEY);
                return success(data);
            }
            if (tvId && season && episode) {
                if (!validateTvParams(tvId, season, episode)) {
                    return error("Parámetros de TV inválidos", 400);
                }
                const data = await getEpisodeInfo(tvId, season, episode, TMDB_KEY);
                return success(data);
            }
            return error("Parámetros faltantes o incorrectos", 400);

        } catch (err) {
            return error(err.message, 500);
        }
    },
};