import { Component, OnInit } from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {OpenAiService} from "./open-ai.service";
import {SpeechRecognitionResponse} from "../speech-recognition/speech-recognition.service";

@Component({
  selector: 'app-open-ai',
  templateUrl: './open-ai.component.html',
  styleUrls: ['./open-ai.component.scss']
})
export class OpenAiComponent extends AppComponent {



  constructor(app: AppService, public openAi: OpenAiService) {
    super(app);
    openAi.init(app);
  }


  onSpeechRecognitionResult(result?: SpeechRecognitionResponse) {
    if(result && result.text && result.text.length){
      this.openAi.text = result.text;
      this.openAi.sendRequest();
    }
  }
}
