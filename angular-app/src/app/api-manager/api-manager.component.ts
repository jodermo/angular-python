import {Component, OnInit} from '@angular/core';
import {AppComponent} from "../app.component";
import {Api, AppService} from "../app.service";
import {ApiManagerService} from "./api-manager.service";

@Component({
  selector: 'app-api-manager',
  templateUrl: './api-manager.component.html',
  styleUrls: ['./api-manager.component.scss']
})
export class ApiManagerComponent extends AppComponent implements OnInit {



  constructor(app: AppService, public apiManager: ApiManagerService) {
    super(app);
  }

  ngOnInit() {
    this.apiManager.loadApis(this.app);
  }



}
