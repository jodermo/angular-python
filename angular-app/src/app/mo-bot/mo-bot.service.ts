import {ElementRef, Injectable} from '@angular/core';
import {AppService} from "../app.service";
import {OpenAiChatMessage, OpenAiResponse, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";
import {WebcamService} from "../webcam/webcam.service";
import {WebsocketService} from "../websocket/websocket.service";
import {SpeechRecognitionService} from "../speech-recognition/speech-recognition.service";
import {WebcamComponent} from "../webcam/webcam.component";


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
  webcamElement?: ElementRef<WebcamComponent>;

  speechText?: string;

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
    if (this.speechRecognition) {
      this.speechRecognition.onDetectWords([
        'stop bot',
        'alert',
        'hintergrund blau',
        'hintergrund rot',
        'hintergrund weiß',
        'hokus pokus',
        'hokuspokus',
        'hex hex',
        'start camera',
        'start kamera',
        'starte kamera',
        'watch me',
        'guck mich an',
        'stop camera',
        'stop kamera',
        'stoppe kamera',
        'watch away',
        'guck weg'
      ], (words?: string[], text?: string) => {
        if (words?.includes('stop bot')) {
          this.stop();
        }
        if (words?.includes('alert')) {
          const textAlert = text ? text.split('alert') : '';
          alert((textAlert.length ? textAlert[textAlert.length - 1] : 'This is an alert!'));
        }
        if (words?.includes('hintergrund blau')) {
          document.body.style.backgroundColor = 'blue';
          document.body.style.color = 'white';
        }
        if (words?.includes('hintergrund rot')) {
          document.body.style.backgroundColor = 'red';
          document.body.style.color = 'white';
        }
        if (words?.includes('hintergrund weiß')) {
          document.body.style.backgroundColor = 'white';
          document.body.style.color = 'black';
        }
        if (words?.includes('hokus pokus') || words?.includes('hokuspokus')) {
          const systemMessage = new OpenAiChatMessage('Antworte so als wäre alles verzaubert', 'system');
          const userMessage = new OpenAiChatMessage('Lass dir etwas einfallen zum Thema zaubern', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('hex hex')) {
          const systemMessage = new OpenAiChatMessage('Antworte so als wäre alles verhäxt', 'system');
          const userMessage = new OpenAiChatMessage('Lass dir etwas einfallen zum Thema hexen', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (
          words?.includes('start camera') ||
          words?.includes('start kamera') ||
          words?.includes('starte kamera') ||
          words?.includes('watch me') ||
          words?.includes('guck mich an')
        ) {
          this.startWebcam();
        }
        if (
          words?.includes('stop camera') ||
          words?.includes('stop kamera') ||
          words?.includes('stoppe kamera') ||
          words?.includes('watch away') ||
          words?.includes('guck weg')
        ) {
          this.stopWebcam();
        }
      });
      this.speechRecognition.startRecognition();
      this.speak('Hello! I am MoBot');

    }
    this.started = true;
  }

  speak(speechText = this.speechText){
    this.speechText = undefined;
    setTimeout(()=>{
      this.speechText = speechText;
    }, 0);
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
      this.webcam.start(this.cameraVideo);
    }
  }

  stopWebcam() {

    if (this.webcam) {
      this.webcam.stop();
    }

  }

  setCameraVideo(nativeElement?: HTMLVideoElement) {
    this.cameraVideo = nativeElement ? nativeElement : this.cameraVideo;
    if (this.webcam && this.cameraVideo) {
      this.webcam.video = this.cameraVideo;
    }
  }
}
