import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {WelcomePageComponent} from './welcome-page/welcome-page.component';
import {CommonModule} from "@angular/common";
import {ExampleProjectModule} from "./example-project/example-project.module";
import {ApiManagerComponent} from './api-manager/api-manager.component';
import {FormsModule} from "@angular/forms";
import {AppService} from "./app.service";
import {ApiManagerService} from "./api-manager/api-manager.service";
import {FileUploadComponent} from './file-manager/file-upload/file-upload.component';
import {HttpClientModule} from "@angular/common/http";
import {FileManagerComponent} from './file-manager/file-manager.component';
import {FileListComponent} from './file-manager/file-list/file-list.component';
import {FileManagerService} from "./file-manager/file-manager.service";
import {ApiListComponent} from './api-manager/api-list/api-list.component';
import {EditApiComponent} from './api-manager/edit-api/edit-api.component';
import {ApiActionComponent} from './api-manager/api-action/api-action.component';
import {ApiResultComponent} from './api-manager/api-result/api-result.component';
import {ApiInfoComponent} from './api-manager/api-info/api-info.component';
import {WebsocketComponent} from './websocket/websocket.component';
import {WebsocketService} from "./websocket/websocket.service";
import { TextToSpeechComponent } from './text-to-speech/text-to-speech.component';
import {TextToSpeechService} from "./text-to-speech/text-to-speech.service";
import { TextToSpeechButtonComponent } from './text-to-speech/text-to-speech-button/text-to-speech-button.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    ApiManagerComponent,
    FileUploadComponent,
    FileManagerComponent,
    FileListComponent,
    ApiListComponent,
    EditApiComponent,
    ApiActionComponent,
    ApiResultComponent,
    ApiInfoComponent,
    WebsocketComponent,
    TextToSpeechComponent,
    TextToSpeechButtonComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ExampleProjectModule
  ],
  providers: [AppService, FileManagerService, ApiManagerService, WebsocketService, TextToSpeechService],
  exports: [
    FileUploadComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
