"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (src: string) => void;
}

export default function Uploader({ onFile }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onFile(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <label
      htmlFor="file-upload"
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        width: "100%",
        padding: "3.5rem 2rem",
        borderRadius: "1.25rem",
        border: `1.5px dashed ${isDragging ? "#f97316" : "rgba(249,115,22,0.22)"}`,
        background: isDragging
          ? "rgba(249,115,22,0.04)"
          : "linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s, transform 0.2s",
        transform: isDragging ? "scale(1.01)" : "scale(1)",
        backdropFilter: "blur(4px)",
        textAlign: "center",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(249,115,22,0.07), transparent)",
        opacity: isDragging ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: "4.5rem",
        height: "4.5rem",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDragging ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isDragging ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`,
        transition: "background 0.25s, border-color 0.25s, transform 0.2s",
        transform: isDragging ? "scale(1.08)" : "scale(1)",
        position: "relative",
      }}>
        <UploadCloud
          size={28}
          style={{ color: isDragging ? "#f97316" : "rgba(255,255,255,0.35)", transition: "color 0.25s" }}
        />
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", position: "relative" }}>
        <p style={{
          fontSize: "1.125rem",
          fontFamily: "var(--font-bricolage)",
          fontWeight: 700,
          color: "#fff",
          margin: 0,
        }}>
          {isDragging ? "Drop to anonymize" : "Upload a photo"}
        </p>
        <p style={{
          fontSize: "0.8125rem",
          fontFamily: "var(--font-jetbrains)",
          color: "rgba(255,255,255,0.4)",
          margin: 0,
        }}>
          Drag & drop or{" "}
          <span style={{ color: "#f97316", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            browse your files
          </span>
        </p>
        <p style={{
          fontSize: "0.6875rem",
          fontFamily: "var(--font-jetbrains)",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.05em",
          margin: 0,
        }}>
          JPG · PNG · WebP · HEIC
        </p>
      </div>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
