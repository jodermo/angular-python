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
  text: string;
  response: OpenAiResponseData;
}

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {

  text?: string;

  app?: AppService;
  results: OpenAiResponse[] = [];
  sending = false;

  init(app = this.app) {
    this.app = app;
  }

  sendRequest(text = this.text) {
    this.sending = true;
    this.app?.post(this.app?.API.url + '/open-ai', {
      text,
    }, (result: OpenAiResponse) => {
      this.results.push(result);
      this.text = undefined;
      this.sending = false;
    });
  }
}
