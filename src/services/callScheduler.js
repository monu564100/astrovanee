import { pool } from '../db/pool.js';
import { logger } from '../logger.js';

const activeTimeouts = new Map();

export async function scheduleCallEnd(consultationId, startedAt) {
  const FIVE_MIN = 5 * 60 * 1000;
  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(FIVE_MIN - elapsed, 0);
  clearExisting(consultationId);
  const to = setTimeout(() => endCall(consultationId), remaining);
  activeTimeouts.set(consultationId, to);
  logger.info({ msg: 'call scheduled end', consultationId, remaining });
}

function clearExisting(id) {
  const t = activeTimeouts.get(id);
  if (t) clearTimeout(t);
  activeTimeouts.delete(id);
}

async function endCall(consultationId) {
  try {
    await pool.execute("UPDATE consultation SET consultationstatus='ended', endedon=? WHERE id=?", [new Date().toISOString(), consultationId]);
    logger.info({ msg: 'call auto-ended', consultationId });
  } catch (e) {
    logger.error(e);
  } finally {
    clearExisting(consultationId);
  }
}

export async function initCallExpiryWatcher() {
  // Load calls started within last 5 minutes that are not ended
  try {
    const FIVE_MIN_AGO = Date.now() - 5 * 60 * 1000;
    const [rows] = await pool.query("SELECT id, vendoracceptedon FROM consultation WHERE consultationstatus='ongoing'");
    for (const r of rows) {
      const startedAt = Date.parse(r.vendoracceptedon || new Date().toISOString());
      if (!isNaN(startedAt) && startedAt > FIVE_MIN_AGO) {
        scheduleCallEnd(r.id, startedAt);
      }
    }
  } catch (e) {
    logger.error(e);
  }
}
