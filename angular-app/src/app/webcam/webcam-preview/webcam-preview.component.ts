import { Component } from '@angular/core';
import {WebcamComponent} from "../webcam.component";
import {AppService} from "../../app.service";
import {WebcamService} from "../webcam.service";
import {WebcamImage} from "ngx-webcam";

@Component({
  selector: 'app-webcam-preview',
  templateUrl: './webcam-preview.component.html',
  styleUrls: ['./webcam-preview.component.scss']
})
export class WebcamPreviewComponent extends WebcamComponent{

  constructor(app: AppService,  webcam: WebcamService) {
    super(app, webcam);
  }

  start() {
    this.webcam.start();
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


}