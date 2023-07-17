import {Component, Input} from '@angular/core';
import {MoBotComponent} from "../mo-bot.component";
import {AppService} from "../../app.service";
import {OpenAiService} from "../../open-ai/open-ai.service";
import {WebsocketService} from "../../websocket/websocket.service";
import {TextToSpeechService} from "../../text-to-speech/text-to-speech.service";
import {WebcamService} from "../../webcam/webcam.service";
import {SpeechRecognitionService} from "../../speech-recognition/speech-recognition.service";
import {MoBotService} from "../mo-bot.service";

@Component({
  selector: 'app-mo-bot-display',
  templateUrl: './mo-bot-display.component.html',
  styleUrls: ['./mo-bot-display.component.scss']
})
export class MoBotDisplayComponent extends MoBotComponent {
  @Input() layout = 'HAL-9000';

  constructor(
    app: AppService,
    openAi: OpenAiService,
    websocket: WebsocketService,
    textToSpeech: TextToSpeechService,
    webcam: WebcamService,
    speechRecognition: SpeechRecognitionService,
    bot: MoBotService
  ) {
    super(app, openAi, websocket, textToSpeech, webcam, speechRecognition, bot);
  }


  toggleSpeechRecognition() {
    if(!this.textToSpeech.audio.paused){
      this.textToSpeech.stop();
      return;
    }
    if(!this.speechRecognition.loading && !this.speechRecognition.uploading){
      if(this.speechRecognition.recording){
        this.speechRecognition.stopRecording()
      }else{
        this.speechRecognition.startRecording()
      }
    }
  }
}
