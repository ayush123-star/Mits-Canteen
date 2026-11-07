import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { playNotificationSound } from '../utils/audio';

const SocketContext = createContext();

const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    // When running Vite dev server locally on port 5173 / 3000, connect directly to port 5000 backend
    if (port === '5173' || port === '3000') {
      return `${protocol}//${hostname}:5000`;
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestReadyToken, setLatestReadyToken] = useState(null);
  const [rushHourActive, setRushHourActive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const serverUrl = getSocketServerUrl();
    console.log(`[Socket.IO] Connecting to real-time server at: ${serverUrl}`);

    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log(`[Socket.IO] Connected to backend server ID: ${socketInstance.id}`);
      setIsConnected(true);
      socketInstance.emit('join:canteen', 'mits-canteen');
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_connected', { detail: { id: socketInstance.id } }));
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected from server: ${reason}`);
      setIsConnected(false);
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_disconnected', { detail: { reason } }));
    });

    socketInstance.on('reconnect', (attempt) => {
      console.log(`[Socket.IO] Reconnected after ${attempt} attempts`);
      setIsConnected(true);
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_reconnected', { detail: { attempt } }));
    });

    // 1. Order Created / New Order
    const handleNewOrder = (data) => {
      console.log('[Socket.IO] order:created / order:new event received:', data);
      const normalized = data?.order || data;
      window.dispatchEvent(new CustomEvent('smartcanteen:order_new', { detail: normalized }));
    };
    socketInstance.on('order:created', handleNewOrder);
    socketInstance.on('order:new', handleNewOrder);

    // 2. Order Updated / Status Updated
    const handleStatusUpdated = (data) => {
      console.log('[Socket.IO] order:updated event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
    };
    socketInstance.on('order:updated', handleStatusUpdated);
    socketInstance.on('order:status_updated', handleStatusUpdated);

    // 2b. Specific Lifecycle Transitions
    socketInstance.on('order:accepted', (data) => {
      console.log('[Socket.IO] order:accepted event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_accepted', { detail: data }));
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
    });

    socketInstance.on('order:preparing', (data) => {
      console.log('[Socket.IO] order:preparing event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_preparing', { detail: data }));
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
    });

    socketInstance.on('order:rejected', (data) => {
      console.log('[Socket.IO] order:rejected event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_rejected', { detail: data }));
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
    });

    // 3. Ready for Pickup
    const handleReady = (data) => {
      console.log('[Socket.IO] order:ready / token:ready event received:', data);
      setLatestReadyToken(data);
      playNotificationSound('ready');
      window.dispatchEvent(new CustomEvent('smartcanteen:token_ready', { detail: data }));
    };
    socketInstance.on('order:ready', handleReady);
    socketInstance.on('token:ready', handleReady);

    // 4. Order Collected / Completed
    socketInstance.on('order:collected', (data) => {
      console.log('[Socket.IO] order:collected event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_collected', { detail: data }));
    });

    // 5. Order Cancelled
    socketInstance.on('order:cancelled', (data) => {
      console.log('[Socket.IO] order:cancelled event received:', data);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_cancelled', { detail: data }));
    });

    // 6. Tokens Refresh
    socketInstance.on('tokens:refresh', () => {
      console.log('[Socket.IO] tokens:refresh signal received');
      window.dispatchEvent(new CustomEvent('smartcanteen:tokens_refresh'));
    });

    // 7. Token Generated / Updated
    socketInstance.on('token:generated', (data) => {
      window.dispatchEvent(new CustomEvent('smartcanteen:token_generated', { detail: data }));
    });
    socketInstance.on('token:updated', (data) => {
      window.dispatchEvent(new CustomEvent('smartcanteen:token_updated', { detail: data }));
    });

    // 8. Automated WhatsApp Alert
    socketInstance.on('whatsapp:sent', (data) => {
      playNotificationSound('whatsapp');
      window.dispatchEvent(new CustomEvent('smartcanteen:whatsapp_alert', { detail: data }));
    });

    // 9. Rush Hour Mode
    socketInstance.on('rush_hour_status', (data) => {
      setRushHourActive(Boolean(data?.isRushHourActive));
    });

    // Reconnection handling on browser online
    const handleOnline = () => {
      console.log('[Network] Browser came online, restoring socket & data...');
      if (!socketInstance.connected) {
        socketInstance.connect();
      }
      window.dispatchEvent(new CustomEvent('smartcanteen:tokens_refresh'));
    };
    window.addEventListener('online', handleOnline);

    setSocket(socketInstance);

    return () => {
      window.removeEventListener('online', handleOnline);
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        latestReadyToken,
        rushHourActive,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
