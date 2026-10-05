import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

export const socket = io(SERVER_URL, { autoConnect: false });

// Identifies this page load across socket reconnects, so the server can tell a
// reconnecting player from a second player picking the same name. Not stored, so a
// duplicated tab gets its own id and cannot take over the original tab's player.
export const clientId = crypto.randomUUID();
