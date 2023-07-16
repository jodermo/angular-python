import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FileManagerComponent} from "../file-manager.component";
import {SpeechRecognitionResponse} from "../../speech-recognition/speech-recognition.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent extends FileManagerComponent implements OnInit {

  @Input() showUploadList = false;
  @Input() filePath?: string;
  @Output() onUploadFile = new EventEmitter<any>();

  override ngOnInit(): void {
    super.ngOnInit();
    this.fileManager.onUploadFile((file: any)=>{
      this.onUploadFile.emit(file);
    });
  }
}
