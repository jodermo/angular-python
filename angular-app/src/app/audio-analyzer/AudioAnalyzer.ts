export class AudioAnalyzer {
  private analyser: AnalyserNode;
  private bufferLength: number;
  private dataArray: Uint8Array;
  private frequencyData: Uint8Array;
  private volumeData: Uint8Array;
  private updateCallback?: (frequencyData: Uint8Array, volumeData: Uint8Array) => void;
  private audioSource?: MediaElementAudioSourceNode;

  constructor(private audio: HTMLAudioElement, private audioContext = new AudioContext(), private enableAudioOutput: boolean = true) {
    this.analyser = this.audioContext.createAnalyser();
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.frequencyData = new Uint8Array(this.bufferLength);
    this.volumeData = new Uint8Array(1);

    this.audioSource = this.audioContext.createMediaElementSource(this.audio);
    this.audioSource.connect(this.analyser);
    if (this.enableAudioOutput) {
      this.audioSource.connect(this.audioContext.destination); // The audio source should also be connected to the audio context's destination
    }

    this.updateAudioData();
  }

  onUpdate(callback: (frequencyData: Uint8Array, volumeData: Uint8Array) => void) {
    this.updateCallback = callback;
  }

  private updateAudioData() {

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.volumeData[0] = this.calculateVolume();

    if (this.updateCallback) {
      this.updateCallback(this.frequencyData, this.volumeData);
    }

    requestAnimationFrame(() => this.updateAudioData());
  }

  private calculateVolume() {
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const value = this.dataArray[i] / 128 - 1;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / this.bufferLength);
    return Math.max(0, rms);
  }

  destroy() {
    this.analyser.disconnect();
    this.audio.pause();
    this.audio.src = '';
    this.audioContext.close();
  }
}
