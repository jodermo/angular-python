import {Component, Input} from '@angular/core';
import {ApiManagerComponent} from "../../api-manager.component";

@Component({
  selector: 'app-api-result-value',
  templateUrl: './api-result-value.component.html',
  styleUrls: ['./api-result-value.component.scss']
})
export class ApiResultValueComponent extends ApiManagerComponent {
  @Input() value?: any;


}
