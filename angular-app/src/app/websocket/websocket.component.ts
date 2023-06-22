import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { AppService } from '../app.service';
import { WebsocketService } from './websocket.service';
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";

@Component({
  selector: 'app-websocket',
  templateUrl: './websocket.component.html',
  styleUrls: ['./websocket.component.scss']
})
export class WebsocketComponent extends AppComponent {
  autoReadMessages = false;


  constructor(app: AppService, public websocket: WebsocketService, public textToSpeech: TextToSpeechService) {
    super(app);
    websocket.init(app);
    websocket.startMessageListener();
    textToSpeech.init(app);
  }


}
