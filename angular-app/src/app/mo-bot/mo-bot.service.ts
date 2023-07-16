import {Injectable} from '@angular/core';
import {AppService} from "../app.service";
import {OpenAiResponse, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";
import {WebcamService} from "../webcam/webcam.service";
import {WebsocketService} from "../websocket/websocket.service";
import {SpeechRecognitionService} from "../speech-recognition/speech-recognition.service";

@Injectable({
  providedIn: 'root'
})
export class MoBotService {
  started = false;

  app?: AppService;
  openAi?: OpenAiService;
  textToSpeech?: TextToSpeechService;
  webcam?: WebcamService;
  websocket?: WebsocketService;
  speechRecognition?: SpeechRecognitionService;
  cameraVideo?: HTMLVideoElement;

  init(app = this.app, openAi = this.openAi, textToSpeech = this.textToSpeech, webcam = this.webcam, websocket = this.websocket, speechRecognition = this.speechRecognition) {
    this.app = app ? app : this.app;

    this.openAi = openAi ? openAi : this.openAi;
    this.openAi?.init(app);

    this.textToSpeech = textToSpeech ? textToSpeech : this.textToSpeech;
    this.textToSpeech?.init(app);

    this.webcam = webcam ? webcam : this.webcam;
    this.webcam?.init(app);

    this.websocket = websocket ? websocket : this.websocket;
    this.websocket?.init(app);

    this.speechRecognition = speechRecognition ? speechRecognition : this.speechRecognition;
    this.speechRecognition?.init(app, websocket);



    this.stop();
  }

  start() {
    console.log('start');
    if (this.speechRecognition) {
      this.speechRecognition.onDetectWords([
        'stop bot',
        'alert',
        'hintergrund blau',
        'hintergrund rot',
        'hintergrund weiß'
      ], (words?: string[], text?: string) => {
        console.log('!!!!!onDetectWords', words);
        if(words?.includes('stop bot')){
          this.stop();
        }
        if(words?.includes('alert')){
          const textAlert = text ? text.split('alert') : '';
          alert((textAlert.length ? textAlert[textAlert.length-1]: 'This is an alert!'));
        }
        if(words?.includes('hintergrund blau')){
          document.body.style.backgroundColor = 'blue';
          document.body.style.color = 'white';
          console.log('hintergrund blau');
        }
        if(words?.includes('hintergrund rot')){
          document.body.style.backgroundColor = 'red';
          document.body.style.color = 'white';
          console.log('hintergrund rot');
        }
        if(words?.includes('hintergrund weiß')){
          document.body.style.backgroundColor = 'white';
          document.body.style.color = 'black';
          console.log('hintergrund white');
        }
      });
      this.speechRecognition.startRecognition();

    }
    this.started = true;
  }


  stop() {
    this.stopWebcam();
    this.started = false;
    if (this.speechRecognition) {
      this.speechRecognition.stopRecording();
      this.speechRecognition.results = [];
    }

  }

  startWebcam(cameraVideo = this.cameraVideo) {
    this.setCameraVideo(cameraVideo);
    if (this.webcam) {
      console.log('startWebcam', this.cameraVideo);
      this.webcam.start(this.cameraVideo);
    }
  }

  stopWebcam() {

    if (this.webcam) {
      this.webcam.stop();
    }

  }

  setCameraVideo(nativeElement?: HTMLVideoElement) {
    console.log('setCameraVideo', nativeElement);
    this.cameraVideo = nativeElement ? nativeElement : this.cameraVideo;
    if (this.webcam && this.cameraVideo) {
      this.webcam.video = this.cameraVideo;
    }
  }
}
