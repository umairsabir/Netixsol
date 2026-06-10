import React, { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, ChevronLeft, RotateCcw, RotateCw,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onBack?: () => void;
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const volBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [isMuted, setIsMuted]           = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking]       = useState(false);
  const [buffered, setBuffered]         = useState(0);

  // ── helpers ──────────────────────────────────────────────────────────────

  const scheduleHide = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (isPlaying) scheduleHide();
  }, [isPlaying, scheduleHide]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.pause();
    else v.play();
  }, [isPlaying]);

  const skip = useCallback((secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + secs, v.duration));
  }, []);

  // ── seek bar interaction ──────────────────────────────────────────────────

  const seekTo = useCallback((clientX: number) => {
    const v = videoRef.current;
    const bar = seekBarRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setCurrentTime(pct * v.duration);
  }, []);

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSeeking(true);
    seekTo(e.clientX);
  };

  useEffect(() => {
    if (!isSeeking) return;
    const onMove = (e: MouseEvent) => seekTo(e.clientX);
    const onUp = () => setIsSeeking(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isSeeking, seekTo]);

  // ── volume bar interaction ────────────────────────────────────────────────

  const [isDraggingVol, setIsDraggingVol] = useState(false);

  const setVolTo = useCallback((clientX: number) => {
    const bar = volBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (videoRef.current) videoRef.current.volume = pct;
    setVolume(pct);
    setIsMuted(pct === 0);
  }, []);

  const handleVolMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingVol(true);
    setVolTo(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingVol) return;
    const onMove = (e: MouseEvent) => setVolTo(e.clientX);
    const onUp = () => setIsDraggingVol(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingVol, setVolTo]);

  // ── fullscreen ────────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── mute ─────────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !isMuted;
    v.muted = next;
    setIsMuted(next);
    if (!next && volume === 0) {
      v.volume = 0.5;
      setVolume(0.5);
    }
  }, [isMuted, volume]);

  // ── keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) return;
      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const v = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = v;
            setVolume(v);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const v = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = v;
            setVolume(v);
            setIsMuted(v === 0);
          }
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, toggleMute, toggleFullscreen]);

  // ── video events ──────────────────────────────────────────────────────────

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    // buffered
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // If it's an HLS source (.m3u8)
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) video.play().catch(() => {});
        });
        
        return () => {
          hls.destroy();
        };
      } 
      // Native HLS support (Safari)
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      // Standard MP4 or other direct source
      video.src = src;
    }
  }, [src]);

  useEffect(() => {
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, []);

  // progress & buffered as percentages
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-[12px] overflow-hidden select-none"
      onMouseMove={revealControls}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => { setIsPlaying(true); scheduleHide(); }}
        onPause={() => { setIsPlaying(false); setShowControls(true); if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); }}
        onEnded={() => { setIsPlaying(false); setShowControls(true); }}
        onClick={togglePlay}
        muted={isMuted}
      />

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* ── Top bar ── */}
      <div className={`absolute top-0 left-0 right-0 p-5 flex items-center gap-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {onBack && (
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/25 rounded-full backdrop-blur-sm transition-colors">
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}
        <h3 className="text-white font-semibold text-[17px] drop-shadow truncate">{title}</h3>
        <div className="ml-auto text-white/50 text-[12px] font-mono hidden sm:block">
          Space · K = play · ← → = ±10s · ↑↓ = volume · M = mute · F = fullscreen
        </div>
      </div>

      {/* ── Center play button (paused state) ── */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
        >
          <Play size={34} className="text-white translate-x-0.5" fill="currentColor" />
        </button>
      )}

      {/* ── Bottom controls ── */}
      <div className={`absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10 flex flex-col gap-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

        {/* Seek bar */}
        <div
          ref={seekBarRef}
          className="w-full h-1 bg-white/20 rounded-full relative cursor-pointer group/seek"
          style={{ height: '4px' }}
          onMouseDown={handleSeekMouseDown}
        >
          {/* Buffered */}
          <div
            className="absolute left-0 top-0 h-full bg-white/30 rounded-full pointer-events-none"
            style={{ width: `${buffered}%` }}
          />
          {/* Progress */}
          <div
            className="absolute left-0 top-0 h-full bg-primary rounded-full pointer-events-none transition-all"
            style={{ width: `${progressPct}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg pointer-events-none opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPct}% - 6px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Left: play, skip, volume */}
          <div className="flex items-center gap-4">
            {/* Skip back 10s */}
            <button
              onClick={() => skip(-10)}
              className="text-white/80 hover:text-white transition-colors"
              title="Back 10s (←)"
            >
              <RotateCcw size={20} />
            </button>

            {/* Play / Pause */}
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors" title="Play/Pause (Space)">
              {isPlaying
                ? <Pause size={26} fill="currentColor" />
                : <Play size={26} fill="currentColor" />}
            </button>

            {/* Skip forward 10s */}
            <button
              onClick={() => skip(10)}
              className="text-white/80 hover:text-white transition-colors"
              title="Forward 10s (→)"
            >
              <RotateCw size={20} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors" title="Mute (M)">
                <VolumeIcon size={22} />
              </button>
              {/* Volume slider — always visible on desktop, expands on hover on mobile */}
              <div
                ref={volBarRef}
                className="relative h-[4px] bg-white/20 rounded-full cursor-pointer w-0 group-hover/vol:w-20 sm:w-20 transition-all overflow-hidden"
                onMouseDown={handleVolMouseDown}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full pointer-events-none"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white/80 text-[13px] font-mono tabular-nums select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
