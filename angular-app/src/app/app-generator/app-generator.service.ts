import {Injectable} from '@angular/core';
import {WebsocketService} from "../websocket/websocket.service";
import {AppService} from "../app.service";

export interface AppGeneratorBuildMessage {
  isError: boolean;
  done: boolean;
  message: string;
  time: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppGeneratorService {
  app?: AppService;
  websocket?: WebsocketService;

  generatorMessages: AppGeneratorBuildMessage[] = [];
  updateMessages: AppGeneratorBuildMessage[] = [];
  errorMessages: AppGeneratorBuildMessage[] = [];
  isBuilding = false;

  constructor() {
  }

  init(app = this.app, websocket = this.websocket) {
    this.app = app;
    this.websocket = websocket;
    if (this.websocket) {
      this.websocket.on('server-build', (data: any) => {
        console.log('this.websocket server-build', data);
        this.onServerBuildMessage(data);
      });
      this.websocket.logMessage();
    }

  }

  buildApp(onSuccess?: (result?: any) => void, onError?: (error?: any) => void) {
    if (this.app && this.websocket) {
      this.isBuilding = true;
      this.generatorMessages = [];
      // this.app.post(this.app.API.url + '/build', {}, onSuccess, onError);
      this.websocket.emit('server-build', {message: 'start-build'});
    }
  }

  private onServerBuildMessage(data: AppGeneratorBuildMessage) {
    console.log('onServerBuildMessage', data);
    if (data.done) {
      this.isBuilding = false;
    } else {
      this.isBuilding = true;
    }
    if (data.isError) {
      this.errorMessages.push(data);
    } else {
      this.updateMessages.push(data);
    }
    this.generatorMessages.push(data);
  }
}
