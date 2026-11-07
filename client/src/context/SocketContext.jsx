import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { playNotificationSound } from '../utils/audio';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestReadyToken, setLatestReadyToken] = useState(null);
  const [rushHourActive, setRushHourActive] = useState(false);

  useEffect(() => {
    // Dynamic socket host determination:
    // If backend is local on port 5000 while client is on 5173, point directly or via proxy
    const socketUrl =
      import.meta.env.VITE_BACKEND_URL ||
      (typeof window !== 'undefined' && window.location.port === '5173'
        ? 'http://localhost:5000'
        : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to backend real-time server ID:', socketInstance.id);
      setIsConnected(true);
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_connected'));
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from server:', reason);
      setIsConnected(false);
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_disconnected'));
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] Reconnected successfully on attempt #${attemptNumber}`);
      setIsConnected(true);
      window.dispatchEvent(new CustomEvent('smartcanteen:socket_connected'));
      window.dispatchEvent(new CustomEvent('smartcanteen:tokens_refresh'));
    });

    // Real-Time Event: New Incoming Order (from ANY student or device)
    socketInstance.on('order:new', (newOrder) => {
      console.log('[Socket] New incoming order broadcast received:', newOrder?.tokenNumber);
      playNotificationSound('new_order');
      window.dispatchEvent(new CustomEvent('smartcanteen:order_new', { detail: newOrder }));
    });

    // Real-Time Event: Order Status Update
    socketInstance.on('order:status_updated', (data) => {
      console.log('[Socket] Order status updated in real-time:', data?.tokenNumber, data?.status);
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
    });

    // Real-Time Event: Token Ready for Pickup (chime + event)
    socketInstance.on('token:ready', (data) => {
      console.log('[Socket] Token Ready event received:', data?.tokenNumber);
      setLatestReadyToken(data);
      playNotificationSound('ready');
      window.dispatchEvent(new CustomEvent('smartcanteen:token_ready', { detail: data }));
    });

    // Real-Time Event: Token Completed / Collected
    socketInstance.on('token:completed', (data) => {
      console.log('[Socket] Token Completed event received:', data?.tokenNumber);
      window.dispatchEvent(new CustomEvent('smartcanteen:token_completed', { detail: data }));
    });

    // Real-Time Event: Tokens Refresh
    socketInstance.on('tokens:refresh', () => {
      window.dispatchEvent(new CustomEvent('smartcanteen:tokens_refresh'));
    });

    // Real-Time Event: Automated Meta WhatsApp Notification Alert
    socketInstance.on('whatsapp:sent', (data) => {
      playNotificationSound('whatsapp');
      window.dispatchEvent(new CustomEvent('smartcanteen:whatsapp_alert', { detail: data }));
    });

    socketInstance.on('rush_hour_status', (data) => {
      setRushHourActive(data.isRushHourActive);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
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
