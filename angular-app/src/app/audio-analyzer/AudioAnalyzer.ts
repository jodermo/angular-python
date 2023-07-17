export class AudioAnalyzer {
  private analyser?: AnalyserNode;
  private bufferLength?: number;
  private dataArray?: Uint8Array;
  private frequencyData?: Uint8Array;
  private volumeData?: Uint8Array;
  private updateCallback?: (frequencyData: Uint8Array, volumeData: Uint8Array) => void;
  private audioSource?: MediaElementAudioSourceNode;

  constructor(private audio: HTMLAudioElement, private audioContext = new AudioContext(), private enableAudioOutput: boolean = true) {

    try {
      this.audioSource = this.audioContext.createMediaElementSource(this.audio);
      this.analyser = this.audioContext.createAnalyser();
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.frequencyData = new Uint8Array(this.bufferLength);
      this.volumeData = new Uint8Array(1);
      this.audioSource.connect(this.analyser);
      if (this.enableAudioOutput) {
        this.audioSource.connect(this.audioContext.destination); // The audio source should also be connected to the audio context's destination
      }
      this.updateAudioData();
    } catch (e) {
      console.log('AudioAnalyzer error', e);

    }


    return this;
  }

  frequencyColor(frequencyData = this.frequencyData) {
    if (!frequencyData) return 'rgba(0, 0, 0, 1)'; // Default color when no frequency data is available
    const intensity = this.calculateIntensity(frequencyData);
    const color = this.mapIntensityToColor(intensity);
    return `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
  }

  calculateIntensity(frequencyData: Uint8Array) {
    const averageIntensity = Array.from(frequencyData).reduce((sum, value) => sum + value, 0) / frequencyData.length;
    return averageIntensity / 255; // Normalize intensity to a range between 0 and 1
  }

  mapIntensityToColor(intensity: number) {
    // Define the color range based on intensity
    const colorRange = [
      { intensity: 0, color: { r: 0, g: 0, b: 0 } },        // Black (low intensity)
      { intensity: 0.5, color: { r: 255, g: 0, b: 0 } },    // Red (medium intensity)
      { intensity: 1, color: { r: 255, g: 255, b: 0 } },    // Yellow (high intensity)
    ];

    // Find the color in the range that matches the intensity
    for (let i = 0; i < colorRange.length - 1; i++) {
      const currColor = colorRange[i];
      const nextColor = colorRange[i + 1];
      if (intensity >= currColor.intensity && intensity <= nextColor.intensity) {
        const t = (intensity - currColor.intensity) / (nextColor.intensity - currColor.intensity);
        return this.interpolateColor(currColor.color, nextColor.color, t);
      }
    }

    // Return black as the default color if no match is found
    return { r: 0, g: 0, b: 0 };
  }

  interpolateColor(color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }, t: number) {
    const r = Math.round(color1.r + (color2.r - color1.r) * t);
    const g = Math.round(color1.g + (color2.g - color1.g) * t);
    const b = Math.round(color1.b + (color2.b - color1.b) * t);
    return { r, g, b };
  }

  onUpdate(callback: (frequencyData: Uint8Array, volumeData: Uint8Array) => void) {
    this.updateCallback = callback;
  }

  private updateAudioData() {
    if (this.frequencyData && this.dataArray && this.volumeData) {
      this.analyser?.getByteFrequencyData(this.frequencyData);
      this.analyser?.getByteTimeDomainData(this.dataArray);
      this.volumeData[0] = this.calculateVolume();
      if (this.updateCallback) {
        this.updateCallback(this.frequencyData, this.volumeData);
      }
    }

    requestAnimationFrame(() => this.updateAudioData());
  }

  private calculateVolume() {
    let sum = 0;
    if (this.dataArray && this.bufferLength) {
      for (let i = 0; i < this.bufferLength; i++) {
        const value = this.dataArray[i] / 128 - 1;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / this.bufferLength);
      return Math.max(0, rms);
    }
    return 0;
  }

  destroy() {
    this.analyser?.disconnect();
    this.audio.pause();
    this.audio.src = '';
    this.audioContext.close();
  }
}
