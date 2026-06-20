import React from 'react';
import { motion } from 'framer-motion';

export const MemoryCard = ({ memory }) => {
  if (!memory) return null;

  if (memory.type === 'note') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative w-64 h-64 bg-[#fef08a] shadow-lg p-6 flex flex-col justify-center items-center text-center transform -rotate-3"
      >
        {/* Tape Strip */}
        <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-6 bg-white/40 backdrop-blur-sm shadow-sm rotate-2" />
        
        <p className="font-sans text-2xl text-gray-800 leading-relaxed break-words w-full" style={{ fontFamily: "'Caveat', cursive" }}>
          {memory.text}
        </p>
      </motion.div>
    );
  }

  if (memory.type === 'photo') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 10 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
        className="w-64 bg-white p-3 shadow-xl transform rotate-2"
      >
        <div className="w-full aspect-square bg-gray-200 overflow-hidden mb-3">
          {memory.imageUrl ? (
            <img 
              src={memory.imageUrl} 
              alt="Memory" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516280440502-861f6764bd82?w=500&q=80'; }} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📸</span>
            </div>
          )}
        </div>
        <p className="font-sans text-xl text-center text-gray-800" style={{ fontFamily: "'Caveat', cursive" }}>
          {memory.text}
        </p>
      </motion.div>
    );
  }

  return null;
};
