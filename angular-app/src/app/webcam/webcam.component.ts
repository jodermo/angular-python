import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {WebcamRecognitionResult, WebcamService} from "./webcam.service";

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent extends AppComponent implements OnInit {

  @Input() controls = true;
  @Input() autostart = false;
  @Input() recognition = false;
  @Input() showLogin = true;
  @Output() onRecogniseImage = new EventEmitter<WebcamRecognitionResult[]>();

  constructor(app: AppService, public webcam: WebcamService) {
    super(app);
    webcam.init(app);
    webcam.onRecogniseImage((result: WebcamRecognitionResult[]) => {
      this.onRecogniseImage.emit(result);
    });
  }

  ngOnInit() {
    if(this.autostart){
      this.webcam.start();
    }
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.recognition && this.webcam.started) {
      this.webcam.startRecognition();
    }
  }

}
