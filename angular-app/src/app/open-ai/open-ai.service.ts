import {Injectable} from '@angular/core';
import {AppService} from "../app.service";


export interface OpenAiResponseChoice {
  index: number;
  finish_reason: string;
  message: OpenAiChatMessage;
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
  messages?: OpenAiChatMessage[];
  model?: string;
  prompt?: string;
  file_id?: string;
  number?: number;
  temperature?: number;
  size?: string;
  response: OpenAiResponseData;
  time: number;
  target_language?: string;
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


export class OpenAiChatMessage {
  constructor(public content: string = '', public role: OpenAiChatRole = OpenAiChatRoles[0]) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {

  modes = OpenAiModes;
  mode: OpenAiMode = OpenAiModes[0];

  messages: OpenAiChatMessage[] = [];

  roles = OpenAiChatRoles;
  role: OpenAiChatRole = 'assistant';

  chatModels = OpenAiChatModels;
  chatModel: OpenAiChatModel = 'gpt-3.5-turbo';
  chatTemperature = 1;

  completionModels = OpenAiCompletionModels;
  completionModel: OpenAiCompletionModel = 'text-davinci-003';

  imageSizes = OpenAiImageSizes;
  imageSize: OpenAiImageSize = '1024x1024';

  numberOfImages = 1;
  maxNumberOfImages = 10;


  app?: AppService;
  results: OpenAiResponse[] = [];
  sending = false;
  newMessage?: string;


  init(app = this.app) {
    this.app = app;
  }


  createMessage(messages = this.messages, role = this.role, model = this.chatModel) {
    this.sending = true;
    this.app?.post(this.app?.API.url + '/open-ai/chat', {
      messages: messages,
      model,
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.messages = [];
      this.sending = false;
    });
  }

  getCompletions(messages = this.messages, role = this.role, model = this.completionModel) {
    this.sending = true;
    let prompt = '';
    for (const message of messages) {
      prompt += message.content + ' \n';
    }
    this.app?.post(this.app?.API.url + '/open-ai/completions', {
      prompt,
      role,
      model,
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.messages = [];
      this.sending = false;
    });
  }

  generateImage(messages = this.messages, number = this.numberOfImages, size = this.imageSize) {
    this.sending = true;
    let prompt = '';
    for (const message of messages) {
      prompt += message.content + ' \n';
    }
    this.app?.post(this.app?.API.url + '/open-ai/images', {
      prompt,
      number,
      size
    }, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.results.sort((a, b) => a.time + b.time);
      this.messages = [];
      this.sending = false;
    });
  }

  submitRequest() {
    if(this.newMessage){
      this.addMessage()
    }
    if (this.mode.alias === 'image') {
      this.generateImage();
    } else if (this.mode.alias === 'completion') {
      this.getCompletions()
    } else {
      this.createMessage()
    }

  }

  addMessage(message = this.newMessage) {
    if (message && message.length) {
      this.messages.push(new OpenAiChatMessage(message, this.role));
      this.newMessage = undefined;
    }
  }
}
