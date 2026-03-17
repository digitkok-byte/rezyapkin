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
    </div>
  );
}

/* ── Text animations synced to scroll ── */
function TextLayer({ progress }: { progress: number }) {
  const sections = [
    { text: "REZYAPKIN", start: 0.05, peak: 0.15, end: 0.35, position: "top" as const },
    { text: ".", start: 0.30, peak: 0.40, end: 0.55, position: "center" as const },
    { text: "creative", start: 0.45, peak: 0.55, end: 0.70, position: "center" as const },
    { text: "technology", start: 0.55, peak: 0.65, end: 0.80, position: "center" as const },
    { text: "AI dev", start: 0.75, peak: 0.85, end: 1.0, position: "bottom" as const },
  ];

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {sections.map((section, i) => {
        let opacity = 0;
        let translateY = 40;
        let scale = 0.96;

        if (progress >= section.start && progress <= section.end) {
          if (progress <= section.peak) {
            const t = (progress - section.start) / (section.peak - section.start);
            opacity = t;
            translateY = 40 * (1 - t);
            scale = 0.96 + 0.04 * t;
          } else {
            if (i === sections.length - 1) {
              opacity = 1;
              translateY = 0;
              scale = 1;
            } else {
              const t = (progress - section.peak) / (section.end - section.peak);
              opacity = 1 - t;
              translateY = -30 * t;
              scale = 1 + 0.03 * t;
            }
          }
        }

        const isTitle = section.position === "top";
        const isAiDev = section.position === "bottom";
        const isDot = section.text === ".";

        const positionClass = isTitle
          ? "top-[12vh] md:top-[10vh] left-0 right-0 flex justify-center"
          : isAiDev
          ? "bottom-[12vh] md:bottom-[10vh] left-0 right-0 flex justify-center"
          : "inset-0 flex items-center justify-center";

        return (
          <div
            key={i}
            className={`absolute ${positionClass}`}
            style={{
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          >
            <span
              className={`
                ${isTitle ? "text-5xl md:text-8xl lg:text-9xl tracking-[0.15em] md:tracking-[0.2em]" : ""}
                ${isAiDev ? "text-5xl md:text-8xl lg:text-9xl tracking-[0.1em] md:tracking-[0.15em]" : ""}
                ${isDot ? "text-7xl md:text-9xl" : ""}
                ${!isTitle && !isAiDev && !isDot ? "text-2xl md:text-5xl lg:text-6xl tracking-[0.1em] md:tracking-[0.15em]" : ""}
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
