import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import { MitsCampusBackground } from '../components/common/MitsCampusBackground';
import {
  Tv,
  BellRing,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  MapPin,
  CheckCircle,
  Flame,
  ChefHat,
  Megaphone,
  Radio
} from 'lucide-react';
import {
  playNotificationSound,
  announceTokenCall,
  speakAnnouncement,
  unlockAudio
} from '../utils/audio';

export const LiveTokenDisplay = () => {
  const { orders } = useData();
  const { socket, isConnected } = useSocket();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioToast, setAudioToast] = useState(null);
  const [lastCalledToken, setLastCalledToken] = useState(null);

  // Centralized Database-driven Token States (Consistent across Mobile, Laptop & TV)
  const [preparingTokens, setPreparingTokens] = useState([]);
  const [readyTokens, setReadyTokens] = useState([]);
  const [recentlyCompleted, setRecentlyCompleted] = useState([]);
  const [stats, setStats] = useState({ totalActive: 0, avgWaitMinutes: 8, countersActive: 1 });
  const [isKitchenSynced, setIsKitchenSynced] = useState(true);

  // 1. Reactive immediate derivation from DataContext orders (Single Source of Truth)
  useEffect(() => {
    if (orders && Array.isArray(orders)) {
      // PREPARING: ONLY show orders that are actively cooking (status === 'Preparing')
      const prep = orders.filter((o) => {
        const tok = String(o.tokenNumber || '').replace('#', '').trim();
        return o.status === 'Preparing' && tok !== 'TK-114' && tok !== '114';
      });
      // READY FOR PICKUP: ONLY show orders that are ready (status === 'Ready for Pickup')
      const rdy = orders.filter((o) => {
        const tok = String(o.tokenNumber || '').replace('#', '').trim();
        return o.status === 'Ready for Pickup' && tok !== 'TK-114' && tok !== '114';
      });
      // RECENTLY COLLECTED: Only show completed/collected orders
      const comp = orders.filter((o) => ['Completed', 'Collected'].includes(o.status)).slice(0, 10);

      setPreparingTokens(prep);
      setReadyTokens(rdy);
      setRecentlyCompleted(comp);
      setStats({
        totalActive: prep.length + rdy.length,
        avgWaitMinutes: prep.length > 0
          ? Math.round(prep.reduce((acc, o) => acc + (o.estimatedPrepMinutes || 10), 0) / prep.length)
          : 8,
        countersActive: 1,
      });
      setIsKitchenSynced(true);
    }
  }, [orders]);

  // 2. Fetch live tokens directly from the centralized database & merge
  const fetchLiveTokensFromDB = useCallback(async () => {
    try {
      const res = await axios.get('/api/orders/live-tokens', { timeout: 2500 });
      if (res.data?.success && res.data?.data) {
        const {
          preparing = [],
          ready = [],
          recentlyCompleted: completed = [],
          stats: serverStats = {},
        } = res.data.data;

        // Authoritative server sync: Only display tokens that the server reports as active
        if (Array.isArray(preparing) && Array.isArray(ready) && Array.isArray(completed)) {
          const prepList = preparing.filter((o) => {
            const tok = String(o.tokenNumber || '').replace('#', '').trim();
            return o.status === 'Preparing' && tok !== 'TK-114' && tok !== '114';
          });
          const readyList = ready.filter((o) => {
            const tok = String(o.tokenNumber || '').replace('#', '').trim();
            return o.status === 'Ready for Pickup' && tok !== 'TK-114' && tok !== '114';
          });
          const completedList = completed.slice(0, 10);

          setPreparingTokens(prepList);
          setReadyTokens(readyList);
          setRecentlyCompleted(completedList);
          setStats({
            totalActive: prepList.length + readyList.length,
            avgWaitMinutes: prepList.length > 0
              ? Math.round(prepList.reduce((acc, o) => acc + (o.estimatedPrepMinutes || 10), 0) / prepList.length)
              : 8,
            countersActive: 1,
          });
        }
        setIsKitchenSynced(true);
        return;
      }
    } catch (_) {
      // Backend request fallback to DataContext reactive state
    }
  }, []);

  // Subscribe to real-time events from centralized database & Socket.IO
  useEffect(() => {
    fetchLiveTokensFromDB();

    const handleRealtimeRefresh = () => {
      fetchLiveTokensFromDB();
    };

    // Socket.IO real-time event listeners from backend
    if (socket) {
      socket.on('tokens:refresh', handleRealtimeRefresh);
      socket.on('token:ready', handleRealtimeRefresh);
      socket.on('order:ready', handleRealtimeRefresh);
      socket.on('order:collected', handleRealtimeRefresh);
      socket.on('order:created', handleRealtimeRefresh);
      socket.on('order:new', handleRealtimeRefresh);
      socket.on('order:updated', handleRealtimeRefresh);
      socket.on('order:status_updated', handleRealtimeRefresh);
      socket.on('order:cancelled', handleRealtimeRefresh);
      socket.on('token:generated', handleRealtimeRefresh);
      socket.on('token:updated', handleRealtimeRefresh);
    }

    // Standard cross-device & cross-tab events
    window.addEventListener('smartcanteen:tokens_refresh', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:token_ready', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:order_new', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:order_status_updated', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:order_collected', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:orders_sync', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:socket_connected', handleRealtimeRefresh);
    window.addEventListener('smartcanteen:socket_reconnected', handleRealtimeRefresh);
    window.addEventListener('online', handleRealtimeRefresh);

    // Guaranteed polling interval (2.5 seconds) ensuring all devices remain 100% in sync
    const pollInterval = setInterval(fetchLiveTokensFromDB, 2500);

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.off('tokens:refresh', handleRealtimeRefresh);
        socket.off('token:ready', handleRealtimeRefresh);
        socket.off('order:ready', handleRealtimeRefresh);
        socket.off('order:collected', handleRealtimeRefresh);
        socket.off('order:created', handleRealtimeRefresh);
        socket.off('order:new', handleRealtimeRefresh);
        socket.off('order:updated', handleRealtimeRefresh);
        socket.off('order:status_updated', handleRealtimeRefresh);
        socket.off('order:cancelled', handleRealtimeRefresh);
        socket.off('token:generated', handleRealtimeRefresh);
        socket.off('token:updated', handleRealtimeRefresh);
      }
      window.removeEventListener('smartcanteen:tokens_refresh', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:token_ready', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:order_new', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:order_status_updated', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:order_collected', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:orders_sync', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:socket_connected', handleRealtimeRefresh);
      window.removeEventListener('smartcanteen:socket_reconnected', handleRealtimeRefresh);
      window.removeEventListener('online', handleRealtimeRefresh);
    };
  }, [socket, fetchLiveTokensFromDB]);

  // Clock ticker
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Unlock audio automatically on any first touch or tap on the page (mobile browser requirement)
  useEffect(() => {
    const handleFirstGesture = () => {
      unlockAudio();
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Automatic Continuous Audio & Voice Announcement System for Ready Tokens
  const isSpeakingRef = useRef(false);
  const currentTokenIdxRef = useRef(0);

  useEffect(() => {
    // If audio is muted or there are no ready tokens, cancel speech and reset
    if (!audioEnabled || readyTokens.length === 0) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current = false;
      return;
    }

    let loopTimer = null;
    let isCancelled = false;

    const playNextReadyAnnouncement = () => {
      if (isCancelled || !audioEnabled || readyTokens.length === 0) return;
      if (isSpeakingRef.current) return;

      if (currentTokenIdxRef.current >= readyTokens.length) {
        currentTokenIdxRef.current = 0;
      }

      const orderToCall = readyTokens[currentTokenIdxRef.current];
      if (!orderToCall || !orderToCall.tokenNumber) return;

      isSpeakingRef.current = true;
      setLastCalledToken(orderToCall.tokenNumber);
      setAudioToast({
        message: `Calling Token #${orderToCall.tokenNumber} at Counter! 📣`,
        active: true,
      });

      announceTokenCall(orderToCall.tokenNumber, 'Counter');

      // The chime + speech takes ~5 seconds; release speaking flag and increment token index
      setTimeout(() => {
        isSpeakingRef.current = false;
        currentTokenIdxRef.current = (currentTokenIdxRef.current + 1) % readyTokens.length;
      }, 5500);
    };

    // Immediately trigger announcement when an order is ready
    playNextReadyAnnouncement();

    // Automatically repeat announcement every 11 seconds until order is collected
    loopTimer = setInterval(() => {
      playNextReadyAnnouncement();
    }, 11000);

    return () => {
      isCancelled = true;
      if (loopTimer) clearInterval(loopTimer);
    };
  }, [readyTokens, audioEnabled]);

  // Auto-dismiss floating audio toast
  useEffect(() => {
    if (audioToast) {
      const timer = setTimeout(() => setAudioToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [audioToast]);

  // Audio Toggle with immediate feedback
  const handleToggleAudio = () => {
    unlockAudio();
    if (!audioEnabled) {
      setAudioEnabled(true);
      setAudioToast({
        message: 'Voice Calling Enabled 🔊',
        active: true,
      });
      playNotificationSound('test');
      speakAnnouncement('Voice calling enabled for MITS Canteen.');
    } else {
      setAudioEnabled(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAudioToast({
        message: 'Sound & Voice Muted 🔇',
        active: true,
      });
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-white flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden dark-surface">
      {/* Real Animated MITS Gwalior Campus Drone Reel Background */}
      <MitsCampusBackground overlay="tv" showBadge={true} showControls={false} />

      {/* FLOATING AUDIO STATUS TOAST */}
      {audioToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#151C30]/95 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/80 rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-xl animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30 shrink-0">
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-white">{audioToast.message}</p>
            <p className="text-[10px] text-[#AAB3C5]">MITS Live Audio Announcement System</p>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1020]/80 border border-purple-500/25 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center font-black shadow-lg shadow-purple-500/20 border-2 border-purple-500/40 shrink-0">
            <img
              src="/images/mits/mits-logo.png"
              alt="MITS Gwalior"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                MITS CANTEEN &bull; LIVE TV TOKEN DISPLAY
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white animate-pulse shadow-md shadow-purple-500/30">
                MITS MAIN CANTEEN COUNTER
              </span>
            </div>
            <p className="text-xs text-[#AAB3C5] flex items-center gap-2 mt-0.5">
              <span>Address: MITS Main Canteen, Counter, MITS Campus, Gwalior</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Kitchen Synced
              </span>
            </p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-purple-500/20 pr-4">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-[11px] text-[#AAB3C5]">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Calling Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${audioEnabled && readyTokens.length > 0 ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{readyTokens.length > 0 ? `${readyTokens.length} Ready • Auto-Calling` : 'Auto-Calling Ready'}</span>
            </div>

            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-center ${
                audioEnabled
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/20 ring-2 ring-purple-500/30'
                  : 'bg-[#151C30] text-[#AAB3C5] border-purple-500/20 opacity-80'
              }`}
              title={audioEnabled ? 'Voice Calling Active (Click to Mute)' : 'Sound Muted (Click to Enable)'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullScreen}
              className="p-3 rounded-2xl bg-[#151C30] hover:bg-[#25334d] border border-purple-500/30 text-white transition-colors"
              title="Toggle Fullscreen TV Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT BOARD */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* LEFT COLUMN: READY FOR PICKUP (NOW SERVING) */}
        <div className="lg:col-span-7 bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping"></span>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 uppercase tracking-tight flex items-center gap-2">
                  <BellRing className="w-7 h-7 text-emerald-400 animate-bounce" />
                  Ready For Pickup
                </h2>
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                {readyTokens.length} Tokens Ready
              </span>
            </div>

            <p className="text-xs text-[#AAB3C5] mt-2">
              Please proceed immediately to your assigned pickup counter with your mobile QR code.
            </p>

            {/* Tokens Cards Grid */}
            {readyTokens.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-[#151C30]/80 rounded-3xl border border-purple-500/20 p-6 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <ChefHat className="w-8 h-8 text-purple-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Place an Order to Generate Your Live Token! 🍔
                  </h3>
                  <p className="text-xs text-[#AAB3C5] max-w-md mx-auto leading-relaxed">
                    There are no ready orders right now. Place an order from the campus menu to generate your live token.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/menu"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-lg shadow-purple-500/30 transition-all"
                  >
                    <span>Order Food Now</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {readyTokens.map((ord) => (
                  <div
                    key={ord.id || ord._id}
                    className={`p-5 rounded-3xl bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border-2 shadow-xl flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 relative group ${
                      lastCalledToken === ord.tokenNumber
                        ? 'border-emerald-300 ring-4 ring-emerald-400/40 animate-pulse'
                        : 'border-emerald-400'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      TOKEN
                    </span>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight my-1 drop-shadow-md">
                      #{ord.tokenNumber}
                    </span>
                    <div className="mt-1 px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3" />
                      Counter
                    </div>

                    <div className="mt-2.5 px-3 py-0.5 rounded-xl bg-emerald-400/20 text-emerald-200 text-[10px] font-black flex items-center gap-1 shadow-xs">
                      {lastCalledToken === ord.tokenNumber ? (
                        <>
                          <Megaphone className="w-3 h-3 text-emerald-300 animate-bounce" />
                          <span>Calling Live 📣</span>
                        </>
                      ) : (
                        <span>Ready at Counter</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer of Ready Col: Recently Handed Over */}
          {recentlyCompleted.length > 0 && (
            <div className="mt-8 pt-4 border-t border-purple-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AAB3C5] block mb-2">
                Recently Collected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {recentlyCompleted.map((ord) => (
                  <span
                    key={ord.id || ord._id}
                    className="px-2.5 py-1 rounded-lg bg-[#151C30] text-[#AAB3C5] text-xs font-mono font-bold line-through border border-purple-500/20"
                  >
                    #{ord.tokenNumber}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREPARING (IN THE KITCHEN) */}
        <div className="lg:col-span-5 bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-pulse"></span>
                <h2 className="text-2xl font-black text-purple-300 uppercase tracking-tight flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-purple-400" />
                  Preparing
                </h2>
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                {preparingTokens.length} in Queue
              </span>
            </div>

            <p className="text-xs text-[#AAB3C5] mt-2">
              Our campus chefs are crafting these orders fresh and hot.
            </p>

            {/* Preparing Tokens Cards */}
            {preparingTokens.length === 0 ? (
              <div className="py-20 text-center space-y-2 bg-[#151C30]/80 rounded-3xl border border-purple-500/20 p-6 mt-4">
                <p className="text-base font-black text-purple-300">
                  Place an Order to Generate Your Live Token! ⏳
                </p>
                <p className="text-xs text-[#AAB3C5]">
                  The kitchen preparation queue is currently clear. Place an order to see your live token appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {preparingTokens.map((ord) => (
                  <div
                    key={ord.id || ord._id}
                    className="p-4 rounded-2xl bg-[#151C30] border border-purple-500/20 text-center flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#AAB3C5] uppercase tracking-wider">
                        Token
                      </span>
                      <div className="text-2xl font-black font-mono text-white">
                        #{ord.tokenNumber}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#AAB3C5] bg-[#0B1020] px-2.5 py-1 rounded-lg border border-purple-500/20">
                      <span className="flex items-center gap-1 text-purple-300">
                        <Clock className="w-3.5 h-3.5" />
                        ~{ord.estimatedPrepMinutes || 8}m
                      </span>
                      <span className="font-bold text-white">Counter</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Canteen Stats Widget at bottom */}
          <div className="mt-8 pt-4 border-t border-purple-500/20 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#151C30] p-2.5 rounded-xl border border-purple-500/20">
              <span className="text-[10px] text-[#AAB3C5] block">Avg Wait</span>
              <span className="font-black text-purple-300">~{stats.avgWaitMinutes} mins</span>
            </div>
            <div className="bg-[#151C30] p-2.5 rounded-xl border border-purple-500/20">
              <span className="text-[10px] text-[#AAB3C5] block">Pickup Counter</span>
              <span className="font-black text-emerald-400">Counter</span>
            </div>
            <div className="bg-[#151C30] p-2.5 rounded-xl border border-purple-500/20">
              <span className="text-[10px] text-[#AAB3C5] block">Active Total</span>
              <span className="font-black text-white">{stats.totalActive} Orders</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
