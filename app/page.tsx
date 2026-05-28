"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import FaceCanvas, { type FaceCanvasHandle } from "@/components/FaceCanvas";
import Uploader from "@/components/Uploader";
import { Logo } from "@/components/Logo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Download, ImagePlus, EyeOff, Layers, Grid3X3, Smile, Eye,
  Cpu, Zap, Lock, Heart,
} from "lucide-react";
import type { Effect } from "@/lib/effects";
import type { FaceBox } from "@/types";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const EFFECTS: { value: Effect; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "blur",     label: "Blur",      icon: <Layers  size={14} />, desc: "Gaussian blur over face" },
  { value: "pixelate", label: "Pixelate",  icon: <Grid3X3 size={14} />, desc: "Pixel mosaic effect" },
  { value: "emoji",    label: "Emoji",     icon: <Smile   size={14} />, desc: "Cover with emoji" },
  { value: "eyes",     label: "Hide eyes", icon: <EyeOff  size={14} />, desc: "Blur eyes region only" },
];

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: "Faces",   emojis: ["😀","😂","😎","🤩","😍","🤪","😜","🥸","🤓","😏","😤","😡","🤬","😱","🤯","😶","🤐","😷","🤒","🥴"] },
  { label: "Masks",   emojis: ["🤡","👺","👹","🎭","👻","💀","☠️","👽","👾","🤖","🎃","🥷","🕵️","🦸","🦹","🧟","🧛","🧜","🧝","🧞"] },
  { label: "Animals", emojis: ["🐱","🐶","🐸","🦊","🐼","🐨","🐯","🦁","🐮","🐷","🐙","🦋","🐧","🦆","🦉","🦚","🦜","🐺","🦝","🐻"] },
  { label: "Objects", emojis: ["🌟","❤️","🔥","💥","✨","🌈","🍕","🎯","🎱","🎨","🚀","💎","🌸","🍀","⚡","🌙","☀️","🎵","🎲","🎮"] },
];

const FEATURES = [
  { icon: <Cpu  size={13} />, label: "On-device AI"            },
  { icon: <Zap  size={13} />, label: "4 effects"               },
  { icon: <Eye  size={13} />, label: "Keep yours visible"       },
  { icon: <Lock size={13} />, label: "Zero uploads"            },
];

/* ─── Shared inline style tokens ─────────────────────────────────────────── */
const T = {
  bg:        "#080808",
  surface:   "#111111",
  surfaceHi: "#181818",
  border:    "rgba(255,255,255,0.07)",
  borderHi:  "rgba(255,255,255,0.13)",
  brand:     "#f97316",
  brandDim:  "#ea580c",
  text:      "#fafafa",
  muted:     "rgba(255,255,255,0.45)",
  dim:       "rgba(255,255,255,0.22)",
  fontDisp:  "var(--font-bricolage), system-ui, sans-serif",
  fontMono:  "var(--font-jetbrains), monospace",
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const { status: detectorStatus, detect } = useFaceDetection();
  const canvasRef = useRef<FaceCanvasHandle>(null);

  const [imageSrc, setImageSrc]           = useState<string | null>(null);
  const [faces, setFaces]                 = useState<FaceBox[]>([]);
  const [effect, setEffect]               = useState<Effect>("blur");
  const [keptFace, setKeptFace]           = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_CATEGORIES[0].emojis[0]);
  const [isDetecting, setIsDetecting]     = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);
  const [showOriginal, setShowOriginal]   = useState(false);
  const [pendingImage, setPendingImage]   = useState<string | null>(null);
  const [emojiCat, setEmojiCat]           = useState(EMOJI_CATEGORIES[0].label);

  const runDetection = useCallback(async (src: string) => {
    if (detectorStatus !== "ready") return;
    setIsDetecting(true);
    setDetectionDone(false);
    const img = new Image();
    img.onload = async () => {
      try   { const r = await detect(img); setFaces(r); }
      catch { setFaces([]); }
      finally {
        setIsDetecting(false);
        setDetectionDone(true);
        setPendingImage(null);
      }
    };
    img.src = src;
  }, [detectorStatus, detect]);

  useEffect(() => {
    if (pendingImage && detectorStatus === "ready") runDetection(pendingImage);
  }, [pendingImage, detectorStatus, runDetection]);

  const handleFile = useCallback((src: string) => {
    setImageSrc(src);
    setFaces([]);
    setKeptFace(null);
    setDetectionDone(false);
    setShowOriginal(false);
    if (detectorStatus === "ready") runDetection(src);
    else setPendingImage(src);
  }, [detectorStatus, runDetection]);

  const handleFaceClick = useCallback((index: number) => {
    setKeptFace((prev) => (prev === index ? null : index));
    setShowOriginal(false);
  }, []);

  const handleReset = useCallback(() => {
    setImageSrc(null);
    setFaces([]);
    setKeptFace(null);
    setDetectionDone(false);
    setShowOriginal(false);
    setPendingImage(null);
  }, []);

  const handleDownload = useCallback(() => {
    setShowOriginal(false);
    requestAnimationFrame(() => canvasRef.current?.download());
  }, []);

  const noFaces = detectionDone && faces.length === 0 && detectorStatus !== "error";

  type StatusKind = "idle"|"scanning"|"none"|"hidden"|"revealed"|"error";
  let statusKind: StatusKind = "idle";
  let statusText = "";
  if (isDetecting)                     { statusKind = "scanning"; statusText = "Scanning for faces…"; }
  else if (detectorStatus === "error") { statusKind = "error";    statusText = "Detector error — refresh and try again"; }
  else if (noFaces)                    { statusKind = "none";     statusText = "No faces detected — try a clearer photo"; }
  else if (faces.length > 0 && keptFace === null)
    { statusKind = "hidden";   statusText = `${faces.length} face${faces.length !== 1 ? "s" : ""} anonymized — tap a box to reveal yours`; }
  else if (keptFace !== null)
    { statusKind = "revealed"; statusText = `Face ${keptFace + 1} visible · all others hidden`; }

  const statusDotColor: Record<StatusKind, string> = {
    idle: T.dim, scanning: T.brand, none: T.dim,
    hidden: T.brand, revealed: "#22c55e", error: "#ef4444",
  };

  const activeCategoryEmojis = EMOJI_CATEGORIES.find(c => c.label === emojiCat)!.emojis;

  return (
    <TooltipProvider delayDuration={300}>
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: T.bg }}>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: `1px solid ${T.border}`,
          background: "rgba(8,8,8,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem",
            height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Logo size="sm" />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {imageSrc && (
                <button
                  onClick={handleReset}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    fontSize: "0.75rem", fontFamily: T.fontMono,
                    color: T.muted, background: "none", border: "none", cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = T.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                >
                  <ImagePlus size={13} />
                  New photo
                </button>
              )}

              <KofiButton />

              <div style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.6875rem", fontFamily: T.fontMono,
                padding: "0.3rem 0.75rem", borderRadius: "999px",
                border: `1px solid ${
                  detectorStatus === "ready" ? "rgba(34,197,94,0.25)"
                  : detectorStatus === "error" ? "rgba(239,68,68,0.25)"
                  : "rgba(249,115,22,0.25)"
                }`,
                color: detectorStatus === "ready" ? "#86efac"
                  : detectorStatus === "error" ? "#fca5a5"
                  : "#fdba74",
                background: detectorStatus === "ready" ? "rgba(34,197,94,0.06)"
                  : detectorStatus === "error" ? "rgba(239,68,68,0.06)"
                  : "rgba(249,115,22,0.06)",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                  background: detectorStatus === "ready" ? "#22c55e"
                    : detectorStatus === "error" ? "#ef4444" : T.brand,
                  animation: detectorStatus === "loading" ? "pulse 1.5s infinite" : "none",
                }} />
                {detectorStatus === "ready" ? "AI ready" : detectorStatus === "loading" ? "Loading…" : "AI error"}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {!imageSrc ? (

            /* ── Landing ──────────────────────────────────────────────────── */
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1.5rem",
              gap: "2.5rem",
              textAlign: "center",
            }}>

              {/* Eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.6875rem", fontFamily: T.fontMono,
                color: T.brand, letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "0.3rem 0.9rem", borderRadius: "999px",
                border: "1px solid rgba(249,115,22,0.2)",
                background: "rgba(249,115,22,0.05)",
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.brand }} />
                Privacy-first · on-device AI · zero uploads
              </div>

              {/* Headline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <h1 style={{
                  fontFamily: T.fontDisp,
                  fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: "-0.025em",
                  color: T.text,
                  margin: 0,
                }}>
                  Anonymize faces.
                </h1>
                <h1 style={{
                  fontFamily: T.fontDisp,
                  fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: "-0.025em",
                  color: T.brand,
                  margin: 0,
                }}>
                  Zero uploads.
                </h1>
              </div>

              {/* Subtitle */}
              <p style={{
                fontFamily: T.fontMono,
                fontSize: "0.9rem",
                color: T.muted,
                lineHeight: 1.7,
                maxWidth: "28rem",
                margin: 0,
              }}>
                Upload a group photo and every face is hidden instantly.
                <br />Reveal just yours, then download and share.
              </p>

              {/* Upload zone */}
              <div style={{ width: "100%", maxWidth: "560px" }}>
                <Uploader onFile={handleFile} />
              </div>

              {/* Feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", justifyContent: "center" }}>
                {FEATURES.map((f) => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.35rem 0.875rem",
                    borderRadius: "999px",
                    border: `1px solid ${T.border}`,
                    background: "rgba(255,255,255,0.025)",
                    fontSize: "0.75rem",
                    fontFamily: T.fontMono,
                    color: T.muted,
                  }}>
                    <span style={{ color: T.brand, display: "flex", alignItems: "center" }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

            </div>

          ) : (

            /* ── Editor ───────────────────────────────────────────────────── */
            <div style={{
              maxWidth: "1100px", width: "100%", margin: "0 auto",
              padding: "1.5rem 1.5rem 2rem",
              display: "flex", flexDirection: "column", gap: "1rem",
            }}>

              {/* Before / After */}
              {faces.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Tabs value={showOriginal ? "before" : "after"} onValueChange={(v) => setShowOriginal(v === "before")}>
                    <TabsList style={{ background: T.surface, border: `1px solid ${T.border}`, height: "36px", padding: "3px" }}>
                      <TabsTrigger value="before"
                        className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white text-xs font-semibold px-5"
                        style={{ fontFamily: T.fontMono, color: T.muted }}>
                        Before
                      </TabsTrigger>
                      <TabsTrigger value="after"
                        className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white text-xs font-semibold px-5"
                        style={{ fontFamily: T.fontMono, color: T.muted }}>
                        After
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Canvas area */}
              <div style={{
                display: "flex", justifyContent: "center",
                borderRadius: "1.25rem",
                padding: "1.25rem",
                border: `1px solid ${faces.length > 0 && !isDetecting ? "rgba(249,115,22,0.18)" : T.border}`,
                background: "rgba(255,255,255,0.015)",
                boxShadow: faces.length > 0 && !isDetecting
                  ? "0 0 60px rgba(249,115,22,0.05), inset 0 0 0 1px rgba(249,115,22,0.04)"
                  : "none",
                transition: "border-color 0.4s, box-shadow 0.4s",
              }}>
                <FaceCanvas
                  ref={canvasRef}
                  imageSrc={imageSrc}
                  faces={faces}
                  effect={effect}
                  keptFaceIndex={keptFace}
                  selectedEmoji={selectedEmoji}
                  showOriginal={showOriginal}
                  onFaceClick={handleFaceClick}
                />
              </div>

              {/* Status */}
              {statusText && (
                <div style={{ display: "flex", justifyContent: "center" }} aria-live="polite">
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    fontSize: "0.6875rem", fontFamily: T.fontMono, color: T.muted,
                    padding: "0.375rem 0.875rem", borderRadius: "999px",
                    background: T.surface, border: `1px solid ${T.border}`,
                  }}>
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                      background: statusDotColor[statusKind],
                    }} />
                    {statusText}
                  </span>
                </div>
              )}

              {/* Controls */}
              <div style={{
                borderRadius: "1rem",
                border: `1px solid ${T.border}`,
                background: "rgba(255,255,255,0.02)",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>

                  {/* Effect selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    <p style={{ fontSize: "0.625rem", fontFamily: T.fontMono, color: T.dim, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                      Effect
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} role="group" aria-label="Anonymization effect">
                      {EFFECTS.map(({ value, label, icon, desc }) => (
                        <Tooltip key={value}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => { setEffect(value); setShowOriginal(false); }}
                              aria-pressed={effect === value}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.4rem",
                                padding: "0.4rem 0.875rem",
                                borderRadius: "0.625rem",
                                fontSize: "0.75rem",
                                fontFamily: T.fontMono,
                                fontWeight: 600,
                                border: `1px solid ${effect === value ? "transparent" : T.border}`,
                                background: effect === value ? T.brand : "rgba(255,255,255,0.04)",
                                color: effect === value ? "#fff" : T.muted,
                                cursor: "pointer",
                                boxShadow: effect === value ? "0 0 16px rgba(249,115,22,0.3)" : "none",
                                transition: "all 0.15s",
                              }}
                            >
                              {icon}{label}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" style={{ fontFamily: T.fontMono, fontSize: "0.6875rem" }}>
                            {desc}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {keptFace !== null && (
                      <CtaButton onClick={() => setKeptFace(null)} secondary>
                        <EyeOff size={13} /> Hide all
                      </CtaButton>
                    )}
                    <CtaButton onClick={handleReset} secondary>
                      <ImagePlus size={13} /> New photo
                    </CtaButton>
                    <CtaButton onClick={handleDownload} primary>
                      <Download size={13} /> Download
                    </CtaButton>
                  </div>
                </div>

                {/* Emoji picker */}
                {effect === "emoji" && (
                  <>
                    <div style={{ height: "1px", background: T.border }} />
                    <EmojiPicker
                      selected={selectedEmoji}
                      onSelect={setSelectedEmoji}
                      activeCategory={emojiCat}
                      onCategoryChange={setEmojiCat}
                      activeCategoryEmojis={activeCategoryEmojis}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: `1px solid ${T.border}`,
          padding: "0.875rem 1.5rem",
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.6875rem", fontFamily: T.fontMono, color: T.dim }}>
              All processing is local · No uploads · No tracking
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <KofiButton />
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.brand }} />
                <span style={{ fontSize: "0.6875rem", fontFamily: T.fontMono, color: T.dim }}>Privacy-first</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

/* ─── Ko-fi support button ───────────────────────────────────────────────── */

function KofiButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="https://ko-fi.com/m3nnoun"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "999px",
        fontSize: "0.6875rem",
        fontFamily: "var(--font-jetbrains), monospace",
        fontWeight: 600,
        textDecoration: "none",
        border: `1px solid ${hovered ? "rgba(249,115,22,0.6)" : "rgba(249,115,22,0.4)"}`,
        background: hovered ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.08)",
        color: "#f97316",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        boxShadow: hovered ? "0 0 12px rgba(249,115,22,0.2)" : "none",
      }}
    >
      <Heart size={11} style={{ color: "#f97316", fill: "#f97316", transition: "color 0.2s" }} />
      Support
    </a>
  );
}

/* ─── Small helpers ──────────────────────────────────────────────────────── */

function CtaButton({
  onClick, children, primary, secondary,
}: { onClick: () => void; children: React.ReactNode; primary?: boolean; secondary?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.375rem",
        padding: "0.4rem 0.875rem",
        borderRadius: "0.625rem",
        fontSize: "0.75rem",
        fontFamily: "var(--font-jetbrains), monospace",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        border: primary ? "none" : `1px solid rgba(255,255,255,${hovered ? "0.13" : "0.07"})`,
        background: primary
          ? (hovered ? "#ea580c" : "#f97316")
          : (hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)"),
        color: primary ? "#fff" : (hovered ? "#fff" : "rgba(255,255,255,0.5)"),
        boxShadow: primary ? "0 4px 14px rgba(249,115,22,0.28)" : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Emoji Picker ───────────────────────────────────────────────────────── */
function EmojiPicker({
  selected, onSelect, activeCategory, onCategoryChange, activeCategoryEmojis,
}: {
  selected: string; onSelect: (e: string) => void;
  activeCategory: string; onCategoryChange: (c: string) => void;
  activeCategoryEmojis: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fafafa", margin: 0 }}>Emoji overlay</p>
          <p style={{ fontSize: "0.6875rem", fontFamily: "var(--font-jetbrains)", color: "rgba(255,255,255,0.35)", marginTop: "0.2rem", margin: 0 }}>
            Covers each hidden face
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.375rem 0.75rem",
          borderRadius: "0.625rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontSize: "1.375rem", lineHeight: 1 }}>{selected}</span>
          <span style={{ fontSize: "0.6875rem", fontFamily: "var(--font-jetbrains)", color: "rgba(255,255,255,0.3)" }}>active</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => onCategoryChange(cat.label)}
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.6875rem",
              fontFamily: "var(--font-jetbrains)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              border: "none",
              background: activeCategory === cat.label ? "#f97316" : "rgba(255,255,255,0.05)",
              color: activeCategory === cat.label ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <ScrollArea className="h-36">
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(2.5rem, 1fr))", gap: "0.375rem", paddingRight: "0.75rem" }}
          role="group"
          aria-label={`${activeCategory} emojis`}
        >
          {activeCategoryEmojis.map((e) => (
            <button
              key={e}
              onClick={() => onSelect(e)}
              aria-label={e}
              aria-pressed={selected === e}
              style={{
                width: "2.5rem", height: "2.5rem",
                borderRadius: "0.5rem",
                fontSize: "1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.15s, background 0.15s",
                border: selected === e ? "2px solid #f97316" : "1px solid rgba(255,255,255,0.07)",
                background: selected === e ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                transform: selected === e ? "scale(1.1)" : "scale(1)",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
