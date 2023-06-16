import {Component, Input} from '@angular/core';
import {FileManagerComponent} from "../file-manager.component";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent extends FileManagerComponent{

  @Input() showUploadList = false;
}
