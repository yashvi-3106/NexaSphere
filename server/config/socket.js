/**
 * Socket.IO Configuration
 * Handles WebSocket connections for real-time updates
 */

import { Server } from 'socket.io';
import logger from '../utils/logger.js';
import { getAdminSession } from '../repositories/adminSessionsRepository.js';
import { resolveAdminPermissions, getRoomsForPermissions } from './eventPermissions.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { liveQaService } from '../services/liveQaService.js';
import { getRedisClient } from '../utils/redis.js';
import { waitingRoomService } from '../services/waitingRoomService.js';

let io = null;
const connectedUsers = new Map();
const rooms = {
  admin: 'admin-room',
  notifications: 'notifications-room',
  events: 'events-room',
};
const PROTECTED_ROOMS = ['admin-room'];

const workspaceRoomMembers = new Map();

const joinRoomAttempts = new Map();
const MAX_JOIN_ROOM_ATTEMPTS = 20;
const JOIN_ROOM_WINDOW_MS = 60000;

function parseBearer(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

/**
 * Initialize Socket.IO
 * @param {Object} httpServer - HTTP server instance
 */
export function resolveSocketCorsOrigin(env = process.env) {
  if (env.FRONTEND_URL) return env.FRONTEND_URL;
  if (env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL must be set in production for Socket.IO CORS');
  }
  return 'http://localhost:5173';
}

export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: resolveSocketCorsOrigin(),
      credentials: true,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  const pubClient = getRedisClient();
  if (pubClient) {
    try {
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO using Redis adapter for horizontal scaling.');
    } catch (err) {
      logger.error('Failed to configure Socket.IO Redis adapter:', err);
      logger.info('Socket.IO falling back to in-memory adapter.');
    }
  } else {
    logger.info('Socket.IO using in-memory adapter (REDIS_URL not set).');
  }

  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token || parseBearer(socket.handshake.headers?.authorization);
    if (token) {
      try {
        const session = await getAdminSession(token);
        if (session) {
          socket.adminSession = session;
          socket.adminAuthenticated = true;
          socket.adminPermissions = resolveAdminPermissions(session);
        }
      } catch (err) {
        logger.warn('Socket auth middleware error:', err.message);
        return next(new Error('Authentication failed'));
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    _onConnection(socket);
  });

  liveQaService.setIO(io);

  return io;
}

export function _onConnection(socket) {
  logger.info('User connected', { socketId: socket.id, admin: !!socket.adminAuthenticated });

  if (socket.adminAuthenticated) {
    if (!socket.adminPermissions) {
      socket.adminPermissions = resolveAdminPermissions(socket.adminSession);
    }
    const adminRooms = getRoomsForPermissions(socket.adminPermissions);
    for (const room of adminRooms) {
      socket.join(room);
    }
    logger.info('Admin joined scoped rooms', {
      socketId: socket.id,
      username: socket.adminSession?.username,
      rooms: adminRooms,
    });
  }

  let identifyCount = 0;

  socket.on('user:identify', (userData) => {
    identifyCount++;
    if (identifyCount > 3) {
      logger.warn('Socket identification flood detected, forcing disconnect', {
        socketId: socket.id,
      });
      socket.disconnect(true);
      return;
    }

    if (!userData || typeof userData !== 'object') {
      logger.warn('Invalid user identification payload type rejected', { socketId: socket.id });
      return;
    }

    const { userId, email } = userData;

    if (typeof userId !== 'string' || typeof email !== 'string') {
      logger.warn('User identification payload fields must be primitive strings', {
        socketId: socket.id,
      });
      return;
    }

    if (userId.length > 128 || email.length > 256) {
      logger.warn('Oversized user identification payload values rejected', { socketId: socket.id });
      return;
    }

    connectedUsers.set(socket.id, {
      id: String(userId),
      email: String(email),
      socketId: String(socket.id),
      connectedAt: new Date(),
    });

    logger.info('User identified successfully', { userId: String(userId), socketId: socket.id });
  });

  const ALLOWED_PUBLIC_ROOMS = ['notifications-room', 'events-room', 'admin-room'];
  const MAX_ROOMS_PER_SOCKET = 10;

  socket.on('room:join', (roomName) => {
    if (typeof roomName !== 'string') {
      logger.warn('Socket room:join payload must be a string', { socketId: socket.id });
      return;
    }

    if (!ALLOWED_PUBLIC_ROOMS.includes(roomName)) {
      logger.warn('Unapproved room:join attempt rejected', { socketId: socket.id, room: roomName });
      return socket.emit('room:join:error', { error: 'Invalid or unauthorized room name' });
    }

    if (PROTECTED_ROOMS.includes(roomName) && !socket.adminAuthenticated) {
      logger.warn('Unauthorized room join attempt', { socketId: socket.id, room: roomName });
      return socket.emit('room:join:error', { error: 'Authentication required to join this room' });
    }

    const joinedCount = socket.rooms ? socket.rooms.size - 1 : 0;
    if (joinedCount >= MAX_ROOMS_PER_SOCKET) {
      logger.warn('Socket joined rooms limit exceeded', { socketId: socket.id });
      return socket.emit('room:join:error', { error: 'Maximum room subscription limit reached' });
    }

    socket.join(roomName);
    logger.info('User joined room', { socketId: socket.id, room: roomName });
  });

  socket.on('room:leave', (roomName) => {
    if (typeof roomName !== 'string') return;
    socket.leave(roomName);
    logger.info('User left room', { socketId: socket.id, room: roomName });
  });

  socket.on('join_room', (roomId, user) => {
    if (typeof roomId !== 'string' || !/^[a-zA-Z0-9\-_]{1,100}$/.test(roomId)) {
      logger.warn('Malformed workspace roomId join attempt rejected', {
        socketId: socket.id,
        roomId,
      });
      return;
    }

    const joinedCount = socket.rooms ? socket.rooms.size - 1 : 0;
    if (joinedCount >= MAX_ROOMS_PER_SOCKET) {
      logger.warn('Socket workspace joined rooms limit exceeded', { socketId: socket.id });
      return;
    }

    const now = Date.now();
    let attempts = joinRoomAttempts.get(socket.id);
    if (!attempts || now > attempts.resetAt) {
      attempts = { count: 0, resetAt: now + JOIN_ROOM_WINDOW_MS };
      joinRoomAttempts.set(socket.id, attempts);
    }
    attempts.count += 1;
    if (attempts.count > MAX_JOIN_ROOM_ATTEMPTS) {
      logger.warn('Socket join_room rate limit exceeded', { socketId: socket.id });
      return;
    }

    if (!workspaceRoomMembers.has(roomId)) {
      workspaceRoomMembers.set(roomId, new Set());
    }
    workspaceRoomMembers.get(roomId).add(socket.id);

    socket.join(roomId);
    logger.info('User joined workspace room', { socketId: socket.id, roomId });

    const sanitizedUser =
      user && typeof user === 'object'
        ? {
            id: typeof user.id === 'string' ? user.id.slice(0, 100) : undefined,
            name: typeof user.name === 'string' ? user.name.slice(0, 100) : 'Anonymous',
            email: typeof user.email === 'string' ? user.email.slice(0, 150) : '',
            color: typeof user.color === 'string' ? user.color.slice(0, 50) : '#888',
            initials: typeof user.initials === 'string' ? user.initials.slice(0, 2) : 'U',
          }
        : { name: 'Anonymous', color: '#888', initials: 'U' };

    socket
      .to(roomId)
      .emit('user_joined', { socketId: socket.id, user: sanitizedUser, timestamp: Date.now() });
  });

  socket.on('leave_room', (roomId) => {
    if (typeof roomId !== 'string') return;
    _removeWorkspaceMember(roomId, socket.id);
    socket.leave(roomId);
    logger.info('User left workspace room', { socketId: socket.id, roomId });
    socket.to(roomId).emit('user_left', { socketId: socket.id });
  });

  socket.on('workspace_update', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('workspace_update', payload);
    }
  });

  socket.on('planning:join', (eventId) => {
    if (typeof eventId === 'string' && /^[a-zA-Z0-9\-_]{1,100}$/.test(eventId)) {
      socket.join(`planning:${eventId}`);
    }
  });
  socket.on('planning:leave', (eventId) => {
    if (typeof eventId === 'string') socket.leave(`planning:${eventId}`);
  });
  socket.on('planning:updated', (data) => {
    if (data && data.eventId) {
      socket.to(`planning:${data.eventId}`).emit('planning:updated', data);
    }
  });

  socket.on('document_change', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('document_change', { roomId, ...payload });
    }
  });

  socket.on('cursor_moved', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('cursor_moved', { socketId: socket.id, ...payload });
    }
  });

  socket.on('typing_start', (data) => {
    const { roomId, user, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('typing_start', { socketId: socket.id, user, ...payload });
    }
  });

  socket.on('typing_stop', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('typing_stop', { socketId: socket.id, ...payload });
    }
  });

  socket.on('admin:authenticate', async ({ token } = {}) => {
    if (!token) {
      return socket.emit('admin:authenticated', { success: false, error: 'Token is required' });
    }
    try {
      const session = await getAdminSession(token);
      if (!session) {
        return socket.emit('admin:authenticated', {
          success: false,
          error: 'Invalid or expired token',
        });
      }
      socket.adminSession = session;
      socket.adminAuthenticated = true;
      socket.adminPermissions = resolveAdminPermissions(session);
      const authRooms = getRoomsForPermissions(socket.adminPermissions);
      for (const room of authRooms) {
        socket.join(room);
      }
      logger.info('Admin authenticated via socket event', {
        socketId: socket.id,
        username: session.username,
        rooms: authRooms,
      });
      socket.emit('admin:authenticated', { success: true });
    } catch (e) {
      logger.error('Admin authentication error', { error: e.message, socketId: socket.id });
      socket.emit('admin:authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  socket.on('waiting:join', ({ eventId, fullName, email, isPriority } = {}) => {
    if (!eventId || !email || !fullName) return;
    const userId = socket.id;
    const result = waitingRoomService.joinQueue(eventId, { userId, fullName, email, isPriority });
    socket.join(`waiting:${eventId}`);
    socket.emit('waiting:joined', { eventId, ...result });
  });

  socket.on('waiting:status', ({ eventId } = {}) => {
    if (!eventId) return;
    const queue = waitingRoomService.getQueue(eventId);
    socket.emit('waiting:status:update', { eventId, queue, total: queue.length });
  });

  socket.on('waiting:admit-one', ({ eventId } = {}) => {
    if (!socket.adminAuthenticated || !eventId) return;
    const entry = waitingRoomService.admitOne(eventId);
    if (entry) {
      socket.emit('waiting:admitted-entry', { eventId, entry });
    }
  });

  socket.on('waiting:admit-all', ({ eventId } = {}) => {
    if (!socket.adminAuthenticated || !eventId) return;
    const admitted = waitingRoomService.admitAll(eventId);
    socket.emit('waiting:admitted-entries', { eventId, count: admitted.length });
  });

  socket.on('waiting:remove', ({ eventId, entryId } = {}) => {
    if (!socket.adminAuthenticated || !eventId || !entryId) return;
    waitingRoomService.removeFromQueue(eventId, entryId);
    socket.emit('waiting:removed-entry', { eventId, entryId });
  });

  socket.on('waiting:move-front', ({ eventId, entryId } = {}) => {
    if (!socket.adminAuthenticated || !eventId || !entryId) return;
    waitingRoomService.moveToFront(eventId, entryId);
    socket.emit('waiting:moved-front', { eventId, entryId });
  });

  socket.on('waiting:send-message', ({ eventId, message } = {}) => {
    if (!socket.adminAuthenticated || !eventId || !message) return;
    waitingRoomService.sendMessage(eventId, message);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    _cleanupWorkspaceMembership(socket.id);
    joinRoomAttempts.delete(socket.id);
    logger.info('User disconnected', { socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('Socket error', { error: error.message, socketId: socket.id });
  });
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function broadcastEvent(eventName, data) {
  if (!io) return;
  io.emit(eventName, data);
  logger.debug('Broadcast event', { event: eventName });
}

export function emitToRoom(roomName, eventName, data) {
  if (!io) return;
  io.to(roomName).emit(eventName, data);
  logger.debug('Emit to room', { room: roomName, event: eventName });
}

export function emitToUser(userId, eventName, data) {
  if (!io) return;
  const user = Array.from(connectedUsers.values()).find((u) => u.id === userId);
  if (user) {
    io.to(user.socketId).emit(eventName, data);
    logger.debug('Emit to user', { userId, event: eventName });
  }
}

export function emitToUserByEmail(email, eventName, data) {
  if (!io) return;
  io.to(`user-${String(email).toLowerCase()}`).emit(eventName, data);
  logger.debug('Emit to user by email room', { email, event: eventName });
}

export function getConnectedUsersCount() {
  return connectedUsers.size;
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

export function getRoom(roomType) {
  return rooms[roomType] || null;
}

export function _clearConnectedUsers() {
  connectedUsers.clear();
}

export function _clearWorkspaceRoomMembers() {
  workspaceRoomMembers.clear();
}

export function _clearJoinRoomAttempts() {
  joinRoomAttempts.clear();
}

function _isWorkspaceMember(roomId, socketId) {
  const members = workspaceRoomMembers.get(roomId);
  return members && members.has(socketId);
}

function _removeWorkspaceMember(roomId, socketId) {
  const members = workspaceRoomMembers.get(roomId);
  if (members) {
    members.delete(socketId);
    if (members.size === 0) workspaceRoomMembers.delete(roomId);
  }
}

function _cleanupWorkspaceMembership(socketId) {
  for (const [roomId, members] of workspaceRoomMembers) {
    if (members.has(socketId)) {
      members.delete(socketId);
      if (members.size === 0) workspaceRoomMembers.delete(roomId);
    }
  }
}

export function _setIOForTests(mockIo) {
  io = mockIo;
}

export function emitToRole(roles, eventName, data) {
  if (!io) return;
  const list = Array.isArray(roles) ? roles : [roles];
  const targets = new Set();
  for (const role of list) {
    if (role === 'admin' || role === 'super_admin' || role === 'SuperAdmin') {
      targets.add('admin-room');
      continue;
    }
    if (typeof role === 'string' && role.length > 0) {
      targets.add(`admin-room:${role}`);
    }
  }
  for (const room of targets) {
    io.to(room).emit(eventName, data);
  }
  logger.debug('Emit to role rooms', { rooms: [...targets], event: eventName });
}

export default {
  initializeSocketIO,
  getIO,
  broadcastEvent,
  emitToRoom,
  emitToUser,
  emitToUserByEmail,
  emitToRole,
  _clearConnectedUsers,
  _clearWorkspaceRoomMembers,
  _clearJoinRoomAttempts,
  _onConnection,
  _setIOForTests,
};
