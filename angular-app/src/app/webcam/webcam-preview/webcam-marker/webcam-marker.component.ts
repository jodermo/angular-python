import {Component, Input, OnInit} from '@angular/core';
import {WebcamRecognitionResult} from "../../webcam.service";

@Component({
  selector: 'app-webcam-marker',
  templateUrl: './webcam-marker.component.html',
  styleUrls: ['./webcam-marker.component.scss']
})
export class WebcamMarkerComponent implements OnInit {
  @Input() recognitionResult?: WebcamRecognitionResult;

  constructor() { }

  ngOnInit(): void {
  }

}
