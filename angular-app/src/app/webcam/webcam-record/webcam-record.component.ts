import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {WebcamComponent} from "../webcam.component";
import {AppService} from "../../app.service";
import {WebcamService} from "../webcam.service";

@Component({
  selector: 'app-webcam-record',
  templateUrl: './webcam-record.component.html',
  styleUrls: ['./webcam-record.component.scss']
})
export class WebcamRecordComponent extends WebcamComponent implements AfterViewInit{
  @ViewChild('video', { static: true }) videoElement?: ElementRef;
  @ViewChild('outputVideo', { static: true }) outputVideoElement?: ElementRef;

  constructor(app: AppService,  webcam: WebcamService) {
    super(app, webcam);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.initWebcam();
  }

  initWebcam(){
    console.log('startWebcam', this.videoElement, this.outputVideoElement);
    if(this.videoElement){
      this.webcam.setVideoElements(this.videoElement.nativeElement, this.outputVideoElement?.nativeElement);
    }
  }



}
