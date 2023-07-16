import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WebcamComponent} from "../webcam.component";
import {AppService} from "../../app.service";
import {WebcamRecognitionModel, WebcamService} from "../webcam.service";

@Component({
  selector: 'app-webcam-recognition-model',
  templateUrl: './webcam-recognition-model.component.html',
  styleUrls: ['./webcam-recognition-model.component.scss']
})
export class WebcamRecognitionModelComponent extends WebcamComponent{
  @Input() recognitionModel?: WebcamRecognitionModel;
  @Output() onSaveModel = new EventEmitter<WebcamRecognitionModel[]>();
  newAnnotationName?: string;
  newAnnotationBox = {
    xmin: 25,
    ymin: 25,
    xmax: 175,
    ymax: 175,
  };

  constructor(app: AppService,  webcam: WebcamService) {
    super(app, webcam);
  }

  setFile(file: any) {
    if(this.recognitionModel && this.newAnnotationName){
     this.webcam.setRecognitionModel(this.newAnnotationName, file, this.newAnnotationBox, this.recognitionModel);
    }

  }
}
