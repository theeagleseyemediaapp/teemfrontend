/**
 * Synthesizes a grand, cinematic "This is CNN" style news chime and
 * reads out "The Eagle's Eye has landed!" in an authoritative anchor voice.
 */
export function playEagleHasLanded(message: string = "The Eagle's Eye has landed!") {
  try {
    if (typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      const handleInteraction = () => {
        ctx.resume();
        playEagleHasLanded(message);
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("keydown", handleInteraction, { once: true });
      return;
    }

    const now = ctx.currentTime;
    
    // 1. Cinematic low drone (bass note C3 at 130.81Hz)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = "sawtooth"; // dramatic, buzzy news sting feel
    droneOsc.frequency.setValueAtTime(130.81, now);
    
    // Low-pass filter to make it a warm rumble rather than a harsh buzz
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.4, now + 0.08);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(ctx.destination);
    
    droneOsc.start(now);
    droneOsc.stop(now + 1.25);
    
    // 2. High-pitched cascading chords (G5=783.99Hz, C6=1046.50Hz, E6=1318.51Hz)
    const playChimeNote = (freq: number, delay: number, dur: number = 0.8) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle"; // clean broadcast chime tone
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.35, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    };
    
    // Quick CNN-style major arpeggio
    playChimeNote(783.99, 0.18, 0.7); // G5
    playChimeNote(1046.50, 0.26, 0.7); // C6
    playChimeNote(1318.51, 0.34, 0.9); // E6
    
    // 3. Text to Speech (authoritative anchor voice)
    setTimeout(() => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.88; // Deliberate anchor rate
      utterance.pitch = 0.85; // Deeper voice
      utterance.volume = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find a deeper male English voice
      const voice = voices.find(v => 
        (v.name.includes("Google US English") || v.name.includes("David") || v.name.includes("Natural")) && 
        v.lang.startsWith("en")
      ) || voices.find(v => v.lang.startsWith("en"));
      
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }, 550);
  } catch (err) {
    console.warn("[playEagleHasLanded] failed:", err);
  }
}
