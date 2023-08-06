import {Component, Input} from '@angular/core';
import {AppService} from "../../app.service";
import {TextToSpeechService} from "../../text-to-speech/text-to-speech.service";
import {WebcamService} from "../../webcam/webcam.service";
import {SpeechRecognitionService} from "../../speech-recognition/speech-recognition.service";
import {MoBotService} from "../mo-bot.service";
import {AppComponent} from "../../app.component";
import {OpenAiService} from "../../open-ai/open-ai.service";

@Component({
  selector: 'app-mo-bot-display',
  templateUrl: './mo-bot-display.component.html',
  styleUrls: ['./mo-bot-display.component.scss']
})
export class MoBotDisplayComponent extends AppComponent {
  @Input() layout = 'HAL-9000';

  constructor(
    app: AppService,
    public textToSpeech: TextToSpeechService,
    public webcam: WebcamService,
    public speechRecognition: SpeechRecognitionService,
    public bot: MoBotService,
    public openAi: OpenAiService,
  ) {
    super(app);
  }


  toggleSpeechRecognition() {
    if (!this.textToSpeech.audio.paused) {
      this.textToSpeech.stop();
    }
    if (this.bot.currentListenSecond) {
      this.bot.listen(this.bot.listenForSecond);
      return;
    }
    if (!this.speechRecognition.loading && !this.speechRecognition.uploading) {
      if (this.speechRecognition.recording) {
        this.speechRecognition.stopRecording()
      } else {
        this.speechRecognition.startRecording()
      }
    }
  }

  toggleCamera() {
    if (this.bot.webcamStarted) {
      this.bot.stopWebcam();
    } else {
      this.bot.startWebcam();
    }
  }
}
