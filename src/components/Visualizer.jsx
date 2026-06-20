import React, { useEffect, useRef, useState } from 'react';
import { useTape } from '../context/TapeContext';
import { motion, AnimatePresence } from 'framer-motion';

const STICKERS = ['💖', '✨', '🌈', '⚡', '🌸', '💫', '⭐', '💿', '🎶'];

export const Visualizer = ({ isPlaying }) => {
  const { getFrequencyData } = useTape();
  const canvasRef = useRef(null);
  const [stickers, setStickers] = useState([]);

  // Sticker spawner
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newSticker = {
        id: Date.now() + Math.random(),
        emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
        left: `${10 + Math.random() * 80}%`, // 10% to 90%
        top: `${10 + Math.random() * 80}%`, // 10% to 90%
        size: Math.random() > 0.8 ? 'text-4xl' : 'text-2xl',
      };

      setStickers((prev) => [...prev, newSticker]);

      // Remove after 3 seconds
      setTimeout(() => {
        setStickers((prev) => prev.filter((s) => s.id !== newSticker.id));
      }, 3000);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Visualizer loop
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    // Resize canvas
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const data = getFrequencyData(); // Uint8Array(32)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / data.length) - 2;
      
      for (let i = 0; i < data.length; i++) {
        // value between 0 and 255
        const value = data[i];
        const percent = value / 255;
        const height = percent * canvas.height;
        const x = i * (barWidth + 2);
        const y = canvas.height - height;

        // Create a softer pastel spectrum
        const hue = (i * 360) / data.length;
        ctx.fillStyle = `hsla(${hue}, 80%, 75%, ${percent * 0.7 + 0.15})`; 
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsla(${hue}, 80%, 75%, ${percent * 0.4})`;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 4);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, getFrequencyData]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {/* Visualizer Canvas */}
      <canvas ref={canvasRef} className="w-full h-full opacity-30" />
      
      {/* Floating Stickers */}
      <AnimatePresence>
        {stickers.map((sticker) => (
          <motion.div
            key={sticker.id}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 0.6, scale: 1, y: -20, rotate: (Math.random() - 0.5) * 60 }}
            exit={{ opacity: 0, scale: 1.5, y: -40 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute ${sticker.size}`}
            style={{ left: sticker.left, top: sticker.top }}
          >
            {sticker.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
