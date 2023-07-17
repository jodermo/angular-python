import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExampleProjectComponent} from "./example-project/example-project.component";
import {WelcomePageComponent} from "./welcome-page/welcome-page.component";
import {ApiManagerComponent} from "./api-manager/api-manager.component";
import {FileManagerComponent} from "./file-manager/file-manager.component";
import {WebsocketComponent} from "./websocket/websocket.component";
import {TextToSpeechComponent} from "./text-to-speech/text-to-speech.component";
import {OpenAiComponent} from "./open-ai/open-ai.component";
import {SpeechRecognitionComponent} from "./speech-recognition/speech-recognition.component";
import {WebcamComponent} from "./webcam/webcam.component";
import {MoBotComponent} from "./mo-bot/mo-bot.component";
import {AppGeneratorComponent} from "./app-generator/app-generator.component";

export const AppRoutes: Routes = [
  {
    path: 'open-ai', component: OpenAiComponent, data: {
      showInNavigation: true,
      title: 'OpenAI'
    }
  },
  {
    path: 'api-manager', component: ApiManagerComponent, data: {
      showInNavigation: true,
      title: 'API Manager'
    }
  },
  {
    path: 'file-manager', component: FileManagerComponent, data: {
      showInNavigation: true,
      title: 'File Manager'
    }
  },
  {
    path: 'websocket', component: WebsocketComponent, data: {
      showInNavigation: true,
      title: 'Websocket'
    }
  },
  {
    path: 'text-to-speech', component: TextToSpeechComponent, data: {
      showInNavigation: true,
      title: 'Text To Speech'
    }
  },
  {
    path: 'speech-recognition', component: SpeechRecognitionComponent, data: {
      showInNavigation: true,
      title: 'Speech Recognition'
    }
  },
  {
    path: 'face-recognition', component: WebcamComponent, data: {
      showInNavigation: true,
      title: 'Face Recognition'
    }
  },
  {
    path: 'app-generator', component: AppGeneratorComponent, data: {
      showInNavigation: true,
      title: 'App Generator'
    }
  },
  {
    path: 'mo-bot', component: MoBotComponent, data: {
      showInNavigation: true,
      title: 'MoBot'
    }
  },
  {
    path: 'example-project', component: ExampleProjectComponent, data: {
      showInNavigation: true,
      title: 'Example Project'
    }
  },
  {
    path: '**', component: WelcomePageComponent, data: {
      showInNavigation: false,
      title: 'Welcome',
    }
  },
];


@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
