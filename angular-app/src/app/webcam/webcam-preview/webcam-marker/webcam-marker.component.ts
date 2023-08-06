import {Component, Input, OnInit} from '@angular/core';
import {WebcamRecognitionResult, WebcamService} from "../../webcam.service";

@Component({
  selector: 'app-webcam-marker',
  templateUrl: './webcam-marker.component.html',
  styleUrls: ['./webcam-marker.component.scss']
})
export class WebcamMarkerComponent implements OnInit {
  @Input() recognitionResult?: WebcamRecognitionResult;
  @Input() invertX = false;
  @Input() invertY = false;
  @Input() index  = 0;
  constructor(public webcam: WebcamService) { }

  ngOnInit(): void {
  }

}
