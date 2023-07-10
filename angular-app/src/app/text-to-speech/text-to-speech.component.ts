import {Component} from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {TextToSpeechService} from "./text-to-speech.service";

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.scss']
})
export class TextToSpeechComponent extends  AppComponent{

  constructor(app: AppService, public textToSpeech: TextToSpeechService) {
    super(app);
    textToSpeech.init(app);
  }



}
