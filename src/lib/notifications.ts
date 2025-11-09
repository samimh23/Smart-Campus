import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string, role: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔔 Connected to notification server');
      this.socket?.emit('join', { userId, role });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });

    // Écouter les notifications
    this.socket.on('new_homework', (data) => {
      console.log('🔔 Received new homework notification:', data);
      this.emit('new_homework', data);
    });

    this.socket.on('new_grade', (data) => {
      console.log('🔔 Received new grade notification:', data);
      this.emit('new_grade', data);
    });

    this.socket.on('new_submission', (data) => {
      console.log('🔔 Received new submission notification:', data);
      this.emit('new_submission', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('leave');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();
