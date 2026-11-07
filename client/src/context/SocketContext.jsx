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
    // In dev, connects to proxy or window.location.origin
    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('token:ready', (data) => {
      console.log('[Socket] Token Ready event received:', data);
      setLatestReadyToken(data);
      playNotificationSound('ready');
    });

    socketInstance.on('whatsapp:sent', (data) => {
      console.log('[Socket] Automated WhatsApp alert received:', data);
      playNotificationSound('whatsapp');
      window.dispatchEvent(new CustomEvent('smartcanteen:whatsapp_alert', { detail: data }));
    });

    socketInstance.on('order:status_updated', (data) => {
      window.dispatchEvent(new CustomEvent('smartcanteen:order_status_updated', { detail: data }));
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
