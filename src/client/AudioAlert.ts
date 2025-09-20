/**
 * AudioAlert utility for playing alert sounds in the game
 */
export class AudioAlert {
  private static audioContext: AudioContext | null = null;
  private static enabled = true;

  /**
   * Initialize the audio context if not already done
   */
  private static getAudioContext(): AudioContext | null {
    if (!this.audioContext && typeof AudioContext !== "undefined") {
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        console.warn("AudioContext not supported:", e);
        return null;
      }
    }
    return this.audioContext;
  }

  /**
   * Enable or disable audio alerts
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if audio alerts are enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Play a default alert sound using Web Audio API
   * Creates a simple beep sound if no audio files are available
   */
  static playDefaultAlert(): void {
    if (!this.enabled) return;

    const context = this.getAudioContext();
    if (!context) return;

    try {
      // Resume context if it's in suspended state (Chrome autoplay policy)
      if (context.state === "suspended") {
        context.resume();
      }

      // Create a simple beep sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Set frequency for alert tone (800Hz)
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.type = "sine";

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.3,
      );

      // Play for 300ms
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (e) {
      console.warn("Failed to play audio alert:", e);
    }
  }

  /**
   * Play an urgent alert sound (higher pitch, longer duration)
   */
  static playUrgentAlert(): void {
    if (!this.enabled) return;

    const context = this.getAudioContext();
    if (!context) return;

    try {
      // Resume context if it's in suspended state
      if (context.state === "suspended") {
        context.resume();
      }

      // Create two oscillators for a more urgent sound
      const oscillator1 = context.createOscillator();
      const oscillator2 = context.createOscillator();
      const gainNode = context.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(context.destination);

      // Set frequencies for a more urgent tone
      oscillator1.frequency.setValueAtTime(1000, context.currentTime);
      oscillator2.frequency.setValueAtTime(1200, context.currentTime);
      oscillator1.type = "sine";
      oscillator2.type = "sine";

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.5,
      );

      // Play for 500ms
      oscillator1.start(context.currentTime);
      oscillator2.start(context.currentTime);
      oscillator1.stop(context.currentTime + 0.5);
      oscillator2.stop(context.currentTime + 0.5);
    } catch (e) {
      console.warn("Failed to play urgent audio alert:", e);
    }
  }
}
