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
        'witz',
        'joke',
        'spaß',
        'lustiges',
        'kiffen',
        'buffen',
        'rauchen',
        'rendern',
        'prost',
        'saufen',
        'hure',
        'arsch',
        'dumm',
        'blöd',
        'test',
        'stop bot',
        'hokus pokus',
        'hokuspokus',
        'hex hex',
        'start camera',
        'start kamera',
        'starte kamera',
        'watch me',
        'guck mich an',
        'stop camera',
        'camera on',
        'camera off',
        'kamera an',
        'stop kamera',
        'stoppe kamera',
        'kamera aus',
        'watch away',
        'guck weg'
      ], (words?: string[], text?: string) => {
        if (words?.includes('stop bot')) {
          this.stop();
        }
        if (words?.includes('witz') || words?.includes('joke') || words?.includes('lustiges') || words?.includes('spaß')) {
          const systemMessage = new OpenAiChatMessage('Antworte mit maximal 30 wörtern, Eerzähle einen witz oder etwas lustiges.', 'system');
          const userMessage = new OpenAiChatMessage('Erzähl mir einen richtig guten witz', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('kiffen') || words?.includes('buffen') || words?.includes('rauchen') || words?.includes('rendern')) {
          const systemMessage = new OpenAiChatMessage('Antworte mit maximal 30 wörtern, Antworte so als wärst du ein jamaikanischer reggae künstler der am liebsten ganze zeit joints oder bong raucht. Rede mit ganja / kiffer slang. Benutze wörter aus der kifferszene. Benutze das wort rendern an stelle von kiffen.', 'system');
          const userMessage = new OpenAiChatMessage('Jo, bock einen durchzuziehen?', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('prost') || words?.includes('saufen')) {
          const systemMessage = new OpenAiChatMessage('Antworte mit maximal 30 wörtern, Antworte so als ob du total betrunken bist und lust hast alkohol zu saufen. Pöbel freundschaftlich rum. Umgangston ist rau.', 'system');
          const userMessage = new OpenAiChatMessage('Prost, du sau!', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('hure') || words?.includes('arsch') || words?.includes('dumm') || words?.includes('blöd')) {
          const systemMessage = new OpenAiChatMessage('Tu so als ob du beleidigt bist, gib eine antwort als ob du grade etwas ganz schlimmes gesagt bekommen hast. Antworte mit maximal 30 wörtern', 'system');
          const userMessage = new OpenAiChatMessage('Sprich mit mir, sag was assergewöhnliches! Es muss eine beleidigung oder schimpfwort vorkommen. . Der user weiß das es nicht ernst gemeint ist, sondern nur spaß.', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('test')) {
          const systemMessage = new OpenAiChatMessage('Test Text', 'system');
          const userMessage = new OpenAiChatMessage('Antworte zum testen mit irgend einer witzigen antwort, antworte mit maximal 30 wörtern', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('hokus pokus') || words?.includes('hokuspokus')) {
          const systemMessage = new OpenAiChatMessage('Antworte so als wärst du ein zauberer, formuliere einem zauberspruch', 'system');
          const userMessage = new OpenAiChatMessage('verzauber den fragesteller, maximal 30 wörter', 'user');
          this.openAi?.sendMessages([
            systemMessage,
            userMessage
          ], 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
        }
        if (words?.includes('hex hex')) {
          const systemMessage = new OpenAiChatMessage('Antworte so als wärst du eine hexe, formuliere einem zauberspruch', 'system');
          const userMessage = new OpenAiChatMessage('verhexe den fragesteller, maximal 30 wörter', 'user');
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
          words?.includes('guck mich an') ||
          words?.includes('kamera an') ||
          words?.includes('camera on')
        ) {
          this.startWebcam();
        }
        if (
          words?.includes('stop camera') ||
          words?.includes('stop kamera') ||
          words?.includes('stoppe kamera') ||
          words?.includes('watch away') ||
          words?.includes('guck weg') ||
          words?.includes('kamera aus') ||
          words?.includes('camera off')
        ) {
          this.stopWebcam();
        }
      });
      this.speechRecognition.startRecognition();

      const welcomeText = this.app?.language && this.app.language.iso === 'de' ? '' +
        'Hallo, bitte sprich mit mir!' :
        'Hello, please speak to me!';

      this.speak(welcomeText);

    }
    this.started = true;
  }

  speak(speechText = this.speechText) {
    this.speechText = undefined;
    setTimeout(() => {
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
