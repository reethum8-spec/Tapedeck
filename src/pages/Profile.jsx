import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedPage } from '../components/AnimatedPage';
import { Edit3, Headphones, Disc, Save, Lock, Unlock, Trophy, Clock } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "Just a mixtape enthusiast.");
  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);

  const handleSave = () => {
    updateProfile({ bio, isPublic });
    setIsEditing(false);
  };

  const getCompanionName = () => {
    const defaultNames = { cat: 'Pixel Cat', bunny: 'Bumping Bunny', buddy: 'Space Buddy' };
    const customName = user?.companionSettings?.customNames?.[user?.companion];
    return customName || defaultNames[user?.companion] || 'Unknown Companion';
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-purple-500" />
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#222] bg-[#1a1a1a] shadow-inner mb-4 flex items-center justify-center overflow-hidden">
                <Disc size={40} className="text-gray-500 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-pixel text-brand-accent glow-text mb-1">@{user?.tapeTag}</h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-4">
                Joined {new Date().getFullYear()}
              </p>

              {isEditing ? (
                <div className="w-full space-y-3 mb-4">
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#444] rounded-lg p-3 text-sm font-mono text-gray-300 resize-none h-24 focus:border-brand-accent focus:outline-none transition-colors"
                  />
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-mono text-gray-500">Public Profile</span>
                    <button 
                      onClick={() => setIsPublic(!isPublic)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-brand-accent' : 'bg-[#333]'}`}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-white rounded-full absolute top-1"
                        animate={{ left: isPublic ? '22px' : '4px' }}
                      />
                    </button>
                  </div>
                  <button onClick={handleSave} className="w-full bg-brand-accent text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:brightness-110">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">"{user?.bio || bio}"</p>
                  <button onClick={() => setIsEditing(true)} className="w-full bg-[#1a1a1a] border border-[#333] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#222] transition-colors font-mono text-xs tracking-widest">
                    <Edit3 size={14} /> EDIT PROFILE
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#222] flex justify-between items-center text-xs font-mono text-gray-500">
              <span className="flex items-center gap-1">
                {isPublic ? <Unlock size={14} /> : <Lock size={14} />}
                {isPublic ? 'PUBLIC' : 'PRIVATE'}
              </span>
              <span className="text-brand-accent">PRO MEMBER</span>
            </div>
          </div>

          {/* Active Companion Card */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg border border-[#222] flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${user?.companion === 'bunny' ? 'bg-white' : user?.companion === 'buddy' ? 'bg-brand-accent' : 'bg-pink-300'}`} />
            </div>
            <div>
              <h3 className="font-pixel text-xs text-white mb-1">Companion</h3>
              <p className="font-mono text-xs text-brand-accent">{getCompanionName()}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Stats Dashboard */}
          <div>
            <h3 className="font-pixel text-lg text-white mb-4">Listening Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 flex items-center gap-4 hover:border-brand-accent/50 transition-colors">
                <div className="p-3 bg-brand-accent/10 rounded-lg text-brand-accent">
                  <Headphones size={24} />
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-500 tracking-widest mb-1">HOURS PLAYED</p>
                  <p className="font-pixel text-2xl text-white">{user?.stats?.listeningTime || 0}</p>
                </div>
              </div>
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 flex items-center gap-4 hover:border-purple-500/50 transition-colors">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <Disc size={24} />
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-500 tracking-widest mb-1">TAPES CREATED</p>
                  <p className="font-pixel text-2xl text-white">{user?.stats?.tapesCreated || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-pixel text-lg text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Mock Achievements */}
              {[
                { name: 'First Mix', desc: 'Created 1st Tape', icon: Disc, color: 'text-brand-accent' },
                { name: 'Night Owl', desc: 'Listened past midnight', icon: Clock, color: 'text-purple-400' },
                { name: 'Audiophile', desc: '100+ Hours Listened', icon: Headphones, color: 'text-yellow-500', locked: true },
              ].map((ach, i) => (
                <div key={i} className={`bg-[#111] border border-[#333] rounded-xl p-4 text-center ${ach.locked ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`w-12 h-12 mx-auto rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3 ${ach.color}`}>
                    <ach.icon size={20} />
                  </div>
                  <p className="font-pixel text-[10px] text-white mb-1">{ach.name}</p>
                  <p className="font-mono text-[10px] text-gray-500">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Genres */}
          <div>
            <h3 className="font-pixel text-lg text-white mb-4">Favorite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {(user?.genres?.length ? user.genres : ['Lo-Fi', 'Synthwave', 'Indie Pop']).map(g => (
                <span key={g} className="px-3 py-1 bg-[#1a1a1a] border border-[#333] rounded-full text-xs font-mono text-gray-300">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Recently Played */}
          <div>
            <h3 className="font-pixel text-lg text-white mb-4">Recently Played</h3>
            <div className="bg-[#111] border border-[#333] rounded-xl p-5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-brand-accent to-blue-500 flex items-center justify-center shadow-inner">
                  <Disc size={20} className="text-black/50" />
                </div>
                <div>
                  <p className="font-pixel text-sm text-white mb-1">Midnight Drive</p>
                  <p className="font-mono text-xs text-brand-accent">@synth_god</p>
                </div>
              </div>
              <span className="font-mono text-xs text-gray-500">2h ago</span>
            </div>
          </div>
          
        </div>
      </div>
    </AnimatedPage>
  );
};
