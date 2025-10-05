const TMDB_KEY = TMDB_KEY; 

const TTL = 1000 * 60 * 5; // 5 min
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

// Función para fetch a TMDb con cache
async function fetchFromTmdb(url, cacheKey) {
  const cached = getCached(cacheKey);
  if (cached) return { fromCache: true, data: cached };

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return { fromCache: false, data };
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const imdbId = url.searchParams.get("imdbId");
      const tvId = url.searchParams.get("tvId");
      const season = url.searchParams.get("season");
      const episode = url.searchParams.get("episode");

      let cacheKey, tmdbUrl;

      if (imdbId) {
        if (!/^tt\d{7,8}$/.test(imdbId)) {
          return new Response(JSON.stringify({ error: "imdbId inválido" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        cacheKey = `imdb-${imdbId}`;
        tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id&language=es-ES`;
      }
      else if (tvId && season && episode) {
        if (!/^\d+$/.test(tvId) || !/^\d+$/.test(season) || !/^\d+$/.test(episode)) {
          return new Response(JSON.stringify({ error: "Parámetros inválidos" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        cacheKey = `tv-${tvId}-s${season}e${episode}`;
        tmdbUrl = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}&language=es-ES`;
      } else {
        return new Response(JSON.stringify({ error: "Parámetros faltantes" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await fetchFromTmdb(tmdbUrl, cacheKey);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
