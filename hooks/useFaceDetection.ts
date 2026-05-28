"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { FaceBox } from "@/types";

type Status = "idle" | "loading" | "ready" | "error";

// IoU (Intersection-over-Union) for deduplication across detection passes
function iou(a: FaceBox, b: FaceBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (inter === 0) return 0;
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  return inter / (areaA + areaB - inter);
}

function deduplicate(boxes: FaceBox[], threshold = 0.4): FaceBox[] {
  const kept: FaceBox[] = [];
  for (const box of boxes) {
    if (!kept.some((k) => iou(k, box) > threshold)) kept.push(box);
  }
  return kept;
}

export function useFaceDetection() {
  const [status, setStatus] = useState<Status>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceapiRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const faceapi = await import("@vladmandic/face-api");
        faceapiRef.current = faceapi;

        // Load both models in parallel — SSD is the primary (better for groups),
        // Tiny is kept as a secondary pass for faces SSD misses
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.load("/models"),
          faceapi.nets.tinyFaceDetector.load("/models"),
        ]);

        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("[face-detect] load failed:", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const detect = useCallback(async (img: HTMLImageElement): Promise<FaceBox[]> => {
    const faceapi = faceapiRef.current;
    if (!faceapi || img.naturalWidth === 0) return [];

    // Work from an offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);

    try {
      // --- Pass 1: SSD MobileNetV1 (best for group photos / multiple faces) ---
      const ssdOptions = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.25,   // low → catch more faces
        maxResults: 100,
      });
      const ssdResults = await faceapi.detectAllFaces(canvas, ssdOptions);

      // --- Pass 2: Tiny Face Detector at high input size (catches smaller faces) ---
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 608,
        scoreThreshold: 0.25,
      });
      const tinyResults = await faceapi.detectAllFaces(canvas, tinyOptions);

      // Combine and remove duplicates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toBox = (d: any): FaceBox => ({
        x: Math.round(d.box.x),
        y: Math.round(d.box.y),
        width: Math.round(d.box.width),
        height: Math.round(d.box.height),
      });

      const all = [
        ...ssdResults.map(toBox),
        ...tinyResults.map(toBox),
      ].filter((b) => b.width > 10 && b.height > 10); // drop tiny noise boxes

      return deduplicate(all);
    } catch (err) {
      console.error("[face-detect] detection error:", err);
      return [];
    }
  }, []);

  return { status, detect };
}
