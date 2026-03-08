// Simple cache helper using Upstash Redis REST API
// Bull uses the Redis protocol URL; this service uses the REST URL for lightweight caching.

const axios = require('axios');

const REST_URL   = process.env.UPSTASH_REDIS_REST_URL?.replace(/"/g, '');
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/"/g, '');
const TTL_SECS   = 60 * 60 * 24;   // 24 hours

function headers() {
  return { Authorization: `Bearer ${REST_TOKEN}` };
}

async function setCache(key, value) {
  if (!REST_URL || !REST_TOKEN) return;
  try {
    await axios.post(
      `${REST_URL}/set/${encodeURIComponent(key)}`,
      JSON.stringify(value),
      { headers: { ...headers(), 'Content-Type': 'application/json' }, params: { ex: TTL_SECS } }
    );
  } catch (err) {
    console.warn('Redis setCache failed (non-fatal):', err.message);
  }
}

async function getCache(key) {
  if (!REST_URL || !REST_TOKEN) return null;
  try {
    const { data } = await axios.get(
      `${REST_URL}/get/${encodeURIComponent(key)}`,
      { headers: headers() }
    );
    return data.result ? JSON.parse(data.result) : null;
  } catch (err) {
    console.warn('Redis getCache failed (non-fatal):', err.message);
    return null;
  }
}

async function delCache(key) {
  if (!REST_URL || !REST_TOKEN) return;
  try {
    await axios.get(`${REST_URL}/del/${encodeURIComponent(key)}`, { headers: headers() });
  } catch (err) {
    console.warn('Redis delCache failed (non-fatal):', err.message);
  }
}

module.exports = { setCache, getCache, delCache };
