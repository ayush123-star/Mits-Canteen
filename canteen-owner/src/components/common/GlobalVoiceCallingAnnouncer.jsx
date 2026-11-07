import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { announceTokenCall, unlockAudio } from '../../utils/audio';
import { Volume2, Bell, CheckCircle2, X } from 'lucide-react';

export const GlobalVoiceCallingAnnouncer = () => {
  const { socket } = useSocket();
  const [activeCallToast, setActiveCallToast] = useState(null);
  const lastCalledRef = useRef({ token: '', time: 0 });

  useEffect(() => {
    // 1. Auto-unlock audio and speech engine on any user gesture across any section of the website
    const handleUserGesture = () => {
      unlockAudio();
    };
    window.addEventListener('click', handleUserGesture);
    window.addEventListener('touchstart', handleUserGesture);
    window.addEventListener('keydown', handleUserGesture);

    // 2. Core audio calling handler
    const triggerVoiceCalling = (data) => {
      if (!data) return;
      const rawToken =
        data.tokenNumber ||
        data.token ||
        data.order?.tokenNumber ||
        data.updatedOrder?.tokenNumber;

      if (!rawToken) return;

      const cleanToken = String(rawToken).replace('#', '').trim();
      // Ignore completed or non-ready tokens
      if (cleanToken === 'TK-114' || cleanToken === '114') return;

      const counter =
        data.counter ||
        data.assignedCounter ||
        data.order?.assignedCounter ||
        data.updatedOrder?.assignedCounter ||
        'Counter 1';

      const now = Date.now();
      // Debounce: Avoid rapid double-announcements within 3.5 seconds
      if (
        lastCalledRef.current.token === cleanToken &&
        now - lastCalledRef.current.time < 3500
      ) {
        return;
      }
      lastCalledRef.current = { token: cleanToken, time: now };

      // Ensure audio context is ready & active
      unlockAudio();

      // Broadcast Melodic Calling Chime + Natural Speech Voice
      announceTokenCall(cleanToken, counter);

      // Display animated global notification toast banner
      setActiveCallToast({
        token: cleanToken,
        counter,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Auto-hide banner after 9 seconds
      setTimeout(() => {
        setActiveCallToast((curr) => (curr?.token === cleanToken ? null : curr));
      }, 9000);
    };

    // 3. Socket.IO Listeners
    if (socket) {
      socket.on('order:ready', triggerVoiceCalling);
      socket.on('token:ready', triggerVoiceCalling);
    }

    // 4. Custom DOM Event Listeners
    const handleDOMTokenReady = (e) => triggerVoiceCalling(e.detail);
    window.addEventListener('smartcanteen:token_ready', handleDOMTokenReady);
    window.addEventListener('smartcanteen:order_ready', handleDOMTokenReady);

    // 5. Status updated event listener (fires when owner advances to 'Ready for Pickup')
    const handleStatusUpdated = (e) => {
      const data = e.detail;
      const status = data?.newStatus || data?.status || data?.updatedOrder?.status;
      if (status === 'Ready for Pickup') {
        triggerVoiceCalling(data);
      }
    };
    window.addEventListener('smartcanteen:order_status_updated', handleStatusUpdated);

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      if (socket) {
        socket.off('order:ready', triggerVoiceCalling);
        socket.off('token:ready', triggerVoiceCalling);
      }
      window.removeEventListener('smartcanteen:token_ready', handleDOMTokenReady);
      window.removeEventListener('smartcanteen:order_ready', handleDOMTokenReady);
      window.removeEventListener('smartcanteen:order_status_updated', handleStatusUpdated);
    };
  }, [socket]);

  if (!activeCallToast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto animate-bounce pointer-events-auto shadow-2xl">
      <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-2xl border-2 border-emerald-300/60 backdrop-blur-xl">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 animate-pulse text-xl">
          📢
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-emerald-900">
              Order Ready For Pickup
            </span>
            <span className="text-xs font-mono font-bold text-emerald-200">
              #{activeCallToast.token}
            </span>
          </div>
          <p className="text-xs font-black text-white mt-0.5 truncate">
            Calling Token #{activeCallToast.token} at {activeCallToast.counter}!
          </p>
        </div>
        <button
          onClick={() => setActiveCallToast(null)}
          className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
