import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useWatchStore } from "../logic/watchStore";
import { getDisplayParts } from "../logic/time";

const CANVAS_W = 512;
const CANVAS_H = 340;

// F-91W palette and helpers
const COL_BLUE = "#0bb1ff";
const COL_YELLOW = "#ffd30a";
const COL_RED = "#e43838";
const COL_WHITE = "#eaf6ff";
const COL_BLACK = "#0a0d11";
const COL_LCD = "#d6e3cf";
const COL_SEGMENT = "#0b1118";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Seven-segment bit masks a..g
const SEG_MAP: Record<
  string,
  [boolean, boolean, boolean, boolean, boolean, boolean, boolean]
> = {
  "0": [true, true, true, true, true, true, false],
  "1": [false, true, true, false, false, false, false],
  "2": [true, true, false, true, true, false, true],
  "3": [true, true, true, true, false, false, true],
  "4": [false, true, true, false, false, true, true],
  "5": [true, false, true, true, false, true, true],
  "6": [true, false, true, true, true, true, true],
  "7": [true, true, true, false, false, false, false],
  "8": [true, true, true, true, true, true, true],
  "9": [true, true, true, true, false, true, true],
  // Add letters for AM/PM and day of week
  A: [true, true, true, false, true, true, true],
  P: [true, true, false, false, true, true, true],
  M: [true, false, true, false, true, false, false],
  S: [true, false, true, true, false, true, true],
  U: [false, true, true, true, true, true, false],
  T: [false, false, false, true, true, true, true],
  W: [false, true, true, true, true, true, false],
  E: [true, false, false, true, true, true, true],
  F: [true, false, false, false, true, true, true],
  R: [false, false, false, false, true, false, true],
  O: [true, true, true, true, true, true, false],
};

function drawDigit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string
) {
  const s = SEG_MAP[value] || SEG_MAP["0"];
  const t = Math.round(Math.min(w, h) * 0.09); // thickness
  ctx.fillStyle = COL_SEGMENT;
  const a = { x: x + t, y: y, w: w - 2 * t, h: t };
  const b = { x: x + w - t, y: y + t, w: t, h: h / 2 - t * 1.2 };
  const c = { x: x + w - t, y: y + h / 2 + t * 0.2, w: t, h: h / 2 - t * 1.2 };
  const d = { x: x + t, y: y + h - t, w: w - 2 * t, h: t };
  const e = { x: x, y: y + h / 2 + t * 0.2, w: t, h: h / 2 - t * 1.2 };
  const f = { x: x, y: y + t, w: t, h: h / 2 - t * 1.2 };
  const g = { x: x + t, y: y + h / 2 - t / 2, w: w - 2 * t, h: t };
  if (s[0]) ctx.fillRect(a.x, a.y, a.w, a.h);
  if (s[1]) ctx.fillRect(b.x, b.y, b.w, b.h);
  if (s[2]) ctx.fillRect(c.x, c.y, c.w, c.h);
  if (s[3]) ctx.fillRect(d.x, d.y, d.w, d.h);
  if (s[4]) ctx.fillRect(e.x, e.y, e.w, e.h);
  if (s[5]) ctx.fillRect(f.x, f.y, f.w, f.h);
  if (s[6]) ctx.fillRect(g.x, g.y, g.w, g.h);
}

function drawBezel(ctx: CanvasRenderingContext2D) {
  // Outer frame
  ctx.fillStyle = COL_BLACK;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Double blue outline
  ctx.strokeStyle = COL_BLUE;
  ctx.lineWidth = 8;
  roundRect(ctx, 12, 12, CANVAS_W - 24, CANVAS_H - 24, 18);
  ctx.stroke();
  ctx.lineWidth = 3;
  roundRect(ctx, 28, 28, CANVAS_W - 56, CANVAS_H - 56, 14);
  ctx.stroke();

  // Top labels
  ctx.fillStyle = COL_WHITE;
  ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CASIO", 44, 56);
  ctx.fillStyle = COL_YELLOW;
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("F-91W", CANVAS_W - 44, 56);

  // Middle legend and light label with red arrows
  ctx.textAlign = "center";
  ctx.fillStyle = COL_YELLOW;
  ctx.font = "bold 16px system-ui";
  ctx.fillText("ALARM CHRONOGRAPH", CANVAS_W / 2, 84);
  ctx.fillStyle = COL_RED;
  ctx.beginPath();
  ctx.moveTo(46, 78);
  ctx.lineTo(64, 78);
  ctx.lineTo(46, 88);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(CANVAS_W - 46, 78);
  ctx.lineTo(CANVAS_W - 64, 78);
  ctx.lineTo(CANVAS_W - 46, 88);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COL_WHITE;
  ctx.font = "12px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("LIGHT", 70, 88);
}

function drawLightEffect(
  ctx: CanvasRenderingContext2D,
  lcdX: number,
  lcdY: number,
  lcdW: number,
  lcdH: number
) {
  // Create gradient from left (bright) to right (dim) - only on LCD screen
  const gradient = ctx.createLinearGradient(
    lcdX,
    lcdY + lcdH / 2,
    lcdX + lcdW,
    lcdY + lcdH / 2
  );
  gradient.addColorStop(0, "rgba(0, 255, 100, 0.5)");
  gradient.addColorStop(0.3, "rgba(0, 255, 100, 0.35)");
  gradient.addColorStop(0.7, "rgba(0, 255, 100, 0.2)");
  gradient.addColorStop(1, "rgba(0, 255, 100, 0.1)");

  // Apply overlay only to LCD area
  ctx.fillStyle = gradient;
  ctx.fillRect(lcdX, lcdY, lcdW, lcdH);
}

function drawLCD(
  ctx: CanvasRenderingContext2D,
  state: ReturnType<typeof useWatchStore.getState>
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBezel(ctx);

  // LCD window (rounded)
  const lcdX = 64,
    lcdY = 96,
    lcdW = CANVAS_W - 128,
    lcdH = 200;

  // Draw LCD background
  ctx.fillStyle = COL_LCD;
  roundRect(ctx, lcdX, lcdY, lcdW, lcdH, 14);
  ctx.fill();

  // Apply light effect if light button is pressed (after LCD background, before content)
  if (state.lightOn) {
    // Save context to preserve clipping
    ctx.save();
    // Create clipping path for the rounded LCD
    roundRect(ctx, lcdX, lcdY, lcdW, lcdH, 14);
    ctx.clip();
    // Draw light effect within clipped area
    drawLightEffect(ctx, lcdX, lcdY, lcdW, lcdH);
    // Restore context
    ctx.restore();
  }

  // LCD border
  ctx.strokeStyle = "#1a1f24";
  ctx.lineWidth = 2;
  roundRect(ctx, lcdX, lcdY, lcdW, lcdH, 14);
  ctx.stroke();

  // Indicators and top text rows
  const parts = getDisplayParts(new Date(), state.settings.is24h);
  ctx.fillStyle = COL_SEGMENT;
  const yIcons = lcdY + 26;
  // signal bars (above PM)
  ctx.fillRect(lcdX + 10, yIcons - 6, 3, 12);
  ctx.fillRect(lcdX + 15, yIcons - 10, 3, 16);
  ctx.fillRect(lcdX + 20, yIcons - 14, 3, 20);
  // bell outline
  ctx.beginPath();
  ctx.arc(lcdX + 36, yIcons - 2, 5, 0, Math.PI * 2);
  ctx.strokeStyle = COL_SEGMENT;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top row indicators using seven-segment style
  const indicatorSize = Math.floor(lcdH * 0.2);
  const indicatorY = lcdY + 46;
  const indicatorGap = Math.floor(indicatorSize * 0.2);

  // Draw AM/PM indicator with system font
  if (parts.ampm) {
    ctx.fillStyle = COL_SEGMENT;
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(parts.ampm, lcdX + 10, indicatorY + 10);
  }

  // Draw day of week (center) with mini seven-segment digits
  const dayText = parts.day;
  let dayX =
    lcdX +
    lcdW / 2 -
    (dayText.length * (indicatorSize * 0.6 + indicatorGap)) / 2;
  for (let i = 0; i < dayText.length; i++) {
    const char = dayText[i];
    drawDigit(
      ctx,
      dayX,
      indicatorY - indicatorSize * 0.7,
      indicatorSize * 0.6,
      indicatorSize * 0.7,
      char
    );
    dayX += indicatorSize * 0.6 + indicatorGap;
  }

  // Draw date (right) with mini seven-segment digits
  const dateText = String(parts.date).padStart(2, "0");
  let dateX =
    lcdX + lcdW - 10 - dateText.length * (indicatorSize * 0.6 + indicatorGap);
  for (let i = 0; i < dateText.length; i++) {
    const char = dateText[i];
    drawDigit(
      ctx,
      dateX,
      indicatorY - indicatorSize * 0.7,
      indicatorSize * 0.6,
      indicatorSize * 0.7,
      char
    );
    dateX += indicatorSize * 0.6 + indicatorGap;
  }

  // Main time display using seven-segment drawing (includes inline seconds)
  drawSevenSegmentTime(ctx, parts, lcdX, lcdY, lcdW, lcdH);

  // Bottom legends
  ctx.textAlign = "left";
  ctx.font = "12px system-ui";
  ctx.fillStyle = COL_BLUE;
  ctx.fillText("WATER", 40, CANVAS_H - 18);
  ctx.textAlign = "center";
  // WR badge with red border
  ctx.strokeStyle = COL_RED;
  ctx.lineWidth = 3;
  ctx.fillStyle = COL_RED;
  roundRect(ctx, CANVAS_W / 2 - 34, CANVAS_H - 34, 68, 22, 8);
  ctx.stroke();
  ctx.font = "bold 16px system-ui";
  ctx.fillText("WR", CANVAS_W / 2, CANVAS_H - 17);
  ctx.textAlign = "right";
  ctx.fillStyle = COL_BLUE;
  ctx.fillText("RESIST", CANVAS_W - 40, CANVAS_H - 18);
}

function drawSevenSegmentTime(
  ctx: CanvasRenderingContext2D,
  parts: ReturnType<typeof getDisplayParts>,
  lcdX: number,
  lcdY: number,
  lcdW: number,
  lcdH: number
) {
  // Format hours with leading zero only in 24h mode
  const hoursStr = parts.ampm
    ? String(parts.hours)
    : String(parts.hours).padStart(2, "0");
  const minutesStr = String(parts.minutes).padStart(2, "0");

  // For 12-hour mode, we need to ensure proper spacing
  // If hours is single digit (e.g., 4), we need a space in first position
  let timeStr;
  if (parts.ampm && parts.hours < 10) {
    timeStr = ` ${parts.hours}${minutesStr}`;
  } else {
    timeStr = `${hoursStr}${minutesStr}`;
  }
  const digitW = Math.floor(lcdW * 0.14);
  const digitH = Math.floor(lcdH * 0.46);
  const top = lcdY + Math.floor(lcdH * 0.4);
  const left = lcdX + Math.floor(lcdW * 0.05);
  const gap = Math.floor(lcdW * 0.016);

  // For 12-hour mode with single digit, first digit is a space (blank)
  if (parts.ampm && parts.hours < 10) {
    // Draw nothing for first digit (space)
    drawDigit(
      ctx,
      left + digitW + gap,
      top,
      digitW,
      digitH,
      String(parts.hours)
    );
  } else {
    // Draw both digits normally
    drawDigit(ctx, left, top, digitW, digitH, timeStr[0]);
    drawDigit(ctx, left + digitW + gap, top, digitW, digitH, timeStr[1]);
  }

  // Colon
  ctx.fillStyle = COL_SEGMENT;
  const cx = left + (digitW + gap) * 1.95 + Math.floor(gap * 1.3);
  const cy = top + Math.floor(digitH * 0.35);
  const r = Math.max(3, Math.floor(digitW * 0.09));

  // Top dot
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1, r, 0, Math.PI * 2);
  ctx.fill();

  // Bottom dot
  ctx.beginPath();
  ctx.arc(cx, cy + r * 9, r, 0, Math.PI * 2);
  ctx.fill();

  drawDigit(
    ctx,
    left + (digitW + gap) * 2 + gap * 2,
    top,
    digitW,
    digitH,
    timeStr[2]
  );
  drawDigit(
    ctx,
    left + (digitW + gap) * 3 + gap * 2,
    top,
    digitW,
    digitH,
    timeStr[3]
  );

  const secStr = String(parts.seconds).padStart(2, "0");
  const secW = Math.floor(digitW * 0.7);
  const secH = Math.floor(digitH * 0.7);
  const rightEdge = left + (digitW + gap) * 3 + gap * 2 + digitW;
  const maxRight = lcdX + lcdW - 12; // keep within LCD
  const totalSecWidth = secW * 2 + Math.floor(gap * 3);
  const minLeft = rightEdge + Math.floor(gap * 1.6); // enforce spacing from minutes
  // Prefer right alignment but never cross the minimum gap; clamp inside LCD
  let secLeft = Math.max(minLeft, maxRight - totalSecWidth);
  if (secLeft + totalSecWidth > maxRight) {
    secLeft = maxRight - totalSecWidth;
  }
  const secTop = top + Math.floor(digitH - secH);
  drawDigit(ctx, secLeft, secTop, secW, secH, secStr[0]);
  drawDigit(
    ctx,
    secLeft + secW + Math.floor(gap * 0.6),
    secTop,
    secW,
    secH,
    secStr[1]
  );
}

export namespace WatchFaceCanvas {
  export function useTexture(): THREE.CanvasTexture {
    const { gl } = useThree();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = CANVAS_W;
      canvasRef.current.height = CANVAS_H;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D context unavailable");
    }

    const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

    useEffect(() => {
      let raf = 0;
      const loop = () => {
        drawLCD(ctx, useWatchStore.getState());
        texture.needsUpdate = true;
        raf = requestAnimationFrame(loop);
      };
      loop();
      return () => cancelAnimationFrame(raf);
    }, [ctx, texture]);

    return texture;
  }
}
