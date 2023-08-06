import {AfterViewInit, Component} from '@angular/core';
import {OpenAiComponent} from "../open-ai/open-ai.component";
import {AppService} from "../app.service";
import {OpenAiResponse, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";
import {WebcamService} from "../webcam/webcam.service";
import {MoBotService} from "./mo-bot.service";
import {SpeechRecognitionService} from "../speech-recognition/speech-recognition.service";
import {WebsocketService} from "../websocket/websocket.service";

@Component({
  selector: 'app-mo-bot',
  templateUrl: './mo-bot.component.html',
  styleUrls: ['./mo-bot.component.scss']
})
export class MoBotComponent extends OpenAiComponent implements AfterViewInit{



  openAiResult?: OpenAiResponse;
  extended = false;
  constructor(
    app: AppService,
    openAi: OpenAiService,
    public websocket: WebsocketService,
    public textToSpeech: TextToSpeechService,
    public webcam: WebcamService,
    public speechRecognition: SpeechRecognitionService,
    public bot: MoBotService
  ) {
    super(app, openAi);
    this.bot.init(app, openAi, this.textToSpeech, webcam, websocket, speechRecognition);
    this.openAi.onResult((result: OpenAiResponse)=>{
      this.bot.onOpenAiResult(result);

    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
  }





}
