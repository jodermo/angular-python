import {Injectable} from '@angular/core';
import {ServerFile} from './file-manager/file-manager.service';
import {TextToSpeechResponse} from "./text-to-speech/text-to-speech.service";
import {environment} from "../environments/environment.prod";
import {SpeechRecognitionResponse} from "./speech-recognition/speech-recognition.service";
import {WebcamRecognitionModel, WebcamService} from "./webcam/webcam.service";

// Define available header types
export const HeaderTypes = ['JSON', 'form'];
// Define a union type for header types
export type HeaderType = typeof HeaderTypes[number];

export interface AppLanguage {
  name: string;
  iso: string;
  lang: string;
}

export const AppLanguages = [
  {name: 'English', iso: 'en', lang: 'en-US'} as AppLanguage,
  {name: 'Deutsch', iso: 'de', lang: 'de-DE'} as AppLanguage
];
export type AppLanguageType = typeof AppLanguages[number];


export class Api {
  id?: number;
  api_name?: string;
  api_url?: string;
  method: string = 'GET';
  mode: string = 'no-cors';
  cache: string = 'no-cache';
  credentials?: string;
  headers: {
    key: string;
    value: string;
  }[] = [];
  redirect?: string;
  referrerPolicy?: string;
  body: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  languages: AppLanguage[] = AppLanguages;
  language: AppLanguageType = AppLanguages.length ? AppLanguages[0] : {name: 'English', iso: 'en', lang: 'en-US'};
  user = {
    username: ''
  };
  // API configuration
  API = {
    url: environment.serverURL + environment.apiRoute, // API base URL
    headers: {
      JSON: {
        'Content-Type': 'application/json' // JSON headers
      } as any,
      form: {
        // 'Content-Type': 'application/x-www-form-urlencoded' // Form headers
      } as any
    },
    headerTypes: HeaderTypes, // Available header types
    // GET request
    get: async (
      tableName: string,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      return this.get(this.API.url + '/data', onSuccess, onError, '&tableName=' + tableName);
    },
    getById: async (
      tableName: string,
      id: number,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      return this.get(this.API.url + '/data', onSuccess, onError, '&tableName=' + tableName + '&id=' + id);
    },
    // POST request
    add: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        tableName: tableName,
        data: data
      };
      return this.post(this.API.url + '/data', body, onSuccess, onError);
    },
    // PUT request
    update: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        id: data.id,
        tableName: tableName,
        data: data
      };
      return this.put(this.API.url + '/data', body, onSuccess, onError);
    },
    // DELETE request
    delete: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        tableName: tableName,
        data: data,
        id: data.id
      };
      if (confirm('Are you sure?')) {
        return this.delete(this.API.url + '/data', body, onSuccess, onError);
      } else {
        if (onError) {
          onError();
        }
      }
      return undefined;
    }
  };
  uploadPath = '/upload';
  playedTextToSpeechResults: TextToSpeechResponse[] = [];


  webcam?: WebcamService;
  loggedIn: boolean = false;
  token: string = '';
  loginData = {
    username: '',
    password: ''
  };
  tokenProtection = false;
  textToSpeechResults?: TextToSpeechResponse[];
  loadTextToSpeechResults = true;
  recognitionModels: WebcamRecognitionModel[] = [];

  constructor() {
    const appUsername = localStorage.getItem('app-username');
    if (appUsername?.length) {
      this.user.username = appUsername;
    } else if(this.user.username) {
      localStorage.setItem('app-username', this.user.username);
    }else{
      this.user.username = 'Anonymous_' + Date.now();
    }
    const username = localStorage.getItem('auth-username');
    const token = localStorage.getItem('auth-token');
    this.tokenProtection = environment.tokenProtection;
    this.token = token ? token : this.tokenProtection ? '' : 'undefined';
    this.loginData.username = username ? username : '';

  }

  login(): void {
    // Make a request to your authentication endpoint with the provided credentials
    if (this.loginData.username && this.loginData.password) {
      this.post(this.API.url + '/auth', this.loginData, (response: any) => {
        this.loggedIn = true;
        this.token = response.token;
        if (this.token) {
          localStorage.setItem('auth-username', this.loginData.username);
          localStorage.setItem('auth-token', this.token);
          this.API.headers.JSON['Authorization'] = `Bearer ${this.token}`;
          this.API.headers.form['Authorization'] = `Bearer ${this.token}`;
        } else {
          this.logout();
        }
      }, () => {
        this.logout();
      });
    }


  }

  logout(): void {
    // Perform any necessary cleanup or request to invalidate the token on the server
    this.loggedIn = false;
    this.token = '';
    localStorage.removeItem('auth-username');
    localStorage.removeItem('auth-token');

    this.API.headers.JSON['Authorization'] = undefined;
    this.API.headers.form['Authorization'] = undefined;
    // Additional logic if needed
  }

  // Perform a GET request
  async get(
    url: string,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    paramUrl = '',
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const timestamp = Date.now(); // Get the current timestamp
      const cacheBusterUrl = `${url}?_=${timestamp}${paramUrl}`; // Append the timestamp as a query parameter
      const response = await fetch(cacheBusterUrl, {
        method: 'GET',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON
      });
      if (response.ok) {
        let result: any = response;
        try {
          result = await response.json();
          if (result.length) {
            const results = [];
            for (const data of result) {
              if (data.id && data.data) {
                const newData = Object.assign({id: data.data && data.data.id ? data.data.id : data.id}, data.data);
                newData.id = data.id;
                newData.data = data.data;
                results.push(newData);
              }
            }
            result = results;
          }
        } catch (e) {
          console.warn('GET request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(`GET request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a PUT request
  async put(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('PUT request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(`PUT request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a POST request
  async post(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const headers = (headerType === 'form' ? this.API.headers.form : this.API.headers.JSON);
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: headerType === 'form' ? body : JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('POST request returned non-JSON data');
        }
        if ((result as any).error) {
          if (onError) {
            onError((result as any).error);
          } else {
            throw new Error(`POST request failed with error: ${(result as any).error}`);
          }
        } else {
          if (onSuccess) {
            onSuccess(result);
          }
        }

        return result;
      } else {
        if (onError) {
          onError();
        } else {
          throw new Error(`POST request failed with status ${response.status}`);
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a PATCH request
  async patch(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('PATCH request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(`PATCH request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a DELETE request
  async delete(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;

        try {
          result = await response.json();
        } catch (e) {
          console.warn('DELETE request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        console.warn('result', result, onSuccess);
      } else {
        throw new Error(`DELETE request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Get APIs
  getAPIs(
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ): Promise<any> {
    return this.API.get('api', onSuccess, onError);
  }

  // Create or update API entry
  addOrUpdateAPIEntry(
    api: Api,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ): Promise<any> {
    if (api.id) {
      return this.API.update('api', api, onSuccess, onError);
    } else {
      return this.API.add('api', api, onSuccess, onError);
    }
  }

  deleteAPI(
    api?: Api,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ): Promise<any> {
    if (!api) {
      return Promise.reject('API is undefined');
    }

    return this.API.delete('api', api, onSuccess, onError);
  }

  uploadFile(
    file: File,
    uploadPath = this.uploadPath,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post(
      this.API.url + '/file?path=' + uploadPath,
      formData,
      onSuccess,
      onError,
      'form'
    );
  }

  getFiles(
    uploadPath = this.uploadPath,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ) {
    return this.get(this.API.url + '/files', onSuccess, onError, '&path=' + uploadPath);
  }

  getFile(
    fileName: string,
    uploadPath = this.uploadPath,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ) {
    return this.get(this.fileSrc(fileName, uploadPath), onSuccess, onError);
  }

  fileSrc(
    fileName: string,
    uploadPath = this.uploadPath,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ) {
    return this.API.url + '/file?path=' + uploadPath + '/' + fileName;
  }

  deleteFile(
    serverFile: ServerFile,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ) {
    if (confirm('Are you sure?')) {
      return this.delete(
        this.API.url +
        '/file?path=' +
        serverFile.directory +
        '&filename=' +
        serverFile.filename,
        {file: serverFile},
        onSuccess,
        onError
      );
    }
    return undefined;
  }

  speechRecognitionValue(speechRecognitionResponse?: SpeechRecognitionResponse) {
    return speechRecognitionResponse && speechRecognitionResponse.text ? speechRecognitionResponse.text : speechRecognitionResponse?.error ? speechRecognitionResponse.error : '';
  }

  download(src: string) {
    const link = document.createElement('a');
    link.href = src;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  isObject(value: any) {
    return typeof value === 'object';
  }

  isArray(value: any) {
    return Array.isArray(value);
  }

  isString(value: any) {
    return typeof value === 'string';
  }

  isNumber(value: any) {
    return typeof value === 'number';
  }

  getObjectResultKeys(result: any) {
    return Object.entries(result).map(([key, value]) => ({key, value}));
  }
}
