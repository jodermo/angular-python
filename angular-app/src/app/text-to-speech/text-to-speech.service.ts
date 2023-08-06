import {Injectable} from '@angular/core';
import {AppLanguage, AppLanguages, AppLanguageType, AppService} from "../app.service";
import {AudioAnalyzer} from "../audio-analyzer/AudioAnalyzer";

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
  mode: string;
  filename: string;
  lang: string;
  play: boolean;
  time: number;
  tableName?: string;
  parentId?: number;

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
  filename = 'audio_record.mp3';

  // audio = document.createElement('audio');
  audio = new Audio();
  audioContext = new AudioContext();
  // audioSource?: MediaElementAudioSourceNode = undefined;
  audioSource?: MediaElementAudioSourceNode;

  //
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
  audioAnalyzer?: AudioAnalyzer;
  audioDevices?: any[];
  dataLoading = false;

  constructor() {
    (this.audio as any).crossorigin = "anonymous";
    this.audio.setAttribute('crossorigin', 'anonymous');
    this.audioSource = this.audioContext.createMediaElementSource(this.audio);
    this.getAudioOutputDevices().then((audioDevices?: any[]) => {
      this.audioDevices = audioDevices;
      if (this.audioDevices?.length) {
        // this.setAudioOutputDevice(this.audioDevices[0].deviceId, this.audioDevices[0]);
      }
      console.log('audioDevices', this.audioDevices);
    });

    this.audio.oncanplay = () => {
      if (this.audioSource) {
        // this.audioSource.connect(this.audioContext.destination);
      }
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
    console.log('loadData', this.results, this.app);
    if (this.app) {
      this.app.loadTextToSpeechResults = false;
      this.dataLoading = true;
      this.app.API.get('text-to-speech', (results: any) => {
        this.results = results?.length ? results : this.results;

        if (this.app) {
          this.results = this.app.sortData(this.results, 'id');
          this.app.textToSpeechResults = this.results;
        }
        this.dataLoading = false;
        console.log('loadData', this.results, this.app);
      });
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
    if (this.app) {
      this.app.textToSpeechResults = this.results;
    }
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

  makeFileAndSave(text = this.text, language = this.language, tableName?: string, id?: number, filename = this.filename) {
    this.makeFileAndPlay(text, language, filename, false, this.mode, {
      tableName: tableName,
      parentId: id
    });
  }

  makeFileAndPlay(text = this.text, language = this.language, filename = this.filename, fromAutoplay = false, mode = this.mode, additionalData?: any) {

    if (text && text.length && !this.loading[text]) {
      const parsedText = text ? text.replace(/```/g, '') : '';
      if (this.textResults[language.iso] && this.textResults[language.iso][text]) {
        this.playResult(this.textResults[language.iso][text], fromAutoplay);
      } else {
        this.loading[text] = true;
        const body: any = {
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
        };
        if (additionalData) {
          Object.assign(body, additionalData);
        }
        this.app?.post(this.app?.API.url + mode.apiRoute, body, (result?: TextToSpeechResponse) => {
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
      console.log('playResult', textToSpeechResult, src);
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

  async getAudioOutputDevices() {
    if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');
      return audioOutputDevices;
    }
    return [];
  }

  async setAudioOutputDevice(deviceId: string, destination?: any) {
    console.log('setAudioOutputDevice', deviceId);
    if (destination) {
      console.log('setAudioOutputDevice destination', this.audioContext.destination, destination);
    }
    if ('setSinkId' in this.audioContext.destination) {
      try {
        await (this.audioContext.destination as any).setSinkId(deviceId);

        console.log('destination', this.audioContext.destination);
      } catch (error) {
        console.error('Failed to set audio output device:', error);
      }
    } else {
      console.warn('Audio output device selection is not supported in this browser.');
    }
  }

  play(textToSpeechResponse?: TextToSpeechResponse) {
    if (this.audioSource) {
      this.audioAnalyzer = new AudioAnalyzer(this.audioSource, this.audioContext, true)
    }
    (this.audio as any).initialized = true;
    if (textToSpeechResponse?.filename) {
      this.audio.src = this.resultFileSrc(textToSpeechResponse);
    }
    if (this.audioContext.state === 'suspended') {
      try {
        this.audioContext.resume();
      } catch (error) {
        console.log('audioContext resume error', error);
      }

    }
    console.log('play', textToSpeechResponse, this.audio, (this.audio as any).initialized, this.audioAnalyzer);
    if (this.audio.src) {
      try {
        this.audio.play();
        console.log('!play', this.audio);
      } catch (error) {
        console.log('play error', error);
      }
    }
  }


  replay() {
    if (this.audio.src && this.audio.paused) {
      this.audio.currentTime = 0;
      this.play();
    }
  }

  stop() {
    if (!this.audio.paused || this.audio.currentTime !== 0) {
      this.pause()
      this.audio.currentTime = 0;
    }
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

  tableData(tableName: string, id: number) {
    return this.results.filter((textToSpeechResult: TextToSpeechResponse) => textToSpeechResult.tableName === tableName && textToSpeechResult.parentId === id);
  }

  textData(text: string, language = this.language) {
    if (this.app) {
      language = this.app.language;
    }
    return this.results.filter((textToSpeechResult: TextToSpeechResponse) => textToSpeechResult.text === text && textToSpeechResult.lang === language.iso);
  }

  delete(textToSpeechResult?: TextToSpeechResponse) {
    if (this.app && textToSpeechResult?.id) {
      console.log('delete', textToSpeechResult);
      this.app.API.delete('text-to-speech', textToSpeechResult, (result: any) => {
        console.log('delete', textToSpeechResult, result);
        this.loadData();
      }, (error: any) => {
        console.log('error', textToSpeechResult, error);
        this.loadData();
      });
    }
  }
}
