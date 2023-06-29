import {Component, Input} from '@angular/core';
import {FileManagerComponent} from "../file-manager.component";
import {ServerFile} from "../file-manager.service";

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent extends FileManagerComponent {

  @Input() file?: ServerFile;

}
