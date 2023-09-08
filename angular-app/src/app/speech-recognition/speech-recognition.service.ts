import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from '../app.service';
import {WebsocketService} from "../websocket/websocket.service";
import {OpenAiChatMessage, OpenAiService} from "../open-ai/open-ai.service";
import {TextToSpeechService} from "../text-to-speech/text-to-speech.service";

// Check if the audio format is supported
function isSupportedAudioFormat(file: File) {
  const supportedFormats = ['audio/wav', 'audio/mp3', 'audio/ogg'];
  const fileType = file.type || '';
  return supportedFormats.includes(fileType);
}

// Fetch the audio data as an ArrayBuffer
function fetchAudioData(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}


export interface SpeechRecognitionAiTask {
  system?: string;
  user?: string;
  addAnswerToAssistant?: boolean;
}


export interface SpeechRecognitionSetting {
  id?: number;
  alias: string;
  description?: string;
  words: string[];
  task?: SpeechRecognitionAiTask;
  imageDescription?: string;
  answerText?: string;
  answerImage?: string;
  maxAnswerWords?: number;
  callback?: (allWords: string[], text?: string) => void;
}

export interface SpeechRecognitionResponse {
  success: boolean;
  text?: string;
  error?: string;
  filename: string;
  path: string;
  directory: string;
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private app?: AppService;

  results: SpeechRecognitionResponse[] = [];

  recordAudio = document.createElement('audio');

  recognition: boolean = false;
  recording: boolean = false;
  selectedFile?: File;
  uploading: boolean = false;
  transcription: string | null = null;
  uploadError: string | null = null;

  mediaRecorder?: MediaRecorder;
  chunks: Blob[] = [];
  languages: AppLanguage[] = AppLanguages;
  language: AppLanguageType = AppLanguages.length ? AppLanguages[0] : {name: 'English', iso: 'en', lang: 'en-US'};
  uploadPath = 'records';
  fileName = 'audio_record';
  audioFile?: File;
  audioSrc?: string;
  audio = document.createElement('audio');
  audioReady = false;
  currentResult?: SpeechRecognitionResponse;

  loading = false;

  private resultCallbacks: ((result?: SpeechRecognitionResponse) => void)[] = [];
  private websocket?: WebsocketService;
  private websocketStarted = false;
  detectWords: SpeechRecognitionSetting[] = [];
  detectSentence?: SpeechRecognitionSetting;

  private detectWordSettings: SpeechRecognitionSetting[] = [];
  private detectSentenceSettings: SpeechRecognitionSetting[] = [];

  recognitionTimeout: any;
  recognitionInterval = 250;
  recognitionMinByteLength = 10000;
  maxRecognitionChunks = 20;
  onRecognitionIgnoreFor = 5000;
  ignoreCommands: string[] = [];

  sampleRate = 16000;
  numberOfChannels = 1;
  sampleWidth = 1;
  useDefaultValues = false;

  recognitionIndex = 0;
  recognizedIndex = 0;

  recognitionChunks: any[] = [];

  detectedWords: string[] = [];
  detectedSentences: string[] = [];
  recognitionText?: string;
  lastRecognitionText = '';
  completeRecognitionText = '';
  recognitionError?: string;
  returnToRecognition = false;
  private urlsOpened: any = {};
  private openAi?: OpenAiService;
  private textToSpeech?: TextToSpeechService;
  assistantText?: string;

  fileType = 'mp3';

  constructor() {
    this.audio.oncanplay = () => {
      if (this.audio.src) {
        this.audioReady = true;
      }
    };
    this.audio.src = '';
  }

  init(app = this.app, websocket = this.websocket, openAi = this.openAi, textToSpeech = this.textToSpeech) {
    this.app = app ? app : this.app;
    this.websocket = websocket ? websocket : this.websocket;
    this.openAi = openAi ? openAi : this.openAi;
    this.language = this.app?.language ? this.app.language : this.language;
    (this.audio as any).crossorigin = "anonymous";
    this.audio.setAttribute('crossorigin', 'anonymous');
    this.initWebsocket();
  }

  initWebsocket() {


    if (this.websocket && !this.websocketStarted) {
      if (this.app) {
        this.websocket.init(this.app);
      }
      this.websocket.joinRoom('speech-recognition');
      this.websocketStarted = true;
      this.websocket.on('speech-recognition', (data: any) => {
        console.log('speech-recognition', data, this.app?.user);
        if(!data.user || (data.user.id && this.app?.user && data.user.id === this.app.user.id)){
          this.checkDetectWords(data);
        }
      });
    }
  }

  recognizeFile(
    filename: string,
    directory: string,
    onSuccess?: (result?: SpeechRecognitionResponse) => void,
    onError?: (error?: any) => void
  ) {
    const language = (this.app && this.app.language ? this.app.language.lang : this.language ? this.language.lang : 'en-US');
    this.loading = true;
    this.app?.get(
      this.app?.API.url + '/speech-recognition?path=' + directory + '&language=' + language + '&filename=' + filename + '',
      (result?: SpeechRecognitionResponse) => {
        if (result) {
          console.log('recognizeFile result', result);
          result.time = Date.now();
          this.results.push(result);
          this.results.sort((a, b) => a.time + b.time);
          this.currentResult = result;
          for (const callback of this.resultCallbacks) {
            callback(result);
          }
        }
        if (onSuccess) {
          onSuccess(result);
        }
        this.loading = false;
      },
      (error: any) => {
        if (onError) {
          onError(error)
        }
        this.loading = false;
      }
    );
  }

  checkAndParseURLs(text: string): string[] {
    const wwwRegex = /(www\.[^\s]+\.[^\s]+)/g;
    const httpRegex = /(http?:\/\/[^\s]+\.[^\s]+)/g;
    const httpsRegex = /(https?:\/\/[^\s]+\.[^\s]+)/g;
    const tldRegex = /\.[A-Za-z]{2,}$/; // Regular expression to validate TLD
    const urls: string[] = [];

    let match;

    while ((match = wwwRegex.exec(text)) !== null) {
      let url = match[0];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      if (tldRegex.test(url)) {
        urls.push(url);
      }
    }

    while ((match = httpRegex.exec(text)) !== null) {
      const url = match[0];
      if (tldRegex.test(url)) {
        urls.push(url);
      }
    }

    while ((match = httpsRegex.exec(text)) !== null) {
      const url = match[0];
      if (tldRegex.test(url)) {
        urls.push(url);
      }
    }

    return urls;
  }

  startRecognition(language = this.language) {

    this.recognitionChunks = [];
    if (!this.recognition) {

      navigator.mediaDevices
        .getUserMedia({audio: true})
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.addEventListener('dataavailable', (e) => {
            this.chunks.push(e.data);
            this.recognitionChunks.push(e.data);
          });
          this.mediaRecorder.start();
          this.recognition = true;
          this.checkRecognitionChunks();
        })
        .catch((error) => {
          this.recognition = false;
          console.error('Error accessing microphone:', error);
        });
    }
  }

  async checkRecognitionChunks(language = this.language) {
    const lang = (this.app && this.app.language ? this.app.language.lang : this.language ? this.language.lang : 'en-US');

    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
    }
    await this.mediaRecorder?.stop();
    if (this.recognition && !this.recording && (!this.textToSpeech || this.textToSpeech.audio.paused)) {
      if (this.websocket && this.recognitionChunks.length) {

        const audioBlob = new Blob(this.recognitionChunks, {type: 'audio/' + this.fileType});
        const audioFile = new File([audioBlob], 'speech_recognition.' + this.fileType, {type: 'audio/' + this.fileType});
        // @ts-ignore
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();
        let words: string[] = [];
        this.detectWords.filter((setting: SpeechRecognitionSetting) => {
          if (setting.words) {
            words = words.concat(setting.words)
          }
          return true;
        });
        const sendAudio = (audioData: any, sampleRate: number, numberOfChannels: number, sampleWidth: number) => {
          const data = {
            audio: audioData,
            words: words,
            sentence: this.detectSentence,
            language: lang,
            sample_rate: sampleRate,
            channels: numberOfChannels,
            sample_width: sampleWidth,
            recognitionIndex: this.recognitionIndex,
            user: this.app?.user
          };
          // Send the data to the server over WebSocket

          if (this.websocket && audioData.byteLength > this.recognitionMinByteLength) {
            this.websocket.emit('audio', data);
            this.recognitionIndex++;
          }
        };

        if (isSupportedAudioFormat(audioFile)) {
          fetchAudioData(audioFile)
            .then((audioData: any) => {
              reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                if (!this.useDefaultValues) {
                  try {
                    audioCtx.decodeAudioData(arrayBuffer, (audioBuffer: AudioBuffer) => {
                      sendAudio(audioData, audioBuffer.sampleRate, audioBuffer.numberOfChannels, audioBuffer.numberOfChannels);
                    }, (error: any) => {
                      this.useDefaultValues = true;
                      this.checkRecognitionChunks(language);
                    });
                  } catch (error) {
                    this.useDefaultValues = true;
                    console.warn('You can ignore this error:', error);
                  }
                }
                if (this.useDefaultValues) {
                  sendAudio(audioData, this.sampleRate, this.numberOfChannels, this.sampleWidth);
                }

              };
              reader.readAsArrayBuffer(audioFile);
            })
            .catch((error) => {
              console.error('Error fetching audio data:', error);
            });
        } else {
          console.error('Unsupported audio format', audioFile);
        }
      }
      this.recognitionTimeout = setTimeout(() => {
        this.checkRecognitionChunks();
      }, this.recognitionInterval);
      if (this.recognitionChunks.length > this.maxRecognitionChunks) {
        this.recognitionChunks = [this.recognitionChunks[this.recognitionChunks.length - 1]];
      }
      await this.mediaRecorder?.start();
    }
  }


  private async getBase64Data(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  startRecording(language = this.language) {
    console.log('startRecording', language);
    if (!this.recording) {
      this.returnToRecognition = this.recognition;
      this.startRecognition(language);
      this.recording = true;
    }

  }

  onDetectSettings(settings: SpeechRecognitionSetting[]) {
    for (const setting of settings) {
      this.onDetectSetting(setting);
    }
  }

  onDetectSetting(setting: SpeechRecognitionSetting) {
    this.detectWords.push(setting);
    this.detectWordSettings.push(setting);
  }

  onDetectSentence(sentence: SpeechRecognitionSetting) {
    this.detectSentenceSettings.push(sentence);
  }

  playAudio() {
    console.log('playAudio', this.audioReady, this.audio.paused, this.audio);
    if (this.audioReady && this.audio.paused) {
      this.audio.play();
      console.log('playAudio', this.audioReady, this.audio.paused, this.audio);
    }
  }

  async stopRecording() {

    console.log('stopRecording', this.recognition, this.chunks.length);
    if (this.mediaRecorder && this.recognition) {
      await this.mediaRecorder?.stop();
      this.recognition = false;
      if (this.recording) {
        this.loading = true;
        setTimeout(() => {
          // wait till this.mediaRecorder is finished calculating
          const audioBlob = new Blob(this.chunks, {type: 'audio/' + this.fileType});

          this.audioFile = new File([audioBlob], 'speech_recognition.' + this.fileType, {type: 'audio/' + this.fileType});
          this.recording = false;
          this.chunks = [];
          this.recognitionChunks = [];
          this.loadAudio();
          this.uploadAudioFile();
          if (this.returnToRecognition) {
            this.startRecognition();
          }
        }, 250);


      }
    }
  }



  loadAudio(reload = true) {
    this.audioReady = false;
    if (this.audioFile) {
      this.audioSrc = URL.createObjectURL(this.audioFile);
      this.audio.oncanplay = () => {
        this.audioReady = true;
      };
      this.audio.src = '';
      this.audio.src = this.audioSrc;
      this.audio.load();
    }
  }

  _uploadAudioFile() {

    // Upload the audio file
    this.uploading = true;
    this.uploadError = null;

    if (this.audioFile) {


      this.app?.uploadFile(this.audioFile, this.uploadPath, (result?: any) => {
          // File upload success
          this.uploading = false;
          if (result?.filename) {
            this.transcribeSpeech(result.filename, result.path || this.uploadPath);
          }
          this.chunks = []; // Reset the chunks array for the next recording
        },
        (error: any) => {
          // File upload error
          this.uploading = false;
          this.uploadError = error;
        });
    } else {
      this.uploading = false;

    }

  }

  uploadAudioFile(language = this.language){
    const lang = (this.app && this.app.language ? this.app.language.lang : this.language ? this.language.lang : 'en-US');
    this.uploading = true;
    this.uploadError = null;
    const audioBlob = new Blob(this.chunks, {type: 'audio/' + this.fileType});
    const audioFile = new File([audioBlob], 'audio_record.' + this.fileType, {type: 'audio/' + this.fileType});
    // @ts-ignore
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();
    const sendAudio = (audioData: any, sampleRate: number, numberOfChannels: number, sampleWidth: number) => {
      const data = {
        audio: audioData,
        language: lang,
        sample_rate: sampleRate,
        channels: numberOfChannels,
        sample_width: sampleWidth,
        recognitionIndex: this.recognitionIndex,
        recording: true
      };
      // Send the data to the server over WebSocket

      if (this.websocket && audioData.byteLength > this.recognitionMinByteLength) {
        this.websocket.emit('audio', data);
        this.recognitionIndex++;
      }
    };

    if (isSupportedAudioFormat(audioFile)) {
      fetchAudioData(audioFile)
        .then((audioData: any) => {
          reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            if (!this.useDefaultValues) {
              try {
                audioCtx.decodeAudioData(arrayBuffer, (audioBuffer: AudioBuffer) => {
                  sendAudio(audioData, audioBuffer.sampleRate, audioBuffer.numberOfChannels, audioBuffer.numberOfChannels);
                }, (error: any) => {
                  this.useDefaultValues = true;
                  this.checkRecognitionChunks(language);
                });
              } catch (error) {
                this.useDefaultValues = true;
                console.warn('You can ignore this error:', error);
              }
            }
            if (this.useDefaultValues) {
              sendAudio(audioData, this.sampleRate, this.numberOfChannels, this.sampleWidth);
            }

          };
          reader.readAsArrayBuffer(audioFile);
        })
        .catch((error) => {
          console.error('Error fetching audio data:', error);
        });
    } else {
      console.error('Unsupported audio format', audioFile);
    }
  }



  onFileSelected(event: any) {
    // Handle file selection
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.uploading = true;
      this.uploadError = null;

      this.app?.uploadFile(this.selectedFile).then(
        (result: any) => {
          // File upload success
          this.uploading = false;
          this.transcribeSpeech(result.filename, result.path);
        },
        (error: any) => {
          // File upload error
          this.uploading = false;
          this.uploadError = error;
        }
      );
    }
  }

  transcribeSpeech(filename = this.fileName, uploadPath = this.uploadPath) {
    // Call the speech recognition service to transcribe the uploaded audio file
    this.recognizeFile(
      filename,
      uploadPath || this.uploadPath,
      (response?: SpeechRecognitionResponse) => {
        if (response?.success && response.text) {
          this.transcription = response.text;
        } else {
          this.transcription = null;
        }
      },
      (error: any) => {
        console.error('Error transcribing speech:', error);
        this.transcription = null;
      }
    );
  }

  togglePause() {
    if (this.audioReady) {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  }

  pause() {
    if (this.audioReady && !this.audio.paused) {
      this.audio.pause();
    }
  }

  play() {
    if (this.audioReady && this.audio.src && this.audio.paused) {
      this.audio.play();
    }
  }

  onResult(callback: (result?: SpeechRecognitionResponse) => void) {
    this.resultCallbacks.push(callback);
  }

  playRecord(replay = false) {
    if (this.recordAudio.src) {
      if (replay) {
        this.recordAudio.currentTime = 0;
      }
      if (this.recordAudio.paused) {
        this.recordAudio.play();
      }

    }
  }

  pauseRecord(resetTime = false) {
    if (this.recordAudio.src) {
      if (resetTime) {
        this.recordAudio.currentTime = 0;
      }
      if (!this.recordAudio.paused) {
        this.recordAudio.pause();
      }
    }
  }

  private checkDetectWords(data: any) {


    console.log('checkDetectWords', data.recording, data);

    if(data.recording && data.text && this.openAi){
      this.openAi.sendMessages([new OpenAiChatMessage(data.text, 'user')])
    }

    const recognitionIndex = data.recognitionIndex || 0;

    if (recognitionIndex >= this.recognizedIndex) {

      if (data.audio_data) {
        const audioData = data.audio_data;
        const audioBlob = new Blob([audioData]);
        const audioUrl = URL.createObjectURL(audioBlob);
        this.recordAudio.src = audioUrl;
      }

      this.recognitionError = data.error ? data.error.message : undefined;
      if (!this.recognitionError) {
        this.recognitionText = data.text ? data.text : undefined;


        if (this.recognitionText) {
          const newText = this.recognitionText.toLowerCase();
          const urls = this.checkAndParseURLs(this.recognitionText);
          for (const url of urls) {
            this.openUrl(url);
          }
          // Check if the new text is a continuation of the previous recognition
          const isContinuation = newText.startsWith(this.lastRecognitionText.toLowerCase());

          // Update the last recognition text
          this.lastRecognitionText = newText;

          // Append the new text to the complete recognition text
          if (!isContinuation) {
            this.completeRecognitionText += ' ' + newText;
          }
        }
      }

      if (data.words) {

        this.recognizedIndex = recognitionIndex;
        this.chunks = [];
        this.recognitionChunks = [];
        for (const word of data.words) {

          const wordSettings = this.detectWordSettings.filter((setting) => setting.words.find(settingWord => settingWord === word));

          if (wordSettings.length && !this.ignoreCommands.find(ignoreWord => ignoreWord === word)) {
            this.detectedWords.push(word);
            this.ignoreCommands.push(word);
            for (const wordSetting of wordSettings) {
              this.triggerSetting(wordSetting, data.words, data.text);
            }
            setTimeout(() => {
              this.ignoreCommands = this.ignoreCommands.filter(ignoreWord => ignoreWord !== word);
            }, this.onRecognitionIgnoreFor)
          }
        }
      }
      if (data.sentence) {
        this.recognizedIndex = recognitionIndex;
        this.chunks = [];
        this.recognitionChunks = [];
        this.detectedSentences.push(data.sentence);
        const wordSettings = this.detectSentenceSettings.filter((setting) => setting.words.find(settingWord => settingWord === data.sentence));
        if (wordSettings?.length) {
          for (const wordSetting of wordSettings) {
            if (wordSetting.callback) {
              wordSetting.callback(data.words, data.text);
            }
          }
        }
      }
    }


  }

  private openUrl(url: string) {
    if (!this.urlsOpened[url]) {
      this.urlsOpened[url] = true;
      window.open(url, '_blank');
    }

  }

  newTask(setting: SpeechRecognitionSetting) {
    setting.task = {} as SpeechRecognitionAiTask;
  }

  newWord(setting: SpeechRecognitionSetting, value: string) {
    if (!setting.words) {
      setting.words = [];
    }
    setting.words.push(value);
  }

  removeWord(setting: SpeechRecognitionSetting, word: string) {
    if (setting.words) {
      for (let i = 0; i < setting.words.length; i++) {
        if (setting.words[i] === word) {
          setting.words.splice(i, 1);
          return;
        }

      }
    }
  }

   triggerSetting(wordSetting: SpeechRecognitionSetting, words?: string[], text?: string) {
    if (words && wordSetting.callback) {
      wordSetting.callback(words, text);
    }
    if (wordSetting.task) {
      const messages: OpenAiChatMessage[] = [];

      if (wordSetting.task.system) {
        messages.push(new OpenAiChatMessage(wordSetting.task.system, 'system'));
      }
      if (wordSetting.task.user) {
        messages.push(new OpenAiChatMessage(wordSetting.task.user, 'user'));
      }
      if(this.assistantText?.length){
        messages.push(new OpenAiChatMessage(this.assistantText, 'assistant'));
      }
      const maxWords = wordSetting.maxAnswerWords ? wordSetting.maxAnswerWords : 30;
      messages.push(new OpenAiChatMessage('answer in the language "' + this.language.name + '" with maximal ' + maxWords + ' words', 'system'));
      console.log('triggerSetting', wordSetting, messages);

      if (this.openAi && messages.length) {
        this.openAi.sendMessages(messages, 'user', this.openAi.chatModels[0] || this.openAi.chatModel);
      }


    }
  }
}
