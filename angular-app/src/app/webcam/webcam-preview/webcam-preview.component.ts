import { Component } from '@angular/core';
import {WebcamComponent} from "../webcam.component";
import {AppService} from "../../app.service";
import {WebcamService} from "../webcam.service";

@Component({
  selector: 'app-webcam-preview',
  templateUrl: './webcam-preview.component.html',
  styleUrls: ['./webcam-preview.component.scss']
})
export class WebcamPreviewComponent extends WebcamComponent{

  constructor(app: AppService,  webcam: WebcamService) {
    super(app, webcam);
  }

}
