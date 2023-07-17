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
  @ViewChild('webcamElement', {static: false}) webcamElement?: ElementRef<WebcamComponent>;



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
      this.loadResults();
      if(result.response.choices?.length){
        let openAiResponseText = '';
        for(const choice of result.response.choices){
          if(openAiResponseText.length){
            openAiResponseText += ' \n';
          }
          openAiResponseText += choice.message.content;
        }
        this.bot.speak(openAiResponseText);
      }
    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.loadResults();
    this.bot.webcamElement = this.webcamElement;
  }


  startBot() {
    this.bot.start();
    this.loadResults();
  }

  loadResults(){
    this.openAiResult = this.openAi.results?.length ? this.openAi.results[this.openAi.results.length - 1] : undefined;
  }


}
