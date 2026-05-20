export type AudioChunkCallback = (base64Pcm: string) => void;

export class AudioCapture {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isCapturing = false;
  private onChunk: AudioChunkCallback;

  constructor(onChunk: AudioChunkCallback) {
    this.onChunk = onChunk;
  }

  async start(): Promise<void> {
    if (this.isCapturing) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
    });

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // Use ScriptProcessorNode (deprecated but widely supported)
    // Buffer size of 4096 at 16kHz = ~256ms chunks
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (event) => {
      if (!this.isCapturing) return;
      const inputData = event.inputBuffer.getChannelData(0);

      // Convert float32 to int16
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Convert to base64
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      this.onChunk(base64);
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isCapturing = true;
  }

  async stop(): Promise<void> {
    this.isCapturing = false;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}
