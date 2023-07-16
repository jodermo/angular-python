import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from '../app.service';
import {WebsocketService} from "../websocket/websocket.service";

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
  audio = new Audio();
  audioReady = false;
  currentResult?: SpeechRecognitionResponse;

  loading = false;

  private resultCallbacks: ((result?: SpeechRecognitionResponse) => void)[] = [];
  private websocket?: WebsocketService;
  private websocketStarted = false;
  detectWords: string[] = [];
  detectSentence: string = '';

  private detectWordCallbacks: any = {};
  private detectSentenceCallbacks: any = {};

  recognitionTimeout: any;
  recognitionInterval = 2500;
  recognitionChunks: any[] = [];
  maxRecognitionChunks = 4;
  detectedWords: string[] = [];
  detectedSentences: string[] = [];
  recognitionText?: string;
  lastRecognitionText = '';
  completeRecognitionText = '';
  recognitionError?: string;
  returnToRecognition = false;
  private urlsOpened: any = {};

  constructor() {
    this.audio.oncanplay = () => {
      if (this.audio.src) {
        this.audioReady = true;
      }
    };
    this.audio.src = '';
  }

  init(app = this.app, websocket = this.websocket) {
    this.app = app ? app : this.app;
    this.websocket = websocket ? websocket : this.websocket;
    this.language = this.app?.language ? this.app.language : this.language;

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
        this.checkDetectWords(data);
      });
      console.log('initWebsocket', this.websocket);
    }
  }

  recognizeFile(
    filename: string,
    directory: string,
    onSuccess?: (result?: SpeechRecognitionResponse) => void,
    onError?: (error?: any) => void
  ) {
    const language = (this.app && this.app.language ? this.app.language.lang : this.language ? this.language.lang : 'en-US');
    console.log('language', language);
    this.loading = true;
    this.app?.get(
      this.app?.API.url + '/speech-recognition?path=' + directory + '&language=' + language + '&filename=' + filename + '',
      (result?: SpeechRecognitionResponse) => {
        if (result) {
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
      console.log('startRecognition', this.websocket);
      navigator.mediaDevices
        .getUserMedia({audio: true})
        .then((stream) => {

          console.log('startRecognition stream', stream);

          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.addEventListener('dataavailable', (e) => {
            this.chunks.push(e.data);
            this.recognitionChunks.push(e.data);
            console.log('this.websocket', this.websocket);

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
    console.log('language', lang);
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
    }
    await this.mediaRecorder?.stop();
    if (this.recognition) {
      if (this.websocket && this.recognitionChunks.length) {
        const fileType = 'wav';
        const audioBlob = new Blob(this.recognitionChunks, {type: 'audio/' + fileType});
        const audioFile = new File([audioBlob], 'speech_recognition.' + fileType, {type: 'audio/' + fileType});
        const audio = new Audio(URL.createObjectURL(audioFile));

        // @ts-ignore
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();

        if (isSupportedAudioFormat(audioFile)) {
          fetchAudioData(audioFile)
            .then((audioData) => {
              reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                audioCtx.decodeAudioData(arrayBuffer)
                  .then((audioBuffer: AudioBuffer) => {
                    const data = {
                      audio: audioData,
                      words: this.detectWords,
                      sentence: this.detectSentence,
                      language: lang,
                      sample_rate: audioBuffer.sampleRate,
                      channels: audioBuffer.numberOfChannels,
                      sample_width: 2,
                    };
                    // Send the data to the server over WebSocket
                    console.log('checkRecognitionChunks', this.recognitionChunks.length, data, audioBuffer);
                    if (this.websocket) {
                      this.websocket.emit('audio', data);
                    }
                    // Receive WebSocket events from the server
                  })
                  .catch((error: any) => {
                    console.error('Error with decoding audio data', error);
                  });
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
    if (!this.recording) {
      this.returnToRecognition = this.recognition;
      this.startRecognition(language);
      this.recording = true;
    }

  }

  onDetectWords(words: string[], callback: (words?: string[], text?: string) => void) {
    for (const word of words) {
      this.onDetectWord(word, callback);
    }
  }

  onDetectWord(word: string, callback: (words?: string[]) => void, text?: string) {
    if (!this.detectWords.find((existingWord: string) => existingWord === word)) {
      this.detectWords.push(word);
    }
    if (!this.detectWordCallbacks[word]) {
      this.detectWordCallbacks[word] = [];
    }
    this.detectWordCallbacks[word].push(callback);
  }

  onDetectSentence(sentence: string, callback: () => void) {
    if (!this.detectWordCallbacks[sentence]) {
      this.detectWordCallbacks[sentence] = [];
    }
    this.detectWordCallbacks[sentence].push(callback)
  }

  playAudio() {
    if (this.audioReady && this.audio.paused) {
      this.audio.play();
    }
  }

  async stopRecording() {


    if (this.mediaRecorder && this.recognition) {
      await this.mediaRecorder?.stop();
      this.recognition = false;
      if (this.recording) {
        this.loading = true;
        setTimeout(() => {
          // wait till this.mediaRecorder is finished calculating
          const audioBlob = new Blob(this.chunks, {type: 'audio/mp3'});
          this.audioFile = new File([audioBlob], this.fileName + '.mp3');
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
    console.log('stopRecording', this);

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

  uploadAudioFile() {

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
    console.log('checkDetectWords', data);

    if (data.audio_data) {
      const audioData = data.audio_data;
      const audioBlob = new Blob([audioData], {type: 'audio/wav'});
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
      this.chunks = [];
      this.recognitionChunks = [];
      for (const word of data.words) {
        this.detectedWords.push(word);
        if (this.detectWordCallbacks[word]) {
          for (const callback of this.detectWordCallbacks[word]) {
            callback(data.words, data.text);
          }
        }
      }
    }
    if (data.sentence) {
      this.detectedSentences.push(data.sentence);
      if (this.detectSentenceCallbacks[data.sentence]) {
        for (const callback of this.detectSentenceCallbacks[data.sentence]) {
          callback(data.sentence, data.text);
        }
      }
    }

  }

  private openUrl(url: string) {
    console.log('openUrl', url, !this.urlsOpened[url]);
    if (!this.urlsOpened[url]) {
      this.urlsOpened[url] = true;
      window.open(url, '_blank');
      console.log('openUrl', url, '_blank');
    }

  }
}
