import {Injectable} from '@angular/core';
import {AppService} from "../app.service";

export const TextToSpeechLanguages = ['en', 'de'];
export  type TextToSpeechLanguage = typeof TextToSpeechLanguages[number];

export interface TextToSpeechResponse {
  text: string;
  filename: string;
  lang: string;
  play: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private app?: AppService;
  text?: string;
  results: TextToSpeechResponse[] = [];
  textResults: any = {};
  languages = TextToSpeechLanguages;
  language: TextToSpeechLanguage = 'en';
  filename = 'text.mp3';

  audio = new Audio();
  played = false;
  playing?: TextToSpeechResponse;


  constructor() {
    this.audio.oncanplay = () => {
      if (!this.played) {
        this.played = true;
        this.play();
      }
    };
    this.audio.onended = () => {
      this.audio.currentTime = 0;
      this.pause();
    };
  }

  init(app = this.app) {
    this.app = app;
  }

  addResult(result: TextToSpeechResponse, lang = this.language) {
    if (!this.textResults[lang]) {
      this.textResults[lang] = {} as any;
    }
    this.textResults[lang][result.text] = result;
    this.results.push(result);
  }

  makeFile(text = this.text, lang = this.language, filename = this.filename) {

    if (text?.length) {
      this.app?.post(this.app?.API.url + '/text-to-speech', {text, lang, filename}, (result?: TextToSpeechResponse) => {
        if (result?.text) {
          this.text = undefined;
          this.addResult(result, lang);
        }
      });
    }
  }

  makeFileAndPlay(text = this.text, lang = this.language, filename = this.filename) {

    if (text?.length) {
      if (this.textResults[lang] && this.textResults[lang][text]) {
        this.playResult(this.textResults[lang][text]);
      } else {
        this.app?.post(this.app?.API.url + '/text-to-speech', {
          text,
          lang,
          filename
        }, (result?: TextToSpeechResponse) => {
          if (result?.text) {
            this.text = undefined;
            this.addResult(result, lang);
            this.playResult(result);
          }
        });
      }

    }
  }

  playTextOnServer(text = this.text, lang = this.language, filename = this.filename) {
    this.app?.post(this.app?.API.url + '/text-to-speech?play=1', {
      text,
      lang,
      filename
    }, (result?: TextToSpeechResponse) => {
      if (result?.text) {
        this.text = undefined;
        this.addResult(result, lang);
      }
    });
  }

  resultFileSrc(result: TextToSpeechResponse) {
    return this.app?.API.url + '/text-to-speech?filename=' + result.filename;
  }

  playResult(textToSpeechResult = this.playing) {
    if (textToSpeechResult && textToSpeechResult !== this.playing) {
      this.played = false;
      this.playing = textToSpeechResult;
      const src = this.resultFileSrc(textToSpeechResult);
      this.pause();
      this.audio.src = '';
      this.audio.src = src;
    } else if (textToSpeechResult === this.playing) {
      this.play();
    }
  }

  togglePauseOrNext(textToSpeechResult = this.playing) {
    if (!this.audio.paused) {
      if (textToSpeechResult !== this.playing) {
        this.playResult(textToSpeechResult);
      } else {
        this.pause();
      }
    } else {
      this.playResult(textToSpeechResult);
    }
  }

  togglePause(textToSpeechResult = this.playing) {
    if (!this.audio.paused) {
      this.pause();
    } else {
      this.playResult(textToSpeechResult);
    }
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  play() {
    if (this.audio.src && this.audio.paused) {
      this.audio.play();
    }
  }
}
