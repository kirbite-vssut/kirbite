// Web Audio API Synthesizer for instant order chime notifications without any external mp3 files
export const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Pleasant double ding chime
    playTone(587.33, now, 0.25); // D5
    playTone(880.00, now + 0.15, 0.4); // A5
    playTone(1174.66, now + 0.35, 0.5); // D6
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
};
