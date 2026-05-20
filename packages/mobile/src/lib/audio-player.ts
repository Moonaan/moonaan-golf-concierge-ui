import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export class AudioPlayer {
  private queue: string[] = []; // base64 PCM chunks
  private isPlaying = false;
  private currentSound: Audio.Sound | null = null;
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

  // Stop playback immediately (for barge-in)
  async interrupt(): Promise<void> {
    this.queue = [];
    this.isPlaying = false;
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch {
        // best-effort cleanup; ignore stop/unload errors
      }
      this.currentSound = null;
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
      // Write base64 audio to a temp file
      const tempFile = `${FileSystem.cacheDirectory}audio_${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(tempFile, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync({ uri: tempFile });
      this.currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          FileSystem.deleteAsync(tempFile, { idempotent: true }).catch(() => {});
          this.currentSound = null;
          this.playNext();
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.error('Error playing audio chunk:', err);
      this.currentSound = null;
      // Continue with next chunk
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
