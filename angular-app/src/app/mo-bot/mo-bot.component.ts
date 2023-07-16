import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OpenAiComponent} from "../open-ai/open-ai.component";
import {AppService} from "../app.service";
import {OpenAiResponse, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";
import {WebcamService} from "../webcam/webcam.service";
import {MoBotService} from "./mo-bot.service";
import {SpeechRecognitionService} from "../speech-recognition/speech-recognition.service";
import {WebsocketService} from "../websocket/websocket.service";
import {WebcamComponent} from "../webcam/webcam.component";

@Component({
  selector: 'app-mo-bot',
  templateUrl: './mo-bot.component.html',
  styleUrls: ['./mo-bot.component.scss']
})
export class MoBotComponent extends OpenAiComponent implements AfterViewInit{
  @ViewChild('audioElement', {static: false}) audioElement?: ElementRef<HTMLElement>;
  @ViewChild('webcamElement', {static: false}) webcamElement?: ElementRef<WebcamComponent>;
  @ViewChild('video', { static: true }) videoElement?: ElementRef;
  openAiResult?: OpenAiResponse;
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
      this.loadResults();
      console.log('onResult', result);
    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.loadResults();

  }


  startBot() {
    this.bot.start();
    this.loadResults();
  }

  loadResults(){
    this.openAiResult = this.openAi.results?.length ? this.openAi.results[this.openAi.results.length - 1] : undefined;
  }


}
