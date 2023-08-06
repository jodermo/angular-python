import {Component, Input} from '@angular/core';
import {MoBotComponent} from "../../mo-bot.component";
import {AppService} from "../../../app.service";
import {OpenAiService} from "../../../open-ai/open-ai.service";
import {WebsocketService} from "../../../websocket/websocket.service";
import {TextToSpeechService} from "../../../text-to-speech/text-to-speech.service";
import {WebcamService} from "../../../webcam/webcam.service";
import {
  SpeechRecognitionService,
  SpeechRecognitionSetting
} from "../../../speech-recognition/speech-recognition.service";
import {MoBotService} from "../../mo-bot.service";
import {AppComponent} from "../../../app.component";

@Component({
  selector: 'app-mo-bot-configuration-setting',
  templateUrl: './mo-bot-configuration-setting.component.html',
  styleUrls: ['./mo-bot-configuration-setting.component.scss']
})
export class MoBotConfigurationSettingComponent extends AppComponent {

  @Input() setting?: SpeechRecognitionSetting;

  constructor(
    app: AppService,
    public speechRecognition: SpeechRecognitionService,
    public bot: MoBotService
  ) {
    super(app);
  }


}
