import {Injectable} from '@angular/core';
import {AppService} from "../app.service";


export interface OpenAiResponseChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string,
    content: string
  };
}

export interface OpenAiResponseData {
  created?: number;
  data?: any[];
  model?: string
  object?: string;
  choices?: OpenAiResponseChoice[];
  error?: any;
  usage?: {
    completion_tokens: number,
    prompt_tokens: number,
    total_tokens: number
  };
}


export interface OpenAiResponse {
  text?: string;
  prompt?: string;
  number?: number;
  size?: string;
  response: OpenAiResponseData;
  time:number;
}

export const OpenAiModeAliases = ['chat', 'image', 'completion'];
export type OpenAiModeAlias = typeof OpenAiModeAliases[number];
export type OpenAiMode = { name: string, alias: OpenAiModeAlias };
export const OpenAiModes: OpenAiMode[] = [
  {name: 'Chat', alias: 'chat'},
  {name: 'Completion', alias: 'completion'},
  {name: 'Image', alias: 'image'}
];

export const OpenAiChatRoles = ['assistant', 'user', 'system'];
export type OpenAiChatRole = typeof OpenAiChatRoles[0];

export const OpenAiChatModels = ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
export type OpenAiChatModel = typeof OpenAiChatModels[0];


export const OpenAiCompletionModels = ['text-davinci-003'];
export type OpenAiCompletionModel = typeof OpenAiCompletionModels[0];

export const OpenAiImageSizes = ['256x256x', '512x512', '1024x1024'];
export type OpenAiImageSize = typeof OpenAiImageSizes[0];

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {

  modes = OpenAiModes;
  mode: OpenAiMode = OpenAiModes[0];

  text?: string;

  roles = OpenAiChatRoles;
  role: OpenAiChatRole = 'assistant';

  chatModels = OpenAiChatModels;
  completionModels = OpenAiCompletionModels;
  chatModel: OpenAiChatModel = 'gpt-3.5-turbo';
  completionModel: OpenAiCompletionModel = 'text-davinci-003';

  imageSizes = OpenAiImageSizes;
  imageSize: OpenAiImageSize = '1024x1024';

  numberOfImages = 1;
  maxNumberOfImages = 10;


  app?: AppService;
  results: OpenAiResponse[] = [];
  sending = false;


  init(app = this.app) {
    this.app = app;
  }


  createMessage(text = this.text, role = this.role, model = this.chatModel) {
    this.sending = true;
    this.app?.post(this.app?.API.url + '/open-ai/chat', {
      text,
      role,
      model,
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.text = undefined;
      this.sending = false;
    });
  }

  getCompletions(prompt = this.text, role = this.role, model = this.completionModel) {
    this.sending = true;
    this.app?.post(this.app?.API.url + '/open-ai/completions', {
      prompt,
      role,
      model,
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.text = undefined;
      this.sending = false;
    });
  }

  generateImage(prompt = this.text, number = this.numberOfImages, size = this.imageSize) {
    this.sending = true;
    this.app?.post(this.app?.API.url + '/open-ai/images', {
      prompt,
      number,
      size
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.text = undefined;
      this.sending = false;
    });
  }

  submitRequest() {
    if (this.mode.alias === 'image') {
      this.generateImage();
    } else if(this.mode.alias === 'completion') {
      this.getCompletions()
    }else {
      this.createMessage()
    }

  }
}
