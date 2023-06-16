import { Component } from '@angular/core';
import {FileManagerComponent} from "../file-manager.component";

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent extends FileManagerComponent{

  deleteFile(serverFile: any) {
    this.app.deleteFile(serverFile, ()=>{
      this.fileManager.loadUploadedFiles();
    });
  }
}
