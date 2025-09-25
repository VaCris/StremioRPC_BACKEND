import express from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const TMDB_KEY = process.env.TMDB_KEY;
if (!TMDB_KEY) {
  console.error("Falta TMDB_KEY");
  process.exit(1);
}

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});
app.use(limiter);

const cache = new Map();
const TTL = 1000 * 60 * 5; // 5 min

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

async function proxyToTmdb(cacheKey, url, res) {
  try {
    const cached = getCached(cacheKey);
    if (cached) return res.json({ fromCache: true, ...cached });

    const tmdbRes = await fetch(url);
    if (!tmdbRes.ok) {
      return res.status(tmdbRes.status).json({
        error: "Error al consultar",
        status: tmdbRes.status,
      });
    }

    const data = await tmdbRes.json();
    setCached(cacheKey, data);
    res.json({ fromCache: false, ...data });
  } catch (err) {
    console.error("proxyToTmdb:", err);
    res.status(500).json({ error: err.message });
  }
}

app.get("/3/find/:imdbId", async (req, res) => {
  const { imdbId } = req.params;
  if (!/^tt\d{7,8}$/.test(imdbId)) {
    return res.status(400).json({ error: "imdbId inválido" });
  }

  const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id&language=es-ES`;
  proxyToTmdb(imdbId, url, res);
});

app.get("/3/tv/:tvId/season/:season/episode/:episode", async (req, res) => {
  const { tvId, season, episode } = req.params;
  const cacheKey = `${tvId}-s${season}e${episode}`;
  const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}&language=es-ES`;
  proxyToTmdb(cacheKey, url, res);
});

app.get("/find/:imdbId", async (req, res) => {
  const { imdbId } = req.params;
  if (!/^tt\d{7,8}$/.test(imdbId)) {
    return res.status(400).json({ error: "imdbId inválido" });
  }

  const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id&language=es-ES`;
  proxyToTmdb(imdbId, url, res);
});

app.get("/tv/:tvId/season/:season/episode/:episode", async (req, res) => {
  const { tvId, season, episode } = req.params;
  const cacheKey = `${tvId}-s${season}e${episode}`;
  const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}&language=es-ES`;
  proxyToTmdb(cacheKey, url, res);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`puerto ${PORT}`));
