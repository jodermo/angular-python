import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from "../app.service";

export interface TextToSpeechMode {
  alias: string;
  name: string;
  apiRoute: string;
  infoUrl?: string;
}

export const TextToSpeechGoogleMode: TextToSpeechMode = {
  alias: 'gtts',
  name: 'gTTS (Google)',
  apiRoute: '/text-to-speech',
  infoUrl: 'https://pypi.org/project/gTTS/'
};
export const TextToSpeechPyttsx3Mode: TextToSpeechMode = {
  alias: 'pyttsx3',
  name: 'pyttsx3 (offline)',
  apiRoute: '/text-to-speech',
  infoUrl: 'https://github.com/nateshmbhat/pyttsx3'
};

export const TextToSpeechPollyMode: TextToSpeechMode = {
  alias: 'polly',
  name: 'Polly (AWS)',
  apiRoute: '/polly/text-to-speech',
  infoUrl: 'https://aws.amazon.com/de/polly/'
};
export const TextToSpeechElevenLabsMode: TextToSpeechMode = {
  alias: 'eleven-labs',
  name: 'll ElevenLabs',
  apiRoute: '/eleven-labs/text-to-speech',
  infoUrl: 'https://www.futuretools.io/tools/eleven-labs'
};
export const TextToSpeechModes: TextToSpeechMode[] = [
  TextToSpeechGoogleMode,
  TextToSpeechPollyMode,
  TextToSpeechElevenLabsMode,
  TextToSpeechPyttsx3Mode
];

export interface TextToSpeechResponse {
  id: number;
  text: string;
  filename: string;
  lang: string;
  play: boolean;
  time: number;
}

export interface PollyVoice {
  Id: string;
  Name: string;
  Gender: string;
  LanguageCode: string;
  LanguageName: string;
  SupportedEngines: string[];
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

  modes = TextToSpeechModes;
  mode: TextToSpeechMode = TextToSpeechModes[0];

  elevenLabsVoices: ElevenLabsVoice[] = [];
  elevenLabsVoice?: ElevenLabsVoice;
  elevenLabsVoicesLoaded = false;

  pollyEngines: string[] = [];
  pollyEngine = 'standard'
  pollyVoices: PollyVoice[] = [];
  pollyEngineVoices: PollyVoice[] = [];
  pollyVoice?: PollyVoice;
  pollyVoicesLoaded = false;

  private loading: any = {};

  pyttsx3Rate = 125;
  pyttsx3Volume = 1;
  pyttsx3Female = false;


  constructor() {
    this.audio.oncanplay = () => {
      if (this.currentResult) {
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
    this.loadData();
    this.getPollyVoices();
    this.getElevenLabsVoices();
  }

  loadData() {
    if (this.app) {
      this.app.API.get('text-to-speech', (results: any) => {
        this.results = results?.length ? results : this.results;
      })
    }
  }

  getPollyVoices() {
    if (this.app && !this.pollyVoicesLoaded) {
      this.app.get(this.app?.API.url + '/polly/voices', (result?: any) => {
        if (result?.Voices) {
          this.pollyVoices = result.Voices as PollyVoice[];
          this.pollyVoicesLoaded = true;
          for (const voice of this.pollyVoices) {
            for (const supportedEngine of voice.SupportedEngines) {
              if (!this.pollyEngines.find(existing => existing === supportedEngine)) {
                this.pollyEngines.push(supportedEngine);
              }
            }
          }
          this.filterPollyVoices();
        }
      });
    }

  }

  filterPollyVoices(engine = this.pollyEngine) {
    this.stop();
    const language = this.app ? this.app.language : this.language;
    this.pollyEngineVoices = this.pollyVoices.filter((voice: PollyVoice) => voice.LanguageCode === language.lang && voice.SupportedEngines.find(supportedEngines => supportedEngines === engine));
    this.pollyVoice = this.pollyEngineVoices.length ? this.pollyEngineVoices[0] : undefined;
  }

  getElevenLabsVoices() {
    if (this.app && !this.elevenLabsVoicesLoaded) {
      this.app.get(this.app?.API.url + '/eleven-labs/voices', (result?: any) => {
        if (result?.voices) {
          this.elevenLabsVoices = result.voices as ElevenLabsVoice[];
          this.elevenLabsVoice = this.elevenLabsVoices.length ? this.elevenLabsVoices[0] : undefined;
          this.elevenLabsVoicesLoaded = true;
        }
      });
    }

  }

  addResult(result: TextToSpeechResponse, text: string, language = this.language, ready = true) {
    result.time = Date.now();
    if (!this.textResults[language.iso]) {
      this.textResults[language.iso] = {} as any;
    }
    this.textResults[language.iso][text] = result;
    this.results.push(result);
    this.results.sort((a, b) => a.time + b.time);
    this.loading[text] = ready;
  }

  makeFile(text = this.text, lang = this.language, filename = this.filename, mode = this.mode) {


    if (text && text.length && !this.loading[text]) {
      const parsedText = text ? text.replace(/```/g, '') : '';
      this.app?.post(this.app?.API.url + mode.apiRoute, {
        text: parsedText,
        lang,
        filename,
        stability: 1,
        similarity_boost: 1,
        engine: mode.alias === 'polly' ? this.pollyEngine : undefined,
        voice_id: mode.alias === 'polly' ? this.pollyVoice?.Id : mode.alias === 'eleven-labs' ? this.elevenLabsVoice?.voice_id : undefined
      }, (result?: TextToSpeechResponse) => {

        if (result?.text) {
          this.text = undefined;
          this.addResult(result, text, lang);
        } else {
          this.loading[text] = false;
        }

      }, () => {
        this.loading[text] = false;
      });
    }
  }

  makeFileAndPlay(text = this.text, language = this.language, filename = this.filename, fromAutoplay = false, mode = this.mode) {
    if (text && text.length && !this.loading[text]) {
      const parsedText = text ? text.replace(/```/g, '') : '';
      if (this.textResults[language.iso] && this.textResults[language.iso][text]) {
        this.playResult(this.textResults[language.iso][text], fromAutoplay);
      } else {
        this.loading[text] = true;
        this.app?.post(this.app?.API.url + mode.apiRoute, {
          text: parsedText,
          lang: language.iso,
          filename,
          female: this.pyttsx3Female ? 1 : 0,
          offline: this.isOfflineMode(mode) ? 1 : 0,
          rate: this.pyttsx3Rate,
          volume: this.pyttsx3Volume,
          stability: 1,
          similarity_boost: 1,
          engine: mode.alias === 'polly' ? this.pollyEngine : undefined,
          voice_id: mode.alias === 'polly' ? this.pollyVoice?.Id : mode.alias === 'eleven-labs' ? this.elevenLabsVoice?.voice_id : undefined
        }, (result?: TextToSpeechResponse) => {
          if (result?.text) {
            this.text = undefined;
            this.addResult(result, text, language, false);
            this.playResult(result, fromAutoplay);
          } else {
            this.loading[text] = false;
          }

        }, () => {
          this.loading[text] = false;
        });
      }

    }
  }

  playTextOnServer(text = this.text, lang = this.language, filename = this.filename, mode = this.mode) {
    if (text && text.length && !this.loading[text]) {
      const parsedText = text ? text.replace(/```/g, '') : '';
      this.loading[text] = true;
      this.app?.post(this.app?.API.url + mode.apiRoute + '?play=1', {
        text: parsedText,
        lang,
        filename,
        stability: 1,
        similarity_boost: 1,
        engine: mode.alias === 'polly' ? this.pollyEngine : undefined,
        voice_id: mode.alias === 'polly' ? this.pollyVoice?.Id : mode.alias === 'eleven-labs' ? this.elevenLabsVoice?.voice_id : undefined
      }, (result?: TextToSpeechResponse) => {
        if (result?.text) {
          this.text = undefined;
          this.addResult(result, text, lang);

        }
      }, () => {
        this.loading[text] = false;
      });
    }

  }

  resultFileSrc(result: TextToSpeechResponse, mode = this.mode) {
    return this.app?.API.url + mode.apiRoute + '?filename=' + result.filename;
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

  isOfflineMode(mode = this.mode) {
    return mode === TextToSpeechPyttsx3Mode;
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  play(textToSpeechResponse?: TextToSpeechResponse) {

    if (textToSpeechResponse?.filename) {
      this.audio.src = this.resultFileSrc(textToSpeechResponse);
    }
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

  isAvailable(text: string) {
    return this.app ? this.app.playedTextToSpeechResults.find((existing: TextToSpeechResponse) => existing.text === text) !== undefined : false;
  }

  download(text: string) {
    if (this.app) {
      const textToSpeechResult = this.app.playedTextToSpeechResults.find((existing: TextToSpeechResponse) => existing.text === text);
      if (textToSpeechResult) {
        const src = this.resultFileSrc(textToSpeechResult);
        if (src) {
          this.app.download(src);
        }
      }
    }

  }
}
