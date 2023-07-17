import { Component } from '@angular/core';
import {WebsocketComponent} from "../websocket/websocket.component";
import {AppService} from "../app.service";
import {WebsocketService} from "../websocket/websocket.service";
import {AppGeneratorService} from "./app-generator.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";

@Component({
  selector: 'app-app-generator',
  templateUrl: './app-generator.component.html',
  styleUrls: ['./app-generator.component.scss']
})
export class AppGeneratorComponent extends WebsocketComponent{

  constructor(app: AppService, websocket: WebsocketService, textToSpeech: TextToSpeechService, public generator: AppGeneratorService) {
    super(app, websocket, textToSpeech);
    this.generator.init(app, websocket);
  }

}
