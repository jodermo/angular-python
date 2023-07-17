import {Injectable} from '@angular/core';
import {AppService} from "../app.service";
import {ServerFile} from "../file-manager/file-manager.service";
import {ParsedText} from "./parsed-message/parsed-message.component";


export interface OpenAiModelPermission {
  id?: string;
  created?: number;
  group?: any;
  owned_by?: string;
  is_blocking?: boolean;
  object?: string;
  organization?: string;
  allow_create_engine?: boolean;
  allow_fine_tuning?: boolean;
  allow_logprobs?: boolean;
  allow_sampling?: boolean;
  allow_search_indices?: boolean;
  allow_view?: boolean;
}

export interface OpenAiCompletionModel {
  id?: string;
  created?: number;
  object?: string;
  owned_by?: string;
  parent?: any;
  root?: string;
  permission?: OpenAiModelPermission[];
}

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
  id?: number;
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
  dbEntry?: any;
  files?: { filename: string, prompt: string, n: string, imageResult: ServerFile }[];
}


export const OpenAiModeAliases = ['chat', 'image', 'completion'];
export type OpenAiModeAlias = typeof OpenAiModeAliases[number];
export type OpenAiMode = { name: string, alias: OpenAiModeAlias };
export const OpenAiChatMode: OpenAiMode = {name: 'GPT Chat', alias: 'chat'};
export const OpenAiCompletionMode: OpenAiMode = {name: 'Send Completion', alias: 'completion'};
export const OpenAiImageMode: OpenAiMode = {name: 'Image Generation', alias: 'image'};
export const OpenAiFileMode: OpenAiMode = {name: 'File', alias: 'file'};
export const OpenAiCompletionModels = ['text-davinci-003', 'text-davinci-002', 'text-curie-001', 'text-babbage-001', 'text-ada-001'];
export const OpenAiChatModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0613', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613'];

export const OpenAiModes: OpenAiMode[] = [
  OpenAiChatMode,
  OpenAiCompletionMode,
  OpenAiImageMode,
  OpenAiFileMode
];

export const OpenAiChatRoles = ['user', 'system', 'assistant', 'function'];
export type OpenAiChatRole = typeof OpenAiChatRoles[0];

export type OpenAiChatModel = typeof OpenAiChatModels[0];


export const OpenAiImageSizes = ['256x256x', '512x512', '1024x1024'];
export type OpenAiImageSize = typeof OpenAiImageSizes[0];


export class OpenAiChatMessage {


  // temperature = 1;
  // top_p = 1;
  // n = 1;
  // stream = false;
  // max_tokens = 0;
  // presence_penalty = 0;
  // frequency_penalty = 0;
  // logit_bias?: string;
  user?: string;
  functions?: OpenAiChatFunction[];

  constructor(
    public content?: string,
    public role: OpenAiChatRole = OpenAiChatRoles[0],
    public name?: string,
    public function_call?: string
  ) {
  }

  public assignMessage(message: OpenAiChatMessage) {
    Object.assign(this, message);
  }
}

export class OpenAiChatFunction {
  name: string = '';
  description: string = '';
  parameters: any = {};
}

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {

  modes = OpenAiModes;
  mode: OpenAiMode = OpenAiModes[0];

  functionCall?: string;
  functions: OpenAiChatFunction[] = [];

  systemMessage = new OpenAiChatMessage('', 'system');
  assistantMessage = new OpenAiChatMessage('', 'assistant');
  messages: OpenAiChatMessage[] = [];

  roles = OpenAiChatRoles;

  chatModels: OpenAiCompletionModel[] = [];
  chatModel?: OpenAiCompletionModel;
  chatTemperature = 1;


  allModels: OpenAiCompletionModel[] = [];

  completionModels: OpenAiCompletionModel[] = [];
  completionModel?: OpenAiCompletionModel;


  imageSizes = OpenAiImageSizes;
  imageSize: OpenAiImageSize = '1024x1024';

  numberOfImages = 1;
  maxNumberOfImages = 10;


  app?: AppService;
  results: OpenAiResponse[] = [];
  sending = false;

  defaultMessage = new OpenAiChatMessage();
  newMessage = new OpenAiChatMessage();
  readResults = true;
  newFunction: OpenAiChatFunction = new OpenAiChatFunction();
  private resultCallbacks: ((result: OpenAiResponse)=>void)[] = [];


  init(app = this.app) {
    this.app = app;
    this.initNewMessage();
    this.listModels();
    this.loadData();
    this.resultCallbacks = [];

  }

  loadData() {
    if (this.app) {
      this.app.API.get('open-ai-response', (results: any) => {
        this.results = results?.length ? results : this.results;
        this.sortResult();
      });
    }
  }

  initNewMessage() {
    this.newMessage = new OpenAiChatMessage();
    this.newMessage.assignMessage(this.defaultMessage);
  }

  initFunction() {
    this.newFunction = new OpenAiChatFunction();
  }

  addFunction(newFunction = this.newFunction) {
    if (newFunction && newFunction.name) {
      this.functions.push(newFunction);
      this.initFunction();
    }
  }

  removeFunction(openAiChatFunction: OpenAiChatFunction) {
    for (let i = 0; i < this.functions.length; i++) {
      if (this.functions[i] === openAiChatFunction) {
        this.functions.splice(i, 1);
        return;
      }
    }
  }

  addOrSetParamToFunction(key: string, value: string, openAiChatFunction = this.newFunction) {
    if (!openAiChatFunction.parameters) {
      openAiChatFunction.parameters = {} as any;
    }
    openAiChatFunction.parameters[key] = value;
  }

  removeParamFromFunction(key: string, openAiChatFunction = this.newFunction) {
    const newParams: any = {};
    for (const paramKey in openAiChatFunction.parameters) {
      if (paramKey !== key) {
        newParams[paramKey] = openAiChatFunction.parameters[paramKey];
      }
    }
    openAiChatFunction.parameters[key] = newParams;
  }

  functionParameters(openAiChatFunction = this.newFunction): { key: string, value: string }[] {
    const parameters: { key: string, value: string }[] = [];
    for (const paramKey in openAiChatFunction.parameters) {
      parameters.push({key: paramKey, value: openAiChatFunction.parameters[paramKey]});
    }
    return parameters;
  }

  clearFunctions() {
    this.functions = [];
  }

  sendMessages(messages = this.messages, role = this.newMessage.role, model = this.chatModel) {
    this.sending = true;
    if (this.systemMessage.content && this.systemMessage.content.length) {
      messages.push(this.systemMessage);
    }
    if (this.assistantMessage.content && this.assistantMessage.content.length) {
      messages.push(this.assistantMessage);
    }
    const requestBody: any = {
      messages: messages,
      model: model?.id || 'gpt-3.5-turbo',
    };
    if (messages.find(message => message.role === 'function')) {
      requestBody['functions'] = this.functions;
      if (this.functionCall?.length) {
        requestBody['function_call'] = this.functionCall;
      }
    }
    this.app?.post(this.app?.API.url + '/open-ai/chat', requestBody, (result: OpenAiResponse) => {
      result.time = Date.now();
      this.results.push(result);
      this.onGetResult(result)
      this.sortResult();
      this.messages = [];
      this.sending = false;
    });
  }

  sortResult() {
    this.results.sort((a, b) => (a.time || -1) + (b.time || -1));
  }

  getCompletions(messages = this.messages, completionModel = this.completionModel) {
    this.sending = true;
    let prompt = '';
    for (const message of messages) {
      prompt += message.content + ' \n';
    }
    this.app?.post(this.app?.API.url + '/open-ai/completions', {
      prompt,
      model: completionModel?.id || 'gpt-3.5-turbo',
    }, (result: OpenAiResponse) => {
      this.results.push(result);
      this.sortResult();
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
      this.sortResult();
      this.messages = [];
      this.sending = false;
    });
  }

  submitRequest() {
    if (this.newMessage) {
      this.addMessage()
    }
    if (this.mode.alias === 'image') {
      this.generateImage();
    } else if (this.mode.alias === 'completion') {
      this.getCompletions()
    } else {
      this.sendMessages()
    }

  }

  addMessage(message = this.newMessage, mode = this.mode) {
    if (message && message.content?.length) {
      this.messages.push(message);
      this.initNewMessage();
    }
  }


  listModels() {
    if (this.app) {
      this.app.get(this.app.API.url + '/open-ai/models',
        (result: any) => {
          if (result?.response && result.response.data) {
            this.allModels = result.response.data as OpenAiCompletionModel[];
            this.completionModels = this.allModels.filter(model => OpenAiCompletionModels.find(modelName => model.id === modelName));
            this.chatModels = this.allModels.filter(model => OpenAiChatModels.find(modelName => model.id === modelName));
            this.completionModel = this.completionModels.length ? this.completionModels[0] : undefined;
            this.chatModel = this.chatModels.length ? this.chatModels[0] : undefined;
          }
        },
        (error: any) => {
          console.error('Failed to retrieve models:', error);
        }
      );
    }
  }

  escapeHtml(html: string): string {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


  parseMessageText(choice: OpenAiResponseChoice): ParsedText[] {
    const content = choice.message.content || '';
    const parsedTexts: ParsedText[] = [];

    // Parse triple backticks for code/pre tags
    const codeRegex = /```(\w*?)\s*([\s\S]*?)\s*```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      const code = this.escapeHtml(match[2].replace(/^\s*\w+\s*/, ''));
      const language = match[1].trim();

      if (textBefore) {
        parsedTexts.push({
          type: 'text',
          text: this.escapeHtml(textBefore)
        });
      }

      parsedTexts.push({
        type: 'code',
        text: match[0],
        code: code,
        language: language
      });

      lastIndex = codeRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      parsedTexts.push({
        type: 'text',
        text: this.escapeHtml(textAfter)
      });
    }

    return parsedTexts;
  }


  onResult(callback : (result: OpenAiResponse)=>void) {
    this.resultCallbacks.push(callback);
  }

  private onGetResult(result: OpenAiResponse) {
    for(const callback of this.resultCallbacks){
      callback(result);
    }
  }
}
