import {Component, Input} from '@angular/core';
import {ApiManagerComponent} from "../api-manager.component";
import {Api} from "../../app.service";

@Component({
  selector: 'app-api-action',
  templateUrl: './api-action.component.html',
  styleUrls: ['./api-action.component.scss']
})
export class ApiActionComponent extends ApiManagerComponent {
  @Input() api?: Api;

}
