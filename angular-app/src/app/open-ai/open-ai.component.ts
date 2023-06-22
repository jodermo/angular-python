import {Component} from '@angular/core';
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

  systemConfig = false;


  constructor(app: AppService, public openAi: OpenAiService) {
    super(app);
    openAi.init(app);
  }


  onSpeechRecognitionResult(result?: SpeechRecognitionResponse, submit = false) {
    if (result && result.text && result.text.length) {
      this.openAi.newMessage.content = result.text;
      if(submit){
        this.openAi.submitRequest();
      }
    }
  }


  setValue(content: string, text: string) {

    text ? content = text : content = content;
  }
}
