export type Effect = "blur" | "pixelate" | "emoji" | "eyes";

export function applyEffect(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  effect: Effect,
  emoji = "😀"
) {
  switch (effect) {
    case "blur":
      applyBlur(ctx, img, x, y, w, h);
      break;
    case "pixelate":
      applyPixelate(ctx, img, x, y, w, h);
      break;
    case "emoji":
      applyEmoji(ctx, x, y, w, h, emoji);
      break;
    case "eyes":
      applyEyesRegion(ctx, img, x, y, w, h);
      break;
  }
}

function applyBlur(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 24
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";
  ctx.restore();
}

function applyPixelate(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  blockSize = 16
) {
  const cols = Math.max(1, Math.floor(w / blockSize));
  const rows = Math.max(1, Math.floor(h / blockSize));

  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const offCtx = off.getContext("2d")!;
  offCtx.drawImage(img, x, y, w, h, 0, 0, cols, rows);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, cols, rows, x, y, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.restore();
}

function applyEmoji(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  emoji: string
) {
  const size = Math.min(w, h) * 0.85;
  ctx.save();
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + w / 2, y + h / 2);
  ctx.restore();
}

function applyEyesRegion(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Approximate eye-bar region: occupies ~15%–45% of face height
  const eyeY = y + h * 0.15;
  const eyeH = h * 0.30;
  applyBlur(ctx, img, x, eyeY, w, eyeH, 16);
}
