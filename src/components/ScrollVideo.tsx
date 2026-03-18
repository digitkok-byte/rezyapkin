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

/* ── Text: rises from bottom, stays in place ── */
function TextLayer({ progress }: { progress: number }) {
  // Each text appears at 'start', rises to its final 'target' position by 'peak', and stays
  const sections = [
    { text: "REZYAPKIN", start: 0.02, peak: 0.08, targetTop: "10vh", size: "hero" },
    { text: ".", start: 0.10, peak: 0.14, targetTop: "25vh", size: "dot" },
    { text: "creative", start: 0.16, peak: 0.22, targetTop: "33vh", size: "medium" },
    { text: "technology", start: 0.24, peak: 0.30, targetTop: "43vh", size: "medium" },
    { text: "AI dev", start: 0.32, peak: 0.38, targetTop: "55vh", size: "hero" },
    // Services — right-aligned column, spaced apart
    { text: "SCROLL-DRIVEN ANIMATION", start: 0.42, peak: 0.48, targetTop: "18vh", size: "service" },
    { text: "INTERACTIVE WEB", start: 0.50, peak: 0.56, targetTop: "30vh", size: "service" },
    { text: "MOTION WEB DESIGN", start: 0.58, peak: 0.64, targetTop: "42vh", size: "service" },
    { text: "IMMERSIVE LANDING", start: 0.66, peak: 0.72, targetTop: "54vh", size: "service" },
    { text: "CINEMATIC STORYTELLING", start: 0.74, peak: 0.80, targetTop: "66vh", size: "service" },
  ];

  // Contact info — appears at the very end
  const contactOpacity = progress >= 0.88 ? Math.min(1, (progress - 0.88) / 0.08) : 0;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Contact info — bottom center */}
      <div
        className="absolute bottom-6 md:bottom-10 left-0 right-0 flex flex-col items-center gap-2 pointer-events-auto"
        style={{
          opacity: contactOpacity,
          transform: `translateY(${(1 - contactOpacity) * 20}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <a href="tel:+79689774477" className="text-white/70 text-sm md:text-base font-[200] tracking-[0.15em] hover:text-white transition-colors">
          +7 968 977-44-77
        </a>
        <a href="https://t.me/Digitkok" className="text-white/50 text-xs md:text-sm font-[200] tracking-[0.2em] hover:text-white transition-colors">
          @Digitkok
        </a>
      </div>

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

        const sizeClasses: Record<string, string> = {
          hero: "text-6xl md:text-9xl lg:text-[10rem] tracking-[0.15em] md:tracking-[0.2em] font-[100]",
          dot: "text-8xl md:text-[10rem] font-[100]",
          medium: "text-3xl md:text-6xl lg:text-8xl tracking-[0.1em] md:tracking-[0.15em] font-[100]",
          service: "text-2xl md:text-4xl lg:text-5xl tracking-[0.12em] md:tracking-[0.18em] font-[300]",
        };

        const isService = section.size === "service";

        return (
          <div
            key={i}
            className={`absolute ${isService ? "right-6 md:right-16 flex justify-end" : "left-0 right-0 flex justify-center"}`}
            style={{
              top: section.targetTop,
              opacity,
              transform: `translateY(${yOffset}vh)`,
            }}
          >
            <span
              className={`${sizeClasses[section.size] || sizeClasses.medium} ${isService ? "text-white/90" : "text-white"}`}
              style={{
                textShadow: isService
                  ? "0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(0,0,0,0.8)"
                  : "0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.5)",
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
