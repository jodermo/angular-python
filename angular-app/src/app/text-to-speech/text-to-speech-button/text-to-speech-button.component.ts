import {Component, Input, OnInit} from '@angular/core';
import {TextToSpeechComponent} from "../text-to-speech.component";
import {AppService} from "../../app.service";
import {TextToSpeechService} from "../text-to-speech.service";

@Component({
  selector: 'app-text-to-speech-button',
  templateUrl: './text-to-speech-button.component.html',
  styleUrls: ['./text-to-speech-button.component.scss']
})
export class TextToSpeechButtonComponent extends TextToSpeechComponent implements OnInit {
  @Input() text?: string;
  @Input() autoplay = false;
  @Input() disabled = false;

  constructor(app: AppService, textToSpeech: TextToSpeechService) {
    super(app, textToSpeech);
  }

  ngOnInit() {

    if (this.autoplay && this.text) {
      this.textToSpeech.makeFileAndPlay(this.text, this.app.language, this.textToSpeech.filename, true);
    }
  }
}
