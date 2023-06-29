import { Component, Input} from '@angular/core';
import * as DOMPurify from 'dompurify';

export interface ParsedText {
  type: 'text' | 'code';
  text?: string;
  code?: string;
  language?: string;
}


@Component({
  selector: 'app-parsed-message',
  templateUrl: 'parsed-message.component.html',
  styleUrls: ['parsed-message.component.scss']
})
export class ParsedMessageComponent {
  @Input() parsedTexts: ParsedText[] = [];

  sanitize(content?: string): string {
    return content ? DOMPurify.sanitize(content) : '';
  }


}
