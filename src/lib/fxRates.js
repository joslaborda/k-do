/**
 * fxRates.js — Tasas de cambio fiables sin scraping.
 * Fuente primaria: Frankfurter (ECB) — https://api.frankfurter.app
 * Fallback: InvokeLLM con add_context_from_internet
 * Cache: localStorage (24h) + entidad ExchangeRateCache
 */

import { base44 } from '@/api/base44Client';

const LS_PREFIX = 'fx_v2_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function lsKey(from, to) {
  return `${LS_PREFIX}${from}_${to}`;
}

function lsGet(from, to) {
  try {
    const raw = localStorage.getItem(lsKey(from, to));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - new Date(obj.fetchedAt).getTime() > CACHE_TTL_MS) return null;
    return obj;
  } catch {
    return null;
  }
}

function lsSet(from, to, rate, source) {
  try {
    const obj = { rate, source, fetchedAt: new Date().toISOString() };
    localStorage.setItem(lsKey(from, to), JSON.stringify(obj));
  } catch {}
}

async function fromFrankfurter(from, to) {
  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.[to];
  if (!rate) throw new Error('No rate in response');
  return { rate, source: 'frankfurter/ECB' };
}

async function fromHistoricalFrankfurter(from, to, dateStr) {
  const url = `https://api.frankfurter.app/${dateStr}?from=${from}&to=${to}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Frankfurter historical ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.[to];
  if (!rate) throw new Error('No rate');
  return { rate, source: `frankfurter/ECB@${dateStr}` };
}

async function persistToEntity(from, to, rate, source) {
  try {
    const now = new Date().toISOString();
    const valid_until = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    const rows = await base44.entities.ExchangeRateCache.filter({ base: from, quote: to });
    if (rows.length > 0) {
      await base44.entities.ExchangeRateCache.update(rows[0].id, { rate, source, fetched_at: now, valid_until });
    } else {
      await base44.entities.ExchangeRateCache.create({ base: from, quote: to, rate, source, fetched_at: now, valid_until });
    }
  } catch {}
}

async function fromEntity(from, to) {
  try {
    const rows = await base44.entities.ExchangeRateCache.filter({ base: from, quote: to });
    if (rows.length > 0) {
      const row = rows[0];
      if (row.valid_until && new Date(row.valid_until) > new Date()) {
        return { rate: row.rate, source: row.source, fetchedAt: row.fetched_at };
      }
    }
  } catch {}
  return null;
}

/**
 * getFxRate(from, to, dateStr?)
 * Returns { rate: number, source: string, fetchedAt: string }
 * Uses: localStorage cache → Frankfurter API → LLM fallback
 * If dateStr provided (YYYY-MM-DD), tries historical rate first.
 */
export async function getFxRate(from, to, dateStr = null) {
  if (!from || !to) return { rate: 1, source: 'same', fetchedAt: new Date().toISOString() };
  if (from === to) return { rate: 1, source: 'same', fetchedAt: new Date().toISOString() };

  // 1. localStorage cache (current rates only)
  if (!dateStr) {
    const cached = lsGet(from, to);
    if (cached) return cached;
  }

  // 2. Try historical Frankfurter if dateStr provided
  if (dateStr) {
    try {
      const result = await fromHistoricalFrankfurter(from, to, dateStr);
      lsSet(from, to, result.rate, result.source);
      return { ...result, fetchedAt: new Date().toISOString() };
    } catch {}
  }

  // 3. Entity cache
  const entityCached = await fromEntity(from, to);
  if (entityCached) {
    lsSet(from, to, entityCached.rate, entityCached.source);
    return entityCached;
  }

  // 4. Frankfurter API (current)
  try {
    const result = await fromFrankfurter(from, to);
    const fetchedAt = new Date().toISOString();
    lsSet(from, to, result.rate, result.source);
    persistToEntity(from, to, result.rate, result.source);
    return { ...result, fetchedAt };
  } catch {}

  // 5. Last resort: 1:1 con aviso
  return { rate: 1, source: 'unavailable', fetchedAt: new Date().toISOString() };
}

/**
 * convertAmount(amount, from, to, dateStr?)
 * Returns { amountConverted, rate, source, fetchedAt }
 */
export async function convertAmount(amount, from, to, dateStr = null) {
  if (from === to) return { amountConverted: amount, rate: 1, source: 'same', fetchedAt: new Date().toISOString() };
  const fx = await getFxRate(from, to, dateStr);
  return {
    amountConverted: Math.round(amount * fx.rate * 100) / 100,
    rate: fx.rate,
    source: fx.source,
    fetchedAt: fx.fetchedAt,
  };
}