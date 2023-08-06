import {Component} from '@angular/core';
import {AppComponent} from "../../app.component";
import {AppService} from "../../app.service";
import {TextToSpeechService} from "../../text-to-speech/text-to-speech.service";
import {MoBotService} from "../mo-bot.service";

@Component({
  selector: 'app-mo-bot-start-view',
  templateUrl: './mo-bot-start-view.component.html',
  styleUrls: ['./mo-bot-start-view.component.scss']
})
export class MoBotStartViewComponent  extends AppComponent {
  config = false;

  constructor(
    app: AppService,
    public textToSpeech: TextToSpeechService,
    public bot: MoBotService
  ) {
    super(app);
  }



  startBot() {
    this.bot.start();

  }

}
