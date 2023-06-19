import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {Observable} from 'rxjs';
import {AppService} from "../app.service";
import {environment} from "../../environments/environment.prod";

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
    this.socket = io(environment.serverURL);
  }

  startMessageListener(appService = this.app): void {
    this.app = appService;
    this.receiveMessage().subscribe((data: WebsocketMessage) => {
      console.log('receiveMessage', data);
      if (data.roomName) {
        if (!this.chatMessages[data.roomName]) {
          this.chatMessages[data.roomName] = [];
        }
        this.chatMessages[data.roomName].push(data);
      }
    });
  }

  joinRoom(roomName = this.roomName): void {
    this.roomName = roomName;
    this.chatMessages[roomName] = this.chatMessages[roomName] ? this.chatMessages[roomName] : [];
    this.socket.emit('join_room', {roomName: roomName});
    this.joined[roomName] = true;
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

  receiveMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('message', (data: any) => {
        observer.next(data);
      });
    });
  }

  parseDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
