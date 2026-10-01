"use client";

import { Maximize2, Pause, Play } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import ExpandableVideoViewer from "@/components/ExpandableVideoViewer";

// Our own speed ladder — the native <video> menu caps at 2x, this reaches 8x.
const SPEEDS = [1, 2, 4, 8] as const;

type VideoPlayerProps = {
  src: string;
  title: string;
  poster?: string;
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
  // Starting playback rate; the speed toggle cycles from here through SPEEDS.
  playbackRate?: number;
  allowSpeedChange?: boolean;
  controlsPlacement?: "overlay" | "below";
  // Callback ref to the inner <video> (e.g. for an IntersectionObserver that
  // plays the in-view card in a carousel).
  onVideoRef?: (el: HTMLVideoElement | null) => void;
  // Fired when a non-looping video reaches its end (e.g. to auto-advance a
  // gallery to the next clip).
  onEnded?: () => void;
};

// Inline video with our own control bar (play/pause, 1–8x speed, scrubber) plus
// an expand button that hands off to the full-screen ExpandableVideoViewer at
// the current position and speed.
export default function VideoPlayer({
  src,
  title,
  poster,
  className,
  loop = false,
  autoPlay = false,
  playbackRate = 2,
  allowSpeedChange = true,
  controlsPlacement = "overlay",
  onVideoRef,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [open, setOpen] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const startIndex = Math.max(0, (SPEEDS as readonly number[]).indexOf(playbackRate));
  const [speedIndex, setSpeedIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const speed = allowSpeedChange ? SPEEDS[speedIndex] : playbackRate;

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const expand = () => {
    setInitialTime(videoRef.current?.currentTime ?? 0);
    setOpen(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  const cycleSpeed = () => setSpeedIndex((current) => (current + 1) % SPEEDS.length);

  const scrub = (nextProgress: number) => {
    const clamped = Math.max(0, Math.min(1, nextProgress));
    setProgress(clamped);
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = clamped * duration;
    }
  };

  const expandButton = (
    <button
      aria-label={`Expand ${title} to full-screen player`}
      className={controlsPlacement === "overlay" ? "video-player__overlay-button video-player__expand" : undefined}
      onClick={expand}
      type="button"
    >
      <Maximize2 aria-hidden="true" size={16} strokeWidth={1.8} />
    </button>
  );

  return (
    <div className="video-player" data-controls-placement={controlsPlacement}>
      <video
        autoPlay={autoPlay}
        className={className}
        loop={loop}
        muted
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = speed;
          setDuration(event.currentTarget.duration || 0);
        }}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setProgress(video.duration ? video.currentTime / video.duration : 0);
        }}
        playsInline
        poster={poster}
        preload="metadata"
        ref={(el) => {
          videoRef.current = el;
          onVideoRef?.(el);
        }}
        src={src}
      />
      {controlsPlacement === "overlay" ? <div className="video-player__overlay">{expandButton}</div> : null}
      <div
        className="video-player__bar expandable-video-modal__controls"
        style={{ "--expandable-video-progress": progress } as CSSProperties}
      >
        <button aria-label={playing ? `Pause ${title}` : `Play ${title}`} onClick={togglePlay} type="button">
          {playing ? <Pause aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
        </button>
        {allowSpeedChange ? (
          <button
            aria-label={`${title} playback speed ${speed}x. Click to change speed.`}
            className="expandable-video-modal__speed"
            onClick={cycleSpeed}
            type="button"
          >
            {speed}×
          </button>
        ) : (
          <span aria-label={`${title} playback speed fixed at ${speed}x`} className="expandable-video-modal__speed">
            {speed}×
          </span>
        )}
        <div className="expandable-video-modal__progress-shell">
          <div className="expandable-video-modal__progress-rail" aria-hidden="true">
            <span />
          </div>
          <input
            aria-label={`${title} video progress`}
            className="expandable-video-modal__progress"
            max="1"
            min="0"
            onChange={(event) => scrub(Number(event.currentTarget.value))}
            step="0.001"
            type="range"
            value={progress}
          />
        </div>
        {controlsPlacement === "below" ? expandButton : null}
      </div>
      <ExpandableVideoViewer
        initialTime={initialTime}
        isOpen={open}
        loop={loop}
        onClose={() => setOpen(false)}
        onCycleSpeed={allowSpeedChange ? cycleSpeed : undefined}
        playbackRate={speed}
        poster={poster}
        speedLabel={`${speed}x`}
        src={src}
        title={title}
      />
    </div>
  );
}
