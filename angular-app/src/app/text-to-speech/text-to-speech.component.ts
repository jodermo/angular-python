import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {TextToSpeechResponse, TextToSpeechService} from "./text-to-speech.service";

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.scss']
})
export class TextToSpeechComponent extends AppComponent implements OnInit, OnChanges {


  @Input() tableName?: string;
  @Input() id?: number;
  @Input() text?: string;
  @Input() textToSpeechResult?: TextToSpeechResponse[];

  data?: TextToSpeechResponse[];
  loading = false;
  ready = false;

  constructor(app: AppService, public textToSpeech: TextToSpeechService) {
    super(app);
    textToSpeech.init(app);
  }

  ngOnInit() {
    this.loadData();
    this.ready = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadData();
  }

  loadData() {

    this.loading = true;
    this.data = [];

    if (this.tableName && this.id) {
      const data = this.textToSpeech.tableData(this.tableName, this.id);
      if (data?.length) {
        this.data = this.data.concat(data);
      }
    }

    if (!this.data?.length && this.text) {
      const data = this.textToSpeech.textData(this.text);
      if (data?.length) {
        this.data = this.data.concat(data);
      }
    }

    setTimeout(() => {
      this.loading = false;
    }, 0);
  }


}
