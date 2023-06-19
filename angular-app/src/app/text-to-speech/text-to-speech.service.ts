import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from "../app.service";

export interface TextToSpeechResponse {
  text: string;
  filename: string;
  lang: string;
  play: boolean;
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private app?: AppService;
  text?: string;
  results: TextToSpeechResponse[] = [];
  currentResult?: TextToSpeechResponse;
  textResults: any = {};
  languages: AppLanguage[] = AppLanguages;
  language: AppLanguageType = AppLanguages.length ? AppLanguages[0] : {name: 'English', iso: 'en', lang: 'en-US'};
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

  addResult(result: TextToSpeechResponse, language = this.language) {
    result.time = Date.now();
    if (!this.textResults[language.iso]) {
      this.textResults[language.iso] = {} as any;
    }
    this.textResults[language.iso][result.text] = result;
    this.results.push(result);
    this.results.sort((a, b) => a.time + b.time);
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

  makeFileAndPlay(text = this.text, language = this.language, filename = this.filename, fromAutoplay = false) {
    if (text?.length) {
      if (this.textResults[language.iso] && this.textResults[language.iso][text]) {
        this.playResult(this.textResults[language.iso][text], fromAutoplay);
      } else {
        this.app?.post(this.app?.API.url + '/text-to-speech', {
          text,
          lang: language.iso,
          filename
        }, (result?: TextToSpeechResponse) => {
          if (result?.text) {
            this.text = undefined;
            this.addResult(result, language);
            this.playResult(result, fromAutoplay);
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

  playResult(textToSpeechResult = this.playing, fromAutoplay = false) {
    if (this.app) {
      const played = this.app.playedTextToSpeechResults.find((played: TextToSpeechResponse) => played === textToSpeechResult);
      if (fromAutoplay && played) {
        return;
      } else if (textToSpeechResult) {
        this.app.playedTextToSpeechResults.push(textToSpeechResult);
      }
    }
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
