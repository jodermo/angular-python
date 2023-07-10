import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {WebcamService} from "./webcam.service";

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent  extends  AppComponent{
  @ViewChild('video', { static: true }) videoElement?: ElementRef;
  @ViewChild('outputVideo', { static: true }) outputVideoElement?: ElementRef;

  constructor(app: AppService, public webcam: WebcamService) {
    super(app);
    webcam.init(app);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  startWebcam(){
    console.log('startWebcam', this.videoElement);
    if(this.videoElement){
      this.webcam.start(this.videoElement.nativeElement, this.outputVideoElement?.nativeElement);
    }
  }


  stopWebcam() {
    if(this.videoElement){
      this.webcam.stop();
    }
  }
}
