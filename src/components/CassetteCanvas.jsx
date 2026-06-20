import React, { useEffect, useRef } from 'react';

const WIDTH = 90;
const HEIGHT = 60;
const S = 6;

export const CassetteCanvas = ({ tape, isPlaying = false, progress = 0, className = '' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawPixelRect = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * S, y * S, w * S, h * S);
    };

    const drawRoundedRect = (x, y, w, h, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x * S, y * S, w * S, h * S, r * S);
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH * S, HEIGHT * S);

      const bodyColor = tape.color || '#1a472a';
      const labelColor = tape.labelColor || '#5DCAA5';

      // ── Cassette Body (rounded) ──
      drawRoundedRect(0, 0, WIDTH, HEIGHT, 4, bodyColor);

      // Body edge highlight (top)
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(4 * S, 1 * S, (WIDTH - 8) * S, 2 * S);

      // Body edge shadow (bottom)
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(4 * S, (HEIGHT - 3) * S, (WIDTH - 8) * S, 2 * S);

      // ── Screw holes (4 corners) ──
      const screws = [[6, 5], [WIDTH - 8, 5], [6, HEIGHT - 7], [WIDTH - 8, HEIGHT - 7]];
      screws.forEach(([sx, sy]) => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(sx * S + S, sy * S + S, 1.5 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(sx * S + S, sy * S + S, 0.8 * S, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Window Cutout ──
      const winX = 15;
      const winY = 12;
      const winW = 60;
      const winH = 22;

      // Window bevel
      drawRoundedRect(winX - 1, winY - 1, winW + 2, winH + 2, 2, 'rgba(0,0,0,0.4)');
      drawRoundedRect(winX, winY, winW, winH, 2, '#181818');

      // Tape guide lines (connect reels)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = S * 0.8;
      ctx.beginPath();
      // Top tape path
      ctx.moveTo((winX + 5) * S, (winY + 3) * S);
      ctx.lineTo((winX + winW - 5) * S, (winY + 3) * S);
      // Bottom tape path
      ctx.moveTo((winX + 5) * S, (winY + winH - 3) * S);
      ctx.lineTo((winX + winW - 5) * S, (winY + winH - 3) * S);
      ctx.stroke();

      // ── Reels ──
      const leftReelCX = (winX + 15) * S;
      const rightReelCX = (winX + winW - 15) * S;
      const reelCY = (winY + winH / 2) * S;

      const leftTapeR = 7 + progress * 7;
      const rightTapeR = 14 - progress * 7;

      const drawReel = (cx, cy, tapeR, angle) => {
        // Magnetic tape (dark ring)
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(cx, cy, tapeR * S, 0, Math.PI * 2);
        ctx.fill();

        // Tape sheen
        ctx.fillStyle = 'rgba(60,40,20,0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, tapeR * S * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Hub outer ring
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5 * S, 0, Math.PI * 2);
        ctx.fill();

        // Hub inner
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5 * S, 0, Math.PI * 2);
        ctx.fill();

        // Spokes
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        for (let i = 0; i < 3; i++) {
          ctx.rotate(Math.PI * 2 / 3);
          ctx.fillStyle = '#666';
          ctx.beginPath();
          ctx.moveTo(-0.8 * S, 1.5 * S);
          ctx.lineTo(0.8 * S, 1.5 * S);
          ctx.lineTo(1.2 * S, 4.5 * S);
          ctx.lineTo(-1.2 * S, 4.5 * S);
          ctx.fill();
        }
        ctx.restore();

        // Center dot
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5 * S, 0, Math.PI * 2);
        ctx.fill();
      };

      drawReel(leftReelCX, reelCY, leftTapeR, angleRef.current);
      drawReel(rightReelCX, reelCY, rightTapeR, -angleRef.current);

      // Window glass reflection
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(winX * S, winY * S);
      ctx.lineTo((winX + winW) * S, winY * S);
      ctx.lineTo((winX + winW - 15) * S, (winY + winH) * S);
      ctx.lineTo((winX - 5) * S, (winY + winH) * S);
      ctx.fill();

      // ── Label Strip ──
      drawRoundedRect(8, 38, 74, 16, 2, labelColor);

      // Label stripes (retro detail)
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let ly = 0; ly < 16; ly += 2) {
        ctx.fillRect(8 * S, (38 + ly) * S, 74 * S, 1 * S);
      }

      // Tape Name
      ctx.fillStyle = '#111';
      ctx.font = `bold ${5 * S}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayName = (tape.name || 'UNTITLED').substring(0, 14).toUpperCase();
      ctx.fillText(displayName, (WIDTH / 2) * S, 46 * S);

      // Sticker
      if (tape.sticker) {
        ctx.font = `${5 * S}px sans-serif`;
        ctx.fillText(tape.sticker, 14 * S, 46 * S);
        ctx.fillText(tape.sticker, (WIDTH - 14) * S, 46 * S);
      }

      // ── Bottom teeth ──
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(30 * S, 56 * S, 30 * S, 3 * S);
      // Gear holes
      ctx.fillStyle = '#111';
      [35, 55].forEach(gx => {
        ctx.beginPath();
        ctx.arc(gx * S, 57.5 * S, 1.5 * S, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      if (isPlaying) {
        angleRef.current += 0.07;
      }
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [tape, isPlaying, progress]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH * S}
      height={HEIGHT * S}
      className={`pixelated w-full max-w-[540px] ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
