import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {AppService} from "../../app.service";
import {WebcamService} from "../webcam.service";
import {WebcamComponent as WebcamComp, WebcamImage} from "ngx-webcam";
import {WebcamComponent} from "../webcam.component";

@Component({
  selector: 'app-webcam-preview',
  templateUrl: './webcam-preview.component.html',
  styleUrls: ['./webcam-preview.component.scss']
})
export class WebcamPreviewComponent extends WebcamComponent implements AfterViewInit {
  @ViewChild('webcamComponent', {static: true}) webcamComponent?: WebcamComp;
  facingMode: string = 'user';  // Set front camera
  allowCameraSwitch = false;

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};
    if (this.facingMode && this.facingMode !== '') {
      result.facingMode = {ideal: this.facingMode};
    }
    return result;
  }

  constructor(app: AppService, webcam: WebcamService) {
    super(app, webcam);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.webcamComponent) {
      this.webcam.webcamComponent = this.webcamComponent;
      this.webcam.webcamComponent.ngAfterViewInit();
    }
  }

  start() {
    if (this.webcamComponent) {
      this.webcam.webcamComponent = this.webcamComponent;
    }
    this.webcam.start(this.webcam.video, undefined, this.recognition, () => {
      console.log('webcam start', this.webcam.video, this.webcamComponent);
    });
  }

  stop() {
    this.webcam.stop();
  }

  handleImage(webcamImage: WebcamImage) {
    this.webcam.handleImage(webcamImage);
  }

  startRecord() {
    this.webcam.startRecord();
  }

  stopRecord() {
    this.webcam.stopRecord();
  }

  startRecognition() {
    this.webcam.startRecognition();
  }

  stopRecognition() {
    this.webcam.stopRecognition();
  }

  captureImage() {
    this.webcam.captureImage();
  }

  webcamError(error?: any) {
    this.webcam.onError(error);
  }
}
