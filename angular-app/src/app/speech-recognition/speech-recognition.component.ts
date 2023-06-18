import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {AppComponent} from '../app.component';
import {AppService} from '../app.service';
import {SpeechRecognitionResponse, SpeechRecognitionService} from './speech-recognition.service';

@Component({
  selector: 'app-speech-recognition',
  templateUrl: './speech-recognition.component.html',
  styleUrls: ['./speech-recognition.component.scss']
})
export class SpeechRecognitionComponent extends AppComponent {



  @Output() onResult = new EventEmitter<SpeechRecognitionResponse | undefined>();

  constructor(app: AppService, public speechRecognition: SpeechRecognitionService) {
    super(app);
    speechRecognition.init(app);
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
