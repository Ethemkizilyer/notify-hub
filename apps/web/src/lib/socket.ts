import { io, type Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  socket?.disconnect();
  socket = io(socketUrl, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
