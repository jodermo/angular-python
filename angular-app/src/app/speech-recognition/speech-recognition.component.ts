import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {AppService} from '../app.service';
import {SpeechRecognitionResponse, SpeechRecognitionService} from './speech-recognition.service';
import {WebsocketComponent} from "../websocket/websocket.component";
import {WebsocketService} from "../websocket/websocket.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";

@Component({
  selector: 'app-speech-recognition',
  templateUrl: './speech-recognition.component.html',
  styleUrls: ['./speech-recognition.component.scss']
})
export class SpeechRecognitionComponent extends WebsocketComponent {



  @Output() onResult = new EventEmitter<SpeechRecognitionResponse | undefined>();

  constructor(app: AppService, websocket: WebsocketService, textToSpeech: TextToSpeechService, public speechRecognition: SpeechRecognitionService) {
    super(app, websocket, textToSpeech);
    speechRecognition.init(app, websocket);
    speechRecognition.onResult((result?: SpeechRecognitionResponse)=>{
      this.onGetResult(result)
    });
  }


  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Start recording when the mouse button is pressed
    //  this.speechRecognition.startRecording();
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    // Stop recording when the mouse button is released
    // this.speechRecognition.stopRecording();
  }


  private onGetResult(result?: SpeechRecognitionResponse) {
    this.onResult.emit(result);
  }
}
