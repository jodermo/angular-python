import {Component, Input} from '@angular/core';
import {ApiManagerComponent} from "../api-manager.component";
import {Api} from "../../app.service";

@Component({
  selector: 'app-api-info',
  templateUrl: './api-info.component.html',
  styleUrls: ['./api-info.component.scss']
})
export class ApiInfoComponent extends ApiManagerComponent {
  @Input() api?: Api;

  deleteApi(api = this.api) {
    if(api){
      this.app.deleteAPI(api, ()=>{
        this.apiManager.loadApis();
      });
    }

  }
}
