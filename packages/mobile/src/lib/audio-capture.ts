import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const CHUNK_DURATION_MS = 500; // Record 500ms chunks
const SAMPLE_RATE = 16000;

export type AudioChunkCallback = (base64Pcm: string) => void;

export class AudioCapture {
  private recording: Audio.Recording | null = null;
  private isCapturing = false;
  private onChunk: AudioChunkCallback;
  private chunkTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(onChunk: AudioChunkCallback) {
    this.onChunk = onChunk;
  }

  async start(): Promise<void> {
    if (this.isCapturing) return;

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) throw new Error('Microphone permission denied');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    this.isCapturing = true;
    await this.recordChunk();
  }

  async stop(): Promise<void> {
    this.isCapturing = false;
    if (this.chunkTimer) {
      clearTimeout(this.chunkTimer);
      this.chunkTimer = null;
    }
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // best-effort cleanup; ignore stop/unload errors
      }
      this.recording = null;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  }

  private async recordChunk(): Promise<void> {
    if (!this.isCapturing) return;

    try {
      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: false,
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: SAMPLE_RATE * 16,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.LOW,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: SAMPLE_RATE * 16,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: SAMPLE_RATE * 16,
        },
      });

      this.recording = recording;

      // Wait for chunk duration, then stop and send
      this.chunkTimer = setTimeout(async () => {
        if (!this.isCapturing || !this.recording) return;

        try {
          await this.recording.stopAndUnloadAsync();
          const uri = this.recording.getURI();
          this.recording = null;

          if (uri) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            if (base64) {
              this.onChunk(base64);
            }
            // Clean up temp file
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (err) {
          console.error('Error processing audio chunk:', err);
        }

        // Start next chunk
        if (this.isCapturing) {
          this.recordChunk();
        }
      }, CHUNK_DURATION_MS);
    } catch (err) {
      console.error('Error starting audio chunk recording:', err);
      this.isCapturing = false;
    }
  }
}
