import {Component, Input} from '@angular/core';
import {FileManagerComponent} from "../file-manager.component";
import {ServerFile} from "../file-manager.service";

@Component({
  selector: 'app-fullscreen-file',
  templateUrl: './fullscreen-file.component.html',
  styleUrls: ['./fullscreen-file.component.scss']
})
export class FullscreenFileComponent extends FileManagerComponent {

  @Input() file?: ServerFile;

}
