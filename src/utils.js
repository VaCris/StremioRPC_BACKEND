function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function success(data) {
    return jsonResponse(data, 200);
}

export function error(message, status = 500) {
    return jsonResponse({ error: message }, status);
}

export function validateImdbId(id) {
    return /^tt\d{7,8}$/.test(id);
}

export function validateTvParams(tvId, season, episode) {
    return /^\d+$/.test(tvId) && /^\d+$/.test(season) && /^\d+$/.test(episode);
}