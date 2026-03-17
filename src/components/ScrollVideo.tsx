"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 122;

function getFramePath(index: number): string {
  const num = String(index).padStart(4, "0");
  return `/frames/frame_${num}.jpg`;
}

export default function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Preload all frames
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      images.push(img);
    }
  }, []);

  // Draw frame on canvas
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = imagesRef.current[index];
      if (!canvas || !ctx || !img) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Cover mode - fill entire viewport
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      ctx.drawImage(img, x, y, w, h);
    },
    []
  );

  // Scroll handler
  useEffect(() => {
    if (!loaded) return;

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.scrollHeight - window.innerHeight;
        const scrolled = -rect.top;
        const fraction = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        setProgress(fraction);

        const frameIndex = Math.min(
          Math.floor(fraction * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );

        if (frameIndex !== frameIndexRef.current) {
          frameIndexRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    // Draw first frame
    drawFrame(0);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => drawFrame(frameIndexRef.current));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "600vh" }}
    >
      {/* Fixed canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Loading screen */}
      {!loaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-white/30 text-xs tracking-[0.3em] uppercase font-light">
              Loading
            </p>
          </div>
        </div>
      )}

      {/* Text overlays — appear proportionally to scroll */}
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
