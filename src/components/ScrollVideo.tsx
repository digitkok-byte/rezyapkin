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
    <div ref={containerRef} className="relative" style={{ height: "600vh" }}>
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
  // Fade out once user starts scrolling
  const opacity = progress < 0.05 ? 1 : Math.max(0, 1 - (progress - 0.05) / 0.1);

  if (opacity <= 0) return null;

  return (
    <div
      className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 animate-pulse"
      style={{ opacity }}
    >
      {/* Up arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1"
        className="opacity-40"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      {/* Thin line */}
      <div className="w-px h-8 bg-white/20" />
      {/* Down arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1"
        className="opacity-40"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

/* ── Text: rises from bottom, stays in place ── */
function TextLayer({ progress }: { progress: number }) {
  // Each text appears at 'start', rises to its final 'target' position by 'peak', and stays
  const sections = [
    { text: "REZYAPKIN", start: 0.02, peak: 0.14, targetTop: "15vh" },
    { text: ".", start: 0.18, peak: 0.30, targetTop: "38vh" },
    { text: "creative", start: 0.34, peak: 0.46, targetTop: "48vh" },
    { text: "technology", start: 0.50, peak: 0.62, targetTop: "58vh" },
    { text: "AI dev", start: 0.66, peak: 0.80, targetTop: "78vh" },
  ];

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {sections.map((section, i) => {
        let opacity = 0;
        let yOffset = 100; // starts 100vh below (off-screen bottom)

        if (progress >= section.start) {
          if (progress <= section.peak) {
            // Rising from bottom to target position
            const t = (progress - section.start) / (section.peak - section.start);
            opacity = t;
            yOffset = 100 * (1 - t); // 100 → 0 (vh offset from target)
          } else {
            // Stays in place
            opacity = 1;
            yOffset = 0;
          }
        }

        const isTitle = i === 0;
        const isAiDev = i === sections.length - 1;
        const isDot = section.text === ".";

        return (
          <div
            key={i}
            className="absolute left-0 right-0 flex justify-center"
            style={{
              top: section.targetTop,
              opacity,
              transform: `translateY(${yOffset}vh)`,
            }}
          >
            <span
              className={`
                ${isTitle ? "text-6xl md:text-9xl lg:text-[10rem] tracking-[0.15em] md:tracking-[0.2em]" : ""}
                ${isAiDev ? "text-6xl md:text-9xl lg:text-[10rem] tracking-[0.1em] md:tracking-[0.15em]" : ""}
                ${isDot ? "text-8xl md:text-[10rem]" : ""}
                ${!isTitle && !isAiDev && !isDot ? "text-3xl md:text-6xl lg:text-8xl tracking-[0.1em] md:tracking-[0.15em]" : ""}
                font-[100] text-white
              `}
              style={{
                textShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.5)",
              }}
            >
              {section.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
