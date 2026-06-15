import { Redis } from '@upstash/redis';

let redis = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    console.warn('[Memory] Upstash Redis connected');
  } else {
    console.warn('[Memory] Upstash Redis not configured (UPSTASH_REDIS_REST_URL/TOKEN missing)');
  }
  return redis;
}

const SESSION_TTL = 60 * 60;
const MAX_MESSAGES = 20;

export async function loadHistory(sessionId) {
  const r = getRedis();
  if (!r || !sessionId) {
    if (sessionId) console.warn(`[Memory] loadHistory skipped — no Redis for session ${sessionId}`);
    return [];
  }
  try {
    const data = await r.get(`chat:${sessionId}`);
    const result = Array.isArray(data) ? data : [];
    console.warn(`[Memory] loadHistory(${sessionId}) → ${result.length} messages`);
    return result;
  } catch (e) {
    console.warn(`[Memory] loadHistory error: ${e.message}`);
    return [];
  }
}

export async function saveHistory(sessionId, messages) {
  const r = getRedis();
  if (!r || !sessionId || !messages?.length) {
    if (sessionId) console.warn(`[Memory] saveHistory skipped — no Redis or empty messages for ${sessionId}`);
    return;
  }
  const trimmed = messages.slice(-MAX_MESSAGES).map(m => ({
    role: m.role || m.sender,
    content: m.content || m.text || '',
  }));
  await r.set(`chat:${sessionId}`, trimmed, { ex: SESSION_TTL });
  console.warn(`[Memory] saveHistory(${sessionId}) → ${trimmed.length} messages saved`);
}

export async function recall(userId) {
  const r = getRedis();
  if (!r || !userId) return [];
  try {
    const data = await r.get(`memories:${userId}`);
    const result = Array.isArray(data) ? data : [];
    console.warn(`[Memory] recall(${userId}) → ${result.length} memories`);
    return result;
  } catch { return []; }
}

export async function saveMemory(userId, text) {
  const r = getRedis();
  if (!r || !userId || !text) return;
  const existing = await recall(userId);
  if (!existing.includes(text)) {
    existing.push(text);
    await r.set(`memories:${userId}`, existing.slice(-50));
    console.warn(`[Memory] saveMemory(${userId}) → new fact stored`);
  }
}

export function buildMemoryContext(history, memories) {
  let ctx = '';
  if (history?.length > 0) {
    ctx += '\n\nConversation history from this session:\n';
    ctx += history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');
  }
  if (memories?.length > 0) {
    ctx += '\n\nRelevant memories about this student (from past sessions):\n';
    ctx += memories.map(f => `- ${f}`).join('\n');
    ctx += '\n\nUse these memories to personalize your teaching. Do NOT mention these memories explicitly unless directly relevant.';
  }
  return ctx;
}
