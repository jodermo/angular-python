import {Component, Input} from '@angular/core';
import {AppWidgetsComponent} from "../app-widgets.component";

@Component({
  selector: 'app-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss']
})
export class CopyToClipboardComponent extends AppWidgetsComponent {

  @Input() text?: string;
  copyToClipboard() {
    if(this.text){
      const textArea = document.createElement('textarea');
      textArea.value = this.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

  }
}
