import {Component, Input, OnInit} from '@angular/core';
import {AudioAnalyzer} from "./AudioAnalyzer";

@Component({
  selector: 'app-audio-analyzer',
  templateUrl: './audio-analyzer.component.html',
  styleUrls: ['./audio-analyzer.component.scss']
})
export class AudioAnalyzerComponent implements OnInit {

  @Input() minFrequency = 0;
  @Input() maxFrequency = 400;
  @Input() audioAnalyzer?: AudioAnalyzer;
  frequencyData?: Uint8Array;
  volumeData?: Uint8Array;

  maxLevel = 255;

  constructor() {
  }

  ngOnInit() {
    if (this.audioAnalyzer) {
      this.audioAnalyzer.onUpdate((frequencyData, volumeData) => {
        this.frequencyData = frequencyData.slice(this.minFrequency, this.maxFrequency);
        this.volumeData = volumeData;
      });
    }

  }


}
