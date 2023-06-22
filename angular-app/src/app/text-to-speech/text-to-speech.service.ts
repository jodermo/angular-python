import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from "../app.service";
import {environment} from "../../environments/environment.prod";

export interface TextToSpeechResponse {
  text: string;
  filename: string;
  lang: string;
  play: boolean;
  time: number;
}


export interface ElevenLabsVoice {
  available_for_tiers: string[];
  category: string;
  description: string | null;
  fine_tuning: {
    fine_tuning_requested: boolean;
    finetuning_state: string;
    is_allowed_to_fine_tune: boolean;
    language: string | null;
    manual_verification: string | null;
    manual_verification_requested: boolean;
    model_id: string | null;
    slice_ids: string[] | null;
    verification_attempts: any[] | null;
    verification_attempts_count: number;
    verification_failures: any[];
  };
  labels: Record<string, any>;
  name: string;
  preview_url: string;
  samples: any[] | null;
  settings: any[] | null;
  sharing: any[] | null;
  voice_id: string;
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

  useElevenLabsAPI = environment.useElevenLabsAPI ? true : false;
  elevenLabsVoices: ElevenLabsVoice[] = [];
  elevenLabsVoice?: ElevenLabsVoice;
  elevenLabsVoicesLoaded = false;
  private loading: any = {};

  constructor() {
    this.audio.oncanplay = () => {
      if(this.currentResult){
        this.loading[this.currentResult.text] = true;
      }
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
    this.getElevenLabsVoices();
  }
  loadData(){
    if(this.app){
      this.app.API.get('text-to-speech', (results: any)=>{
        this.results = results?.length ?  results : this.results;
      })
    }
  }

  getElevenLabsVoices() {
    if (this.app && this.useElevenLabsAPI && !this.elevenLabsVoicesLoaded) {
      this.app.get(this.app?.API.url + '/eleven-labs/voices', (result?: any) => {
        if (result?.voices) {
          this.elevenLabsVoices = result.voices as ElevenLabsVoice[];
          this.elevenLabsVoice = this.elevenLabsVoices.length ? this.elevenLabsVoices[0] : undefined;
          this.elevenLabsVoicesLoaded = true;
        }
      });
    }

  }

  addResult(result: TextToSpeechResponse, language = this.language, ready = true) {
    result.time = Date.now();
    if (!this.textResults[language.iso]) {
      this.textResults[language.iso] = {} as any;
    }
    this.textResults[language.iso][result.text] = result;
    this.results.push(result);
    this.results.sort((a, b) => a.time + b.time);
    this.loading[result.text] = ready;
  }

  makeFile(text = this.text, lang = this.language, filename = this.filename, useElevenLabsAPI = this.useElevenLabsAPI) {

    if (text && text.length && !this.loading[text]) {
      this.app?.post(this.app?.API.url + (useElevenLabsAPI ? '/eleven-labs' : '') + '/text-to-speech', {
        text,
        lang,
        filename,
        stability: 1,
        similarity_boost: 1,
        voice_id: this.elevenLabsVoice?.voice_id
      }, (result?: TextToSpeechResponse) => {

        if (result?.text) {
          this.text = undefined;
          this.addResult(result, lang);
        } else {
          this.loading[text] = false;
        }

      }, () => {
        this.loading[text] = false;
      });
    }
  }

  makeFileAndPlay(text = this.text, language = this.language, filename = this.filename, fromAutoplay = false, useElevenLabsAPI = this.useElevenLabsAPI) {
    if (text && text.length && !this.loading[text]) {
      if (this.textResults[language.iso] && this.textResults[language.iso][text]) {
        this.playResult(this.textResults[language.iso][text], fromAutoplay);
      } else {
        this.loading[text] = true;
        this.app?.post(this.app?.API.url + (useElevenLabsAPI ? '/eleven-labs' : '') + '/text-to-speech', {
          text,
          lang: language.iso,
          filename,
          stability: 1,
          similarity_boost: 1,
          voice_id: this.elevenLabsVoice?.voice_id
        }, (result?: TextToSpeechResponse) => {
          if (result?.text) {
            this.text = undefined;
            this.addResult(result, language, false);
            this.playResult(result, fromAutoplay);
          }else{
            this.loading[text] = false;
          }

        }, () => {
          this.loading[text] = false;
        });
      }

    }
  }

  playTextOnServer(text = this.text, lang = this.language, filename = this.filename, useElevenLabsAPI = this.useElevenLabsAPI) {
    if (text && text.length && !this.loading[text]) {
      this.loading[text] = true;
      this.app?.post(this.app?.API.url + (useElevenLabsAPI ? '/eleven-labs' : '') + '/text-to-speech?play=1', {
        text,
        lang,
        filename,
        stability: 1,
        similarity_boost: 1,
        voice_id: this.elevenLabsVoice?.voice_id
      }, (result?: TextToSpeechResponse) => {
        if (result?.text) {
          this.text = undefined;
          this.addResult(result, lang);

        }
      }, () => {
        this.loading[text] = false;
      });
    }

  }

  resultFileSrc(result: TextToSpeechResponse, useElevenLabsAPI = this.useElevenLabsAPI) {
    return this.app?.API.url + (useElevenLabsAPI ? '/eleven-labs' : '') + '/text-to-speech?filename=' + result.filename;
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
      this.loading[textToSpeechResult.text] = true;
      this.played = false;
      this.playing = textToSpeechResult;
      const src = this.resultFileSrc(textToSpeechResult);
      this.pause();
      this.audio.src = '';
      this.audio.src = src;
      this.loading[textToSpeechResult.text] = false;
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

  replay() {
    if (this.audio.src && this.audio.paused) {
      this.audio.currentTime = 0;
      this.play();
    }
  }

  stop() {
    this.pause();
    this.audio.currentTime = 0;
  }

  isLoading(text?: string) {
    return text && text.length ? this.loading[text] ? true : false : false;
  }
}
