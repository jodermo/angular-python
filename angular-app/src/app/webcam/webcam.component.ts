import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {WebcamRecognitionResult, WebcamService} from "./webcam.service";

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent  extends  AppComponent{

  @Input() showLogin = true;
  @Output() onRecogniseImage = new EventEmitter<WebcamRecognitionResult[]>();

  constructor(app: AppService, public webcam: WebcamService) {
    super(app);
    webcam.init(app);
    webcam.onRecogniseImage((result: WebcamRecognitionResult[])=>{
      this.onRecogniseImage.emit(result);
    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
  }

}
