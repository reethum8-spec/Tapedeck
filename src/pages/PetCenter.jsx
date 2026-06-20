import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedPage } from '../components/AnimatedPage';
import { Check, Edit2, Volume2, VolumeX, Wind, Zap } from 'lucide-react';

const COMPANIONS = [
  { id: 'cat', name: 'Pixel Cat', color: 'bg-pink-300', desc: 'The classic feline companion.' },
  { id: 'bunny', name: 'Bumping Bunny', color: 'bg-white', desc: 'Hops to the beat of your tracks.' },
  { id: 'buddy', name: 'Space Buddy', color: 'bg-brand-accent', desc: 'A hovering blob of pure energy.' },
];

export const PetCenter = () => {
  const { user, updateProfile, updateCompanionSettings } = useAuth();
  const unlocked = user?.unlockedCompanions || ['cat'];
  
  const [activeCompanion, setActiveCompanion] = useState(user?.companion || 'cat');
  const [renaming, setRenaming] = useState(false);
  const [customName, setCustomName] = useState(user?.companionSettings?.customNames?.[activeCompanion] || '');
  
  const sfxEnabled = user?.companionSettings?.sfxEnabled ?? true;
  const animationSpeed = user?.companionSettings?.animationSpeed ?? 50;

  const handleSelect = (id) => {
    if (!unlocked.includes(id)) return;
    setActiveCompanion(id);
    updateProfile({ companion: id });
    setCustomName(user?.companionSettings?.customNames?.[id] || '');
    setRenaming(false);
  };

  const handleSaveName = () => {
    updateCompanionSettings({
      customNames: {
        ...user?.companionSettings?.customNames,
        [activeCompanion]: customName
      }
    });
    setRenaming(false);
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto mt-8 px-4">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-pixel glow-text mb-2 text-brand-accent">PET CENTER</h1>
          <p className="text-gray-500 font-mono text-sm tracking-widest">MANAGE YOUR COMPANIONS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Companion Roster */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPANIONS.map(comp => {
              const isUnlocked = unlocked.includes(comp.id);
              const isActive = activeCompanion === comp.id;
              
              return (
                <div 
                  key={comp.id}
                  onClick={() => handleSelect(comp.id)}
                  className={`border rounded-xl p-5 relative overflow-hidden transition-all ${
                    isUnlocked ? 'cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'
                  } ${
                    isActive 
                      ? 'bg-brand-accent/10 border-brand-accent shadow-[0_0_20px_rgba(93,202,165,0.15)]' 
                      : 'bg-[#111] border-[#333] hover:border-[#555]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-[#1a1a1a] border border-[#222]`}>
                      <div className={`w-4 h-4 rounded-full ${comp.color}`} />
                    </div>
                    {isActive && (
                      <div className="bg-brand-accent text-black text-[10px] font-bold px-2 py-1 rounded font-mono">
                        ACTIVE
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="bg-[#333] text-gray-400 text-[10px] font-bold px-2 py-1 rounded font-mono">
                        LOCKED
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-pixel text-sm text-white mb-2">
                    {user?.companionSettings?.customNames?.[comp.id] || comp.name}
                  </h3>
                  <p className="font-mono text-xs text-gray-500 leading-relaxed">
                    {comp.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            
            {/* Active Pet Details */}
            <div className="bg-[#111] border border-[#333] rounded-xl p-5">
              <h3 className="font-pixel text-xs text-brand-accent mb-4 border-b border-[#222] pb-2">Active Pet</h3>
              
              {renaming ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-[#444] rounded p-2 text-xs font-mono text-white focus:border-brand-accent outline-none"
                    placeholder="Enter name..."
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="bg-brand-accent text-black p-2 rounded">
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <p className="font-mono text-sm text-white">
                    {user?.companionSettings?.customNames?.[activeCompanion] || COMPANIONS.find(c => c.id === activeCompanion)?.name}
                  </p>
                  <button onClick={() => { setCustomName(user?.companionSettings?.customNames?.[activeCompanion] || ''); setRenaming(true); }} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Global Pet Settings */}
            <div className="bg-[#111] border border-[#333] rounded-xl p-5">
              <h3 className="font-pixel text-xs text-brand-accent mb-4 border-b border-[#222] pb-2">Preferences</h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sfxEnabled ? <Volume2 size={16} className="text-gray-400" /> : <VolumeX size={16} className="text-gray-600" />}
                    <span className="font-mono text-xs text-gray-300">Sound Effects</span>
                  </div>
                  <button 
                    onClick={() => updateCompanionSettings({ sfxEnabled: !sfxEnabled })}
                    className={`w-10 h-5 rounded-full relative transition-colors ${sfxEnabled ? 'bg-brand-accent' : 'bg-[#333]'}`}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-white rounded-full absolute top-1"
                      animate={{ left: sfxEnabled ? '22px' : '4px' }}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Wind size={16} className="text-gray-400" />
                    <span className="font-mono text-xs text-gray-300">Follow Speed</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="100" 
                    value={animationSpeed}
                    onChange={(e) => updateCompanionSettings({ animationSpeed: parseInt(e.target.value) })}
                    className="w-full accent-brand-accent bg-[#333] h-1 rounded-full appearance-none"
                  />
                  <div className="flex justify-between mt-1 px-1">
                    <span className="text-[10px] font-mono text-gray-600">SLUGGISH</span>
                    <span className="text-[10px] font-mono text-gray-600">FRANTIC</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Collection Progress */}
            <div className="bg-[#111] border border-[#333] rounded-xl p-5 text-center">
              <Zap size={24} className="text-yellow-500 mx-auto mb-2" />
              <p className="font-pixel text-[10px] text-gray-400 mb-1">COLLECTION PROGRESS</p>
              <p className="font-mono text-xl text-white">
                {unlocked.length} <span className="text-gray-600 text-sm">/ {COMPANIONS.length}</span>
              </p>
            </div>

          </div>

        </div>
      </div>
    </AnimatedPage>
  );
};
