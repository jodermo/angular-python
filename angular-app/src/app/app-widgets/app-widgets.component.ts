import { Component, OnInit } from '@angular/core';
import {AppWidgetsService} from "./app-widgets.service";

@Component({
  selector: 'app-app-widgets',
  template: '',
})
export class AppWidgetsComponent implements OnInit {

  constructor(public widgets: AppWidgetsService) { }

  ngOnInit(): void {
  }

}
