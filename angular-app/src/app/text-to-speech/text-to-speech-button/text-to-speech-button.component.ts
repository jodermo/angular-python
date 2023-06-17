import {Component, Input, OnInit} from '@angular/core';
import {TextToSpeechComponent} from "../text-to-speech.component";
import {TextToSpeechLanguages} from "../text-to-speech.service";

@Component({
  selector: 'app-text-to-speech-button',
  templateUrl: './text-to-speech-button.component.html',
  styleUrls: ['./text-to-speech-button.component.scss']
})
export class TextToSpeechButtonComponent extends TextToSpeechComponent implements OnInit{
  @Input() text?: string;
  @Input() language = 'en';
  @Input() autoplay = false;
  languages =  TextToSpeechLanguages;

  ngOnInit() {
    if(this.autoplay && this.text){
      this.textToSpeech.makeFileAndPlay(this.text, this.language);
    }
  }
}
