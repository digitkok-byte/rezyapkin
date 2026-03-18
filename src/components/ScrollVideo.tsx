"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      video.pause();
      video.currentTime = 0;
      setReady(true);
    };

    // Try multiple events for cross-browser compatibility
    if (video.readyState >= 2) {
      onReady();
      return;
    }

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    // Force load
    video.load();

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (!container || !video) return;

        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.scrollHeight - window.innerHeight;
        const scrolled = -rect.top;
        const fraction = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        setProgress(fraction);
        video.currentTime = fraction * video.duration;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  return (
    <div ref={containerRef} className="relative" style={{ height: "1200vh" }}>
      {/* Video background */}
      <video
        ref={videoRef}
        src="/video.mp4"
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Loading */}
      {!ready && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-white/30 text-xs tracking-[0.3em] uppercase font-light">
              Loading
            </p>
          </div>
        </div>
      )}

      {/* Text overlays */}
      <TextLayer progress={progress} />

      {/* Scroll hint arrow — right side, fades out on scroll */}
      <ScrollHint progress={progress} />
    </div>
  );
}

/* ── Blinking double arrow on the right ── */
function ScrollHint({ progress }: { progress: number }) {
  const opacity = progress < 0.05 ? 1 : Math.max(0, 1 - (progress - 0.05) / 0.1);

  if (opacity <= 0) return null;

  return (
    <div
      className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2"
      style={{
        opacity,
        animation: "blink 2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
      {/* Up arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="0.8"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      {/* Thin line */}
      <div className="w-px h-12 bg-white/50" />
      {/* Down arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="0.8"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

/* ── Text: stacks bottom to top, one line at a time ── */
function TextLayer({ progress }: { progress: number }) {
  // Lines appear one by one, stacking upward from the bottom
  const lines = [
    { text: "REZYAPKIN", trigger: 0.04, size: "hero" },
    { text: "creative", trigger: 0.12, size: "medium" },
    { text: "technology", trigger: 0.20, size: "medium" },
    { text: "AI dev", trigger: 0.28, size: "hero" },
    { text: "SCROLL-DRIVEN ANIMATION", trigger: 0.38, size: "service" },
    { text: "INTERACTIVE WEB", trigger: 0.46, size: "service" },
    { text: "MOTION WEB DESIGN", trigger: 0.54, size: "service" },
    { text: "IMMERSIVE LANDING", trigger: 0.62, size: "service" },
    { text: "CINEMATIC STORYTELLING", trigger: 0.70, size: "service" },
  ];

  const contactOpacity = progress >= 0.82 ? Math.min(1, (progress - 0.82) / 0.08) : 0;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Lines stacking from bottom up */}
      <div className="absolute bottom-8 md:bottom-14 left-6 md:left-14 flex flex-col-reverse items-start gap-1">
        {[...lines].reverse().map((line, i) => {
          const appeared = progress >= line.trigger;
          const entry = appeared
            ? Math.min(1, (progress - line.trigger) / 0.05)
            : 0;

          const sizeClasses: Record<string, string> = {
            hero: "text-5xl md:text-8xl lg:text-9xl tracking-[0.12em] font-[200]",
            medium: "text-2xl md:text-5xl lg:text-7xl tracking-[0.08em] font-[100]",
            service: "text-lg md:text-2xl lg:text-3xl tracking-[0.15em] font-[300]",
          };

          return (
            <div
              key={i}
              style={{
                opacity: entry,
                transform: `translateY(${(1 - entry) * 40}px)`,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
              }}
            >
              <span
                className={`${sizeClasses[line.size] || sizeClasses.medium} text-white`}
                style={{
                  textShadow: "0 0 40px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.5)",
                }}
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contact info — top right */}
      <div
        className="absolute top-6 md:top-10 right-6 md:right-14 flex flex-col items-end gap-3 pointer-events-auto"
        style={{
          opacity: contactOpacity,
          transform: `translateX(${(1 - contactOpacity) * 30}px)`,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <a
          href="tel:+79689774477"
          className="text-xl md:text-2xl font-[300] tracking-[0.12em] hover:opacity-100 transition-opacity"
          style={{ color: "#FFFFFF", textShadow: "0 0 15px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2)" }}
        >
          +7 968 977-44-77
        </a>
        <a
          href="https://t.me/Digitkok"
          className="text-lg md:text-xl font-[300] tracking-[0.15em] hover:opacity-100 transition-opacity"
          style={{ color: "#FFFFFF", textShadow: "0 0 15px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2)" }}
        >
          @Digitkok
        </a>
      </div>
    </div>
  );
}
