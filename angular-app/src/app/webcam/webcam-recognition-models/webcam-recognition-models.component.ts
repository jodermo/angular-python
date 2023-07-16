import { Component, OnInit } from '@angular/core';
import {WebcamComponent} from "../webcam.component";
import {AppService} from "../../app.service";
import {WebcamService} from "../webcam.service";

@Component({
  selector: 'app-webcam-recognition-models',
  templateUrl: './webcam-recognition-models.component.html',
  styleUrls: ['./webcam-recognition-models.component.scss']
})
export class WebcamRecognitionModelsComponent extends WebcamComponent{

  constructor(app: AppService,  webcam: WebcamService) {
    super(app, webcam);
  }

}
