import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from '../app.service';


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


  constructor() {
    this.audio.oncanplay = () => {
      if (this.audio.src) {
        this.audioReady = true;
      }
    };
    this.audio.src = '';
  }

  init(app = this.app) {
    this.app = app;
    this.language = this.app?.language ? this.app.language : this.language;
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
      (error: any)=>{
        if(onError){
          onError(error)
        }
        this.loading = false;
      }
    );
  }

  startRecording(language = this.language) {
    this.language = language;
    if (!this.recording) {
      navigator.mediaDevices
        .getUserMedia({audio: true})
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.addEventListener('dataavailable', (e) => {
            this.chunks.push(e.data);
          });
          this.mediaRecorder.start();
          this.recording = true;
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
        });
    }
  }

  playAudio() {
    if (this.audioReady && this.audio.paused) {
      this.audio.play();
    }
  }

  async stopRecording() {
    if (this.recording && this.mediaRecorder) {
      this.loading = true;
      await this.mediaRecorder?.stop();
      setTimeout(() => {
        // wait till this.mediaRecorder is finished calculating
        const audioBlob = new Blob(this.chunks, {type: 'audio/mp3'});
        this.audioFile = new File([audioBlob], this.fileName + '.mp3');
        this.recording = false;
        this.chunks = [];
        this.loadAudio();
        this.uploadAudioFile();
      }, 250);


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
}
