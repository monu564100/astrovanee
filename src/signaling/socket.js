import { Server } from 'socket.io';
import { pool } from '../db/pool.js';
import { logger } from '../logger.js';
import { scheduleCallEnd } from '../services/callScheduler.js';

let io;

export function initSignaling(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET','POST'] }
  });

  io.on('connection', (socket) => {
    logger.info({ msg: 'socket connected', id: socket.id });

    socket.on('register_identity', ({ role, id }) => {
      socket.data.role = role;
      socket.data.identityId = id;
      const room = `${role}:${id}`;
      socket.join(room);
      logger.info({ 
        msg: '✅ ========== IDENTITY REGISTERED ==========', 
        role, 
        id, 
        room,
        socketId: socket.id 
      });
      logger.info({ msg: `✅ Socket ${socket.id} can now receive events in room: ${room}` });
    });

    // Vendor initiates call invite
    socket.on('call_invite', async ({ consultationId, vendorId, userId, channelName }) => {
      try {
        logger.info({ msg: '📞 ========== BACKEND: call_invite received ==========', consultationId, vendorId, userId, channelName });
        
        if (!consultationId || !vendorId || !userId) {
          logger.error({ msg: '❌ Missing required fields', consultationId, vendorId, userId });
          return;
        }
        
        // Check which sockets are in the user room
        const userRoom = `user:${userId}`;
        const socketsInRoom = await io.in(userRoom).fetchSockets();
        logger.info({ 
          msg: '🔍 Checking user room', 
          room: userRoom, 
          socketsCount: socketsInRoom.length,
          socketIds: socketsInRoom.map(s => s.id)
        });
        
        if (socketsInRoom.length === 0) {
          logger.warn({ msg: '⚠️ No sockets in user room - user may not be connected', room: userRoom });
        }
        
        // Persist or update consultation status to ringing
        await pool.execute("UPDATE consultation SET consultationstatus='ringing' WHERE id=?", [consultationId]);
        logger.info({ msg: '✅ Database updated to ringing', consultationId });
        
        // CRITICAL: Only emit to USER room, NOT to vendor room (vendor is the caller)
        const payload = { consultationId, vendorId, channelName };
        logger.info({ msg: '📤 Emitting incoming_call to USER room ONLY (not vendor)', room: userRoom, payload });
        io.to(userRoom).emit('incoming_call', payload);
        logger.info({ msg: '✅ incoming_call emitted to user only', room: userRoom });
        
        // Auto-cancel after 30s if not accepted
        setTimeout(async () => {
          const [rows] = await pool.query('SELECT consultationstatus FROM consultation WHERE id=?', [consultationId]);
            if (rows[0] && rows[0].consultationstatus === 'ringing') {
              logger.info({ msg: '⏰ Call timeout - no answer after 30s', consultationId });
              await pool.execute("UPDATE consultation SET consultationstatus='missed' WHERE id=?", [consultationId]);
              io.to(`vendor:${vendorId}`).emit('call_missed', { consultationId });
              io.to(`user:${userId}`).emit('call_missed', { consultationId });
            }
        }, 30000).unref();
        
        logger.info({ msg: '📞 ========== BACKEND: call_invite complete ==========\n' });
      } catch (e) {
        logger.error({ msg: '❌ call_invite error', error: e.message, stack: e.stack });
      }
    });

    socket.on('call_accept', async ({ consultationId, userId, vendorId }) => {
      try {
        const [rows] = await pool.query('SELECT consultationstatus FROM consultation WHERE id=?', [consultationId]);
        if (!rows.length) return;
        if (!['ringing','pending','ongoing'].includes(rows[0].consultationstatus)) return;
        // Mark ongoing if not already
        const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute("UPDATE consultation SET consultationstatus='ongoing', customeracceptedon=? WHERE id=?", [mysqlDateTime, consultationId]);
        logger.info({ msg: 'call accepted', consultationId });
        io.to(`vendor:${vendorId}`).emit('call_accepted', { consultationId });
        io.to(`user:${userId}`).emit('call_accepted', { consultationId });
        scheduleCallEnd(consultationId, Date.now());
      } catch (e) {
        logger.error(e);
      }
    });

    socket.on('call_decline', async ({ consultationId, userId, vendorId }) => {
      try {
        const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute("UPDATE consultation SET consultationstatus='declined', endedon=?, endedby=? WHERE id=?", [mysqlDateTime, 'user', consultationId]);
        logger.info({ msg: 'call declined', consultationId });
        io.to(`vendor:${vendorId}`).emit('call_declined', { consultationId });
        io.to(`user:${userId}`).emit('call_declined', { consultationId });
      } catch (e) {
        logger.error(e);
      }
    });

    socket.on('call_end', async ({ consultationId, endedBy, vendorId, userId }) => {
      try {
        logger.info({ 
          msg: '🔴 RECEIVED call_end event', 
          consultationId, 
          endedBy, 
          vendorId, 
          userId,
          vendorRoom: `vendor:${vendorId}`,
          userRoom: `user:${userId}`
        });
        
        const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute("UPDATE consultation SET consultationstatus='ended', endedon=?, endedby=? WHERE id=?", [mysqlDateTime, endedBy || 'unknown', consultationId]);
        logger.info({ msg: 'Database updated', consultationId });
        
        const payload = { consultationId, endedBy };
        logger.info({ msg: '📤 Emitting call_ended to vendor room', room: `vendor:${vendorId}`, payload });
        io.to(`vendor:${vendorId}`).emit('call_ended', payload);
        
        logger.info({ msg: '📤 Emitting call_ended to user room', room: `user:${userId}`, payload });
        io.to(`user:${userId}`).emit('call_ended', payload);
        
        logger.info({ msg: '✅ call_ended emitted to both rooms', consultationId });
      } catch (e) {
        logger.error({ msg: '❌ Error in call_end handler', error: e });
      }
    });

    socket.on('disconnect', () => {
      logger.info({ msg: 'socket disconnected', id: socket.id });
    });
  });

  logger.info('Signaling (socket.io) initialized');
}

export function getIO() { return io; }
