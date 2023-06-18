import {Component, Input, OnInit} from '@angular/core';
import {SpeechRecognitionComponent} from "../speech-recognition.component";

@Component({
  selector: 'app-speech-recognition-button',
  templateUrl: './speech-recognition-button.component.html',
  styleUrls: ['./speech-recognition-button.component.scss']
})
export class SpeechRecognitionButtonComponent extends SpeechRecognitionComponent implements OnInit {
  @Input() text?: string;
  @Input() readResult = false;
  @Input() showResults = true;
  @Input() disabled = false;

  ngOnInit() {
  }
}
