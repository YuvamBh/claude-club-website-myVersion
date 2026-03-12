"use client";

import { useEffect, useRef } from "react";

// Orange Claude brand colour for ball, paddles, and text
const COLOR = "#cc785c";
const HIT_COLOR = "#1a0a06";
const BALL_COLOR = "#cc785c";
const PADDLE_COLOR = "#cc785c";
const LETTER_SPACING = 1;
const WORD_SPACING = 3;

const PIXEL_MAP: Record<string, number[][]> = {
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  C: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  K: [
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  S: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  U: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  B: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  E: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
};

interface Pixel { x: number; y: number; size: number; hit: boolean; }
interface Ball { x: number; y: number; dx: number; dy: number; radius: number; }
interface Paddle { x: number; y: number; width: number; height: number; targetPos: number; isVertical: boolean; }

export function HackASUPongHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const ballRef = useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0, radius: 0 });
  const paddlesRef = useRef<Paddle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeGame();
    };

    const initializeGame = () => {
      const scale = Math.min(canvas.width / 1000, canvas.height / 1000);
      // Smaller pixel sizes (was 9 / 4.5)
      const LARGE_PX = 5.5 * scale;
      const SMALL_PX = 2.8 * scale;
      // 25% slower ball speed (was 4, now 3)
      const BALL_SPEED = 3 * scale;

      pixelsRef.current = [];

      const calcW = (word: string, px: number) =>
        word.split("").reduce((w, l) => {
          const lw = PIXEL_MAP[l]?.[0]?.length ?? 0;
          return w + lw * px + LETTER_SPACING * px;
        }, 0) - LETTER_SPACING * px;

      const line1 = "HACKASU";
      const line2 = "BY CBC";

      const rawLarge = calcW(line1, LARGE_PX);
      const rawSmall = line2.split(" ").reduce((w, word, i) =>
        w + calcW(word, SMALL_PX) + (i > 0 ? WORD_SPACING * SMALL_PX : 0), 0);

      const factor = (canvas.width * 0.72) / Math.max(rawLarge, rawSmall);
      const aL = LARGE_PX * factor;
      const aS = SMALL_PX * factor;

      const lH = 5 * aL;
      const sH = 5 * aS;
      const gap = 3 * aL;
      const totalH = lH + gap + sH;
      let startY = (canvas.height - totalH) / 2;

      // Line 1
      let x = (canvas.width - calcW(line1, aL)) / 2;
      for (const letter of line1) {
        const pm = PIXEL_MAP[letter];
        if (!pm) continue;
        for (let i = 0; i < pm.length; i++)
          for (let j = 0; j < pm[i].length; j++)
            if (pm[i][j])
              pixelsRef.current.push({ x: x + j * aL, y: startY + i * aL, size: aL, hit: false });
        x += (pm[0].length + LETTER_SPACING) * aL;
      }

      startY += lH + gap;

      // Line 2
      const totalSmW = line2.split(" ").reduce((w, word, i) =>
        w + calcW(word, aS) + (i > 0 ? WORD_SPACING * aS : 0), 0);
      let sx = (canvas.width - totalSmW) / 2;
      for (const [wi, word] of line2.split(" ").entries()) {
        if (wi > 0) sx += WORD_SPACING * aS;
        for (const letter of word) {
          const pm = PIXEL_MAP[letter];
          if (!pm) continue;
          for (let i = 0; i < pm.length; i++)
            for (let j = 0; j < pm[i].length; j++)
              if (pm[i][j])
                pixelsRef.current.push({ x: sx + j * aS, y: startY + i * aS, size: aS, hit: false });
          sx += (pm[0].length + LETTER_SPACING) * aS;
        }
      }

      // Smaller ball
      const ballR = aL * 0.38;
      ballRef.current = {
        x: canvas.width * 0.82,
        y: canvas.height * 0.18,
        dx: -BALL_SPEED,
        dy: BALL_SPEED,
        radius: ballR,
      };

      // Only TOP and BOTTOM paddles (no left/right)
      // Decrease width and height of bars
      const padW = aL * 0.4;         // thinner bar height (was 0.7)
      const padLen = 5 * aL;         // shorter bar width (was 8)

      paddlesRef.current = [
        // Bottom paddle only
        {
          x: canvas.width / 2 - padLen / 2,
          y: canvas.height - padW,
          width: padLen,
          height: padW,
          targetPos: canvas.width / 2 - padLen / 2,
          isVertical: false,
        },
      ];
    };

    const update = () => {
      const ball = ballRef.current;

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Left / right walls - simple bounce, no paddle needed
      if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.dx = Math.abs(ball.dx); }
      if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.dx = -Math.abs(ball.dx); }
      // Top / bottom walls (fallback if paddle missed)
      if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.dy = Math.abs(ball.dy); }
      if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.dy = -Math.abs(ball.dy); }

      // Paddle collisions (top/bottom only)
      for (const p of paddlesRef.current) {
        if (
          ball.y - ball.radius < p.y + p.height &&
          ball.y + ball.radius > p.y &&
          ball.x > p.x &&
          ball.x < p.x + p.width
        ) {
          ball.dy = -ball.dy;
        }
        // Track ball x
        p.targetPos = ball.x - p.width / 2;
        p.targetPos = Math.max(0, Math.min(canvas.width - p.width, p.targetPos));
        p.x += (p.targetPos - p.x) * 0.1;
      }

      // Pixel hits
      for (const px of pixelsRef.current) {
        if (!px.hit &&
            ball.x + ball.radius > px.x && ball.x - ball.radius < px.x + px.size &&
            ball.y + ball.radius > px.y && ball.y - ball.radius < px.y + px.size) {
          px.hit = true;
          const cx = px.x + px.size / 2;
          const cy = px.y + px.size / 2;
          if (Math.abs(ball.x - cx) > Math.abs(ball.y - cy)) ball.dx = -ball.dx;
          else ball.dy = -ball.dy;
        }
      }
    };

    const draw = () => {
      // Dark gradient background - deep warm black with subtle orange at centre
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.05,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.85
      );
      grad.addColorStop(0, "#140800");
      grad.addColorStop(0.45, "#0c0400");
      grad.addColorStop(1, "#000000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid overlay
      ctx.strokeStyle = "rgba(204,120,92,0.045)";
      ctx.lineWidth = 0.5;
      const step = Math.round(Math.min(canvas.width, canvas.height) / 30);
      for (let gx = 0; gx < canvas.width; gx += step) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
      }
      for (let gy = 0; gy < canvas.height; gy += step) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
      }

      // Pixels
      for (const px of pixelsRef.current) {
        ctx.fillStyle = px.hit ? HIT_COLOR : COLOR;
        ctx.fillRect(px.x, px.y, px.size, px.size);
      }

      // Ball with glow
      ctx.shadowColor = BALL_COLOR;
      ctx.shadowBlur = 18;
      ctx.fillStyle = BALL_COLOR;
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Paddles
      ctx.shadowColor = PADDLE_COLOR;
      ctx.shadowBlur = 8;
      ctx.fillStyle = PADDLE_COLOR;
      for (const p of paddlesRef.current) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    loop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      aria-label="HackASU by CBC - animated pong hero"
    />
  );
}

export default HackASUPongHero;
