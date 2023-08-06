import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {Observable} from 'rxjs';
import {AppService} from "../app.service";
import {environment} from "../../environments/environment";

export interface WebsocketMessage {
  id: number;
  date: number;
  roomName: string;
  user?: any;
  subject?: string;
  message?: string;
}


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket: Socket;
  chatMessages: any = {};
  joined: any = {};
  roomName = 'room1';
  newMessage?: string;
  private app?: AppService;


  constructor() {
    this.socket = io(environment.websocketUrl);
  }

  init(appService = this.app) {
    this.app = appService;
    this.loadData();
  }

  loadData(roomName = this.roomName) {
    if (this.app) {
      this.app.API.get('websocket-message', (results: any) => {
        this.chatMessages[roomName] = results?.length ? results : this.chatMessages[roomName] ? this.chatMessages[roomName] : undefined;
      });
    }
  }

  startMessageListener(appService = this.app): void {
    this.app = appService;
    this.receiveMessage().subscribe((data: WebsocketMessage) => {
      if (data.roomName) {
        if (!this.chatMessages[data.roomName]) {
          this.chatMessages[data.roomName] = [];
        }
        this.chatMessages[data.roomName].push(data);
      }
    });
    this.logMessage().subscribe((data: any) => {
      console.log('server-log', data);
    });
    this.errorMessage().subscribe((data: any) => {
      console.log('server-error', data);
    });
    this.warningMassage().subscribe((data: any) => {
      console.log('server-warning', data);
    });
  }

  joinRoom(roomName = this.roomName): void {
    this.roomName = roomName;
    this.chatMessages[roomName] = this.chatMessages[roomName] ? this.chatMessages[roomName] : [];
    this.socket.emit('join_room', {roomName: roomName});
    this.joined[roomName] = true;
    this.loadData(roomName);
  }

  leaveRoom(roomName = this.roomName): void {
    this.socket.emit('leave_room', {roomName: roomName});
    this.joined[roomName] = false;
  }

  closeRoom(roomName = this.roomName): void {
    this.chatMessages[roomName] = undefined;
    this.socket.emit('close_room', {roomName: roomName});
    this.joined[roomName] = false;
  }

  sendMessage(roomName = this.roomName, message = this.newMessage): void {
    if (message?.length) {
      this.socket.emit('message', {roomName: roomName, message: message, user: this.app?.user});
      if (this.newMessage === message) {
        this.newMessage = undefined;
      }
    }
  }

  appMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('app', (data: any) => {
        console.log('appMessage', data);
        observer.next(data);
      });
    });
  }

  receiveMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('message', (data: any) => {
        console.log('receiveMessage', data);
        observer.next(data);
      });
    });
  }

  logMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('log', (data: any) => {
        console.log('logMessage', data);
        observer.next(data);
      });
    });
  }

  errorMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('error', (data: any) => {
        console.log('errorMessage', data);
        observer.next(data);
      });
    });
  }

  warningMassage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('warning', (data: any) => {
        console.log('warningMassage', data);
        observer.next(data);
      });
    });
  }
  parseDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }


  emit(ev: string, args: any) {
    return this.socket.emit(ev, args);
  }

  on(ev: string, listener: (data: any) => void) {
    return this.socket.on(ev, (data: any) => {
      listener(data);
      return data;
    });
  }
}
