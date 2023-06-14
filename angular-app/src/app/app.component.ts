import { Component } from '@angular/core';
import {AppService} from "./app.service";
import {AppRoutes} from "./app-routing.module";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  routes = AppRoutes;

  constructor(public app: AppService) {
  }
}
