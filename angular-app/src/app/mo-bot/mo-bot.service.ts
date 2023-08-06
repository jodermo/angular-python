import {ElementRef, Injectable} from '@angular/core';
import {AppService} from "../app.service";
import {OpenAiResponse, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";
import {WebcamService} from "../webcam/webcam.service";
import {WebsocketService} from "../websocket/websocket.service";
import {SpeechRecognitionService, SpeechRecognitionSetting} from "../speech-recognition/speech-recognition.service";
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

  settings: SpeechRecognitionSetting[] = [];
  currentSetting?: SpeechRecognitionSetting;

  dataLoading = false;
  newSetting?: SpeechRecognitionSetting;


  functions: SpeechRecognitionSetting[] = [
    {
      alias: 'stop', words: ['stop bot'],
      description: 'Stops MoBot',
      callback: () => {
        this.stop();
      }
    },
    {
      alias: 'start camera', words: ['camera on', 'kamera an'],
      description: 'Starting the camera',
      callback: () => {
        this.startWebcam();
      }
    },
    {
      alias: 'stop camera', words: ['camera off', 'kamera aus'],
      description: 'Stops the camera',
      callback: () => {
        this.stopWebcam();
      }
    },
    {
      alias: 'listen', words: ['listen to me', 'hör mir zu'],
      description: 'Listenig for 5 seconds',
      callback: () => {
        this.listen(5);
      }
    },
    {
      alias: 'listen longer', words: ['listen to me longer', 'hör mir länger zu'],
      description: 'Listenig for 5 seconds',
      callback: () => {
        this.listen(10);
      }
    },
  ];
  webcamStarted = false;
  defaultListenSeconds = 5;
  currentListenSecond = 0;
  listenForSecond = 0;
  private listenTimeout?: any;
  assistantText: string = '';


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
    this.speechRecognition?.init(app, websocket, openAi);

    this.loadData();

  }


  loadData() {
    if (this.app) {
      this.dataLoading = true;
      this.app.API.get('bot-settings', (settings: SpeechRecognitionSetting[]) => {
        this.settings = settings?.length ? settings : this.settings;
        this.settings = this.settings.sort((a: SpeechRecognitionSetting, b: SpeechRecognitionSetting)=>(a.id || 0) - (b.id || 0));
        this.newSetting = undefined;
        this.currentSetting = undefined;
        this.dataLoading = false;
      });
    }
  }

  createNewSetting(alias?: string) {
    this.newSetting = {alias, maxAnswerWords: 30} as SpeechRecognitionSetting;
  }

  addOrUpdateSetting(setting = this.newSetting) {
    if (this.app && setting && setting.alias) {
      this.dataLoading = true;
      if (setting?.id) {
        this.app.API.update('bot-settings', setting, (setting?: SpeechRecognitionSetting) => {
          this.loadData();
          this.dataLoading = false;
        }, (error?: any) => {
          this.dataLoading = false;
        });
      } else {
        this.app.API.add('bot-settings', setting, (setting?: SpeechRecognitionSetting) => {
          this.loadData();
          this.dataLoading = false;
        }, (error?: any) => {
          this.dataLoading = false;
        });
      }

    }
  }

  start() {
    let data = this.functions;
    if (this.settings?.length) {
      data = data.concat(this.settings);
    }
    if (this.speechRecognition && data.length) {
      this.speechRecognition.onDetectSettings(data);
      this.speechRecognition.startRecognition();
    }
    setTimeout(() => {
      this.welcomeMessage();
    }, 250);

  }

  welcomeMessage() {
    const welcomeText = this.app?.language && this.app.language.iso === 'de' ? '' +
      'Hallo, bitte sprich mit mir!' :
      'Hello, please speak to me!';

    this.speak(welcomeText);
    this.started = true;
  }

  listen(forSeconds = this.defaultListenSeconds) {
    this.currentListenSecond = forSeconds;
    this.listenForSecond = forSeconds;
    if (this.listenTimeout) {
      clearTimeout(this.listenTimeout);
    }
    console.log('listen', forSeconds);
    if (forSeconds > 0) {
      if (this.speechRecognition) {
        if (!this.speechRecognition.loading && !this.speechRecognition.uploading && !this.speechRecognition.recording) {
          this.speechRecognition.startRecording(this.app?.language);
        }
      }
      this.listenTimeout = setTimeout(() => {
        this.listen(forSeconds - 1);
      }, 1000);
    } else {
      if (this.speechRecognition) {
        if (this.speechRecognition.recording) {
          this.speechRecognition.stopRecording();
        }
      }
    }
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
    this.assistantText = '';
  }

  startWebcam() {
    this.setCameraVideo(this.cameraVideo);
    if (this.webcam) {
      this.webcamStarted = true;
      setTimeout(() => {
        this.webcam?.start(this.cameraVideo, this.webcam.outputVideo, true, () => {
          this.webcamStarted = true;
          this.webcam?.startRecognition();
        }, () => {
          this.webcamStarted = false;
        });
      }, 0);
    }
  }

  stopWebcam() {
    if (this.webcam) {
      this.webcam.stop();
      this.webcamStarted = false;
    }
  }

  setCameraVideo(nativeElement?: HTMLVideoElement) {
    this.cameraVideo = nativeElement ? nativeElement : this.cameraVideo;
    if (this.webcam && this.cameraVideo) {
      this.webcam.video = this.cameraVideo;
    }
  }

  closeCurrentSetting(event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    this.currentSetting = undefined;
  }

  deleteSetting(setting: SpeechRecognitionSetting, event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.app && setting?.id) {
      this.app.API.delete('bot-settings', setting, () => {
        this.loadData();
      }, (error?: any) => {
        this.dataLoading = false;
        this.newSetting = undefined;
      });
    }
  }

  triggerSetting(setting: SpeechRecognitionSetting, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.speechRecognition) {
      this.speechRecognition.assistantText = this.assistantText;
      this.speechRecognition.triggerSetting(setting, setting.words);
    }
  }

  onOpenAiResult(result: OpenAiResponse) {
    const settings = this.settings.filter(setting => setting.words.find(word => result.messages?.find(message => message.content && message.content.toLowerCase() === word.toLowerCase())));
    const addAnswerToAssistant = settings.find(setting => setting.task && setting.task.addAnswerToAssistant) !== undefined;
    if (addAnswerToAssistant && result.messages) {
      for (const setting of settings) {
        if (setting.task && setting.task.addAnswerToAssistant) {
          for (const message of result.messages) {
            this.assistantText += message.role + ': ' + message.content + '\n';
          }
        }
      }
    }
    if (result.response.choices?.length) {
      let openAiResponseText = '';
      for (const choice of result.response.choices) {
        if (openAiResponseText.length) {
          openAiResponseText += ' \n';
          if (addAnswerToAssistant) {
            this.assistantText += 'assistant: ' + openAiResponseText + '\n';
          }
        }
        openAiResponseText += choice.message.content;
      }
      this.speak(openAiResponseText);
    }
    console.log('onOpenAiResult', result, settings, addAnswerToAssistant, this.assistantText);
  }
}
