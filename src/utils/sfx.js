// 8-bit Audio Synthesis for the Music Pet
let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playMeow = (enabled) => {
  if (!enabled) return;
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle';
  // Meow frequency envelope: starts high, drops, then drops more
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.4);

  // Volume envelope: soft attack, decay
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};

export const playPurr = (enabled) => {
  if (!enabled) return;
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'square';
  // Low rumbly frequency
  osc.frequency.setValueAtTime(40, audioCtx.currentTime);
  
  // Create a tremolo effect for the purr by modulating the gain
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 15; // 15 purrs per second
  
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.05;
  
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);

  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2); // 2 second purr

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  lfo.start();
  
  osc.stop(audioCtx.currentTime + 2);
  lfo.stop(audioCtx.currentTime + 2);
};
