import {AfterViewInit, Component} from '@angular/core';
import {AppService} from "./app.service";
import {AppRoutes} from "./app-routing.module";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  routes = AppRoutes;

  constructor(public app: AppService) {
  }

  ngAfterViewInit() {


  }


}
