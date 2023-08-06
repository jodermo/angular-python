import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppService} from "../../app.service";
import {TextToSpeechService} from "../../text-to-speech/text-to-speech.service";
import {MoBotService} from "../mo-bot.service";
import {WebcamComponent} from "../../webcam/webcam.component";
import {AppComponent} from "../../app.component";
import {OpenAiService} from "../../open-ai/open-ai.service";

@Component({
  selector: 'app-mo-bot-configuration',
  templateUrl: './mo-bot-configuration.component.html',
  styleUrls: ['./mo-bot-configuration.component.scss']
})
export class MoBotConfigurationComponent extends AppComponent {
  @ViewChild('webcamElement', {static: false}) webcamElement?: ElementRef<WebcamComponent>;
  newSettingName?: string;


  constructor(
    app: AppService,
    public textToSpeech: TextToSpeechService,
    public openAi: OpenAiService,
    public bot: MoBotService
  ) {
    super(app);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.bot.webcamElement = this.webcamElement;
  }

  ngOnInit(): void {
  }

}
