import { Component, OnInit } from '@angular/core';
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";
import {FileManagerService} from "./file-manager.service";

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent extends AppComponent implements OnInit {

  constructor(app: AppService, public fileManager: FileManagerService) {
    super(app);
    fileManager.init(app);
  }

  ngOnInit(): void {
  }

}
