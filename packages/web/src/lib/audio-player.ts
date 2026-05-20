export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private queue: string[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private _isSpeaking = false;
  private onSpeakingChange?: (speaking: boolean) => void;

  constructor(onSpeakingChange?: (speaking: boolean) => void) {
    this.onSpeakingChange = onSpeakingChange;
  }

  get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  enqueue(base64Audio: string): void {
    this.queue.push(base64Audio);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  async interrupt(): Promise<void> {
    this.queue = [];
    this.isPlaying = false;
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // best-effort cleanup; ignore stop errors
      }
      this.currentSource = null;
    }
    this.setSpeaking(false);
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.setSpeaking(false);
      return;
    }

    this.isPlaying = true;
    this.setSpeaking(true);
    const base64 = this.queue.shift()!;

    try {
      if (!this.audioContext) {
        // Nova Sonic output is 24kHz
        this.audioContext = new AudioContext({ sampleRate: 24000 });
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Decode base64 to Int16 PCM
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);

      // Convert Int16 to Float32 for Web Audio
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 0x8000;
      }

      // Create audio buffer and play
      const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      this.currentSource = source;

      source.onended = () => {
        this.currentSource = null;
        this.playNext();
      };

      source.start();
    } catch (err) {
      console.error('Error playing audio chunk:', err);
      this.currentSource = null;
      this.playNext();
    }
  }

  private setSpeaking(speaking: boolean): void {
    if (this._isSpeaking !== speaking) {
      this._isSpeaking = speaking;
      this.onSpeakingChange?.(speaking);
    }
  }
}
