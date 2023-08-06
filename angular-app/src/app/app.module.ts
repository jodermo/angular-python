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
import {TextToSpeechComponent} from './text-to-speech/text-to-speech.component';
import {TextToSpeechService} from "./text-to-speech/text-to-speech.service";
import {TextToSpeechButtonComponent} from './text-to-speech/text-to-speech-button/text-to-speech-button.component';
import {OpenAiComponent} from './open-ai/open-ai.component';
import {OpenAiService} from "./open-ai/open-ai.service";
import {SpeechRecognitionComponent} from './speech-recognition/speech-recognition.component';
import {SpeechRecognitionService} from "./speech-recognition/speech-recognition.service";
import {
  SpeechRecognitionButtonComponent
} from './speech-recognition/speech-recognition-button/speech-recognition-button.component';
import {FilePreviewComponent} from './file-manager/file-preview/file-preview.component';
import {FullscreenFileComponent} from './file-manager/fullscreen-file/fullscreen-file.component';
import {ParsedMessageComponent} from './open-ai/parsed-message/parsed-message.component';
import {AppWidgetsModule} from "./app-widgets/app-widgets.module";
import {ApiResultValueComponent} from './api-manager/api-result/api-result-value/api-result-value.component';
import {WebcamComponent} from './webcam/webcam.component';
import {WebcamService} from "./webcam/webcam.service";
import {LoginComponent} from './login/login.component';
import { MoBotComponent } from './mo-bot/mo-bot.component';
import { WebcamModule} from "ngx-webcam";
import { WebcamPreviewComponent } from './webcam/webcam-preview/webcam-preview.component';
import { WebcamMarkerComponent } from './webcam/webcam-preview/webcam-marker/webcam-marker.component';
import { WebcamRecordComponent } from './webcam/webcam-record/webcam-record.component';
import { WebcamRecognitionModelsComponent } from './webcam/webcam-recognition-models/webcam-recognition-models.component';
import { WebcamRecognitionModelComponent } from './webcam/webcam-recognition-model/webcam-recognition-model.component';
import { SpeechRecognitionInfoComponent } from './speech-recognition/speech-recognition-info/speech-recognition-info.component';
import { AppGeneratorComponent } from './app-generator/app-generator.component';
import { AudioAnalyzerComponent } from './audio-analyzer/audio-analyzer.component';
import { MoBotDisplayComponent } from './mo-bot/mo-bot-display/mo-bot-display.component';
import { MoBotConfigurationComponent } from './mo-bot/mo-bot-configuration/mo-bot-configuration.component';
import { MoBotConfigurationSettingComponent } from './mo-bot/mo-bot-configuration/mo-bot-configuration-setting/mo-bot-configuration-setting.component';
import { MoBotStartViewComponent } from './mo-bot/mo-bot-start-view/mo-bot-start-view.component';
import { WebcamErrorComponent } from './webcam/webcam-error/webcam-error.component';

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
    TextToSpeechButtonComponent,
    OpenAiComponent,
    SpeechRecognitionComponent,
    SpeechRecognitionButtonComponent,
    FilePreviewComponent,
    FullscreenFileComponent,
    ParsedMessageComponent,
    ApiResultValueComponent,
    WebcamComponent,
    LoginComponent,
    MoBotComponent,
    WebcamPreviewComponent,
    WebcamMarkerComponent,
    WebcamRecordComponent,
    WebcamRecognitionModelsComponent,
    WebcamRecognitionModelComponent,
    SpeechRecognitionInfoComponent,
    AppGeneratorComponent,
    AudioAnalyzerComponent,
    MoBotDisplayComponent,
    MoBotConfigurationComponent,
    MoBotConfigurationSettingComponent,
    MoBotStartViewComponent,
    WebcamErrorComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    AppWidgetsModule,
    ExampleProjectModule,
    WebcamModule,
  ],
  providers: [
    AppService,
    FileManagerService,
    ApiManagerService,
    WebsocketService,
    TextToSpeechService,
    SpeechRecognitionService,
    OpenAiService,
    WebcamService
  ],
  exports: [
    FileUploadComponent,
    LoginComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {


}
