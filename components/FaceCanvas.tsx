"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { FaceBox } from "@/types";
import { applyEffect, type Effect } from "@/lib/effects";

interface Props {
  imageSrc: string;
  faces: FaceBox[];
  effect: Effect;
  keptFaceIndex: number | null;
  selectedEmoji: string;
  showOriginal: boolean;
  onFaceClick: (index: number) => void;
}

export interface FaceCanvasHandle {
  download: () => void;
}

const FaceCanvas = forwardRef<FaceCanvasHandle, Props>(function FaceCanvas(
  { imageSrc, faces, effect, keptFaceIndex, selectedEmoji, showOriginal, onFaceClick },
  ref
) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number } | null>(null);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  const renderFn = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (!showOriginal) {
      faces.forEach((face, i) => {
        if (i === keptFaceIndex) return;
        applyEffect(ctx, img, face.x, face.y, face.width, face.height, effect, selectedEmoji);
      });
    }
  }, [faces, effect, keptFaceIndex, selectedEmoji, showOriginal]);

  const renderRef = useRef(renderFn);
  renderRef.current = renderFn;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      renderRef.current();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => { if (imgRef.current) renderFn(); }, [renderFn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const r = canvas.getBoundingClientRect();
      setDisplaySize({ w: r.width, h: r.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    measure();
    return () => ro.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    download() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const a = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
      a.download = "hide-me.png";
      a.click();
    },
  }));

  const scaleX = naturalSize && displaySize ? displaySize.w / naturalSize.w : 1;
  const scaleY = naturalSize && displaySize ? displaySize.h / naturalSize.h : 1;

  return (
    <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", userSelect: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", maxWidth: "100%", maxHeight: "65vh", borderRadius: "0.75rem" }}
        aria-label="Image with face anonymization"
      />

      {!showOriginal && naturalSize && displaySize &&
        faces.map((face, i) => {
          const isKept    = i === keptFaceIndex;
          const isHovered = hoveredFace === i;

          return (
            <button
              key={i}
              type="button"
              aria-label={isKept ? `Face ${i + 1} — visible. Click to hide.` : `Face ${i + 1} — hidden. Click to reveal.`}
              aria-pressed={isKept}
              onClick={() => onFaceClick(i)}
              onMouseEnter={() => setHoveredFace(i)}
              onMouseLeave={() => setHoveredFace(null)}
              style={{
                position: "absolute",
                left:   face.x * scaleX,
                top:    face.y * scaleY,
                width:  face.width  * scaleX,
                height: face.height * scaleY,
                borderRadius: "0.5rem",
                cursor: "pointer",
                background: "none",
                padding: 0,
                border: `2px solid ${
                  isKept
                    ? "#f97316"
                    : isHovered
                    ? "rgba(249,115,22,0.55)"
                    : "rgba(249,115,22,0.2)"
                }`,
                boxShadow: isKept
                  ? "0 0 0 1px rgba(249,115,22,0.2), inset 0 0 20px rgba(249,115,22,0.06)"
                  : isHovered
                  ? "0 0 0 1px rgba(249,115,22,0.1)"
                  : "none",
                backgroundColor: isKept
                  ? "rgba(249,115,22,0.06)"
                  : isHovered
                  ? "rgba(249,115,22,0.04)"
                  : "transparent",
                transition: "border-color 0.18s, box-shadow 0.18s, background-color 0.18s",
                outline: "none",
              }}
            >
              {/* Top-left badge */}
              <span style={{
                position: "absolute",
                top: "0.375rem",
                left: "0.375rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.45rem",
                borderRadius: "0.35rem",
                fontSize: "0.6rem",
                fontFamily: "var(--font-jetbrains), monospace",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "0.04em",
                background: isKept ? "#f97316" : "rgba(0,0,0,0.72)",
                color: isKept ? "#fff" : "rgba(249,115,22,0.9)",
                border: isKept ? "none" : "1px solid rgba(249,115,22,0.3)",
                backdropFilter: "blur(4px)",
                transition: "background 0.18s",
              }} aria-hidden="true">
                {isKept ? (
                  <>
                    {/* Eye icon */}
                    <svg width="8" height="8" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 18C2 18 9 5 24 5C39 5 46 18 46 18C46 18 39 31 24 31C9 31 2 18 2 18Z"
                        stroke="currentColor" strokeWidth="4" strokeLinejoin="round" fill="none"/>
                      <circle cx="24" cy="18" r="7.5" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <circle cx="24" cy="18" r="4" fill="currentColor"/>
                    </svg>
                    Visible
                  </>
                ) : (
                  `#${String(i + 1).padStart(2, "0")}`
                )}
              </span>

              {/* Hover hint at bottom — hidden faces */}
              {!isKept && isHovered && (
                <span style={{
                  position: "absolute",
                  bottom: "0.375rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.35rem",
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontWeight: 600,
                  background: "rgba(0,0,0,0.75)",
                  color: "#f97316",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  pointerEvents: "none",
                }} aria-hidden="true">
                  Click to reveal
                </span>
              )}

              {/* Kept: hint to hide */}
              {isKept && isHovered && (
                <span style={{
                  position: "absolute",
                  bottom: "0.375rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.35rem",
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontWeight: 600,
                  background: "rgba(249,115,22,0.15)",
                  color: "#f97316",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  pointerEvents: "none",
                }} aria-hidden="true">
                  Click to hide
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
});

export default FaceCanvas;
