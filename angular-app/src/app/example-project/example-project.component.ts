import { Component, OnInit } from '@angular/core';
import {ExampleProjectService} from "./example-project.service";
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";

@Component({
  selector: 'app-example-project',
  templateUrl: './example-project.component.html',
  styleUrls: ['./example-project.component.scss']
})
export class ExampleProjectComponent extends AppComponent implements OnInit {

  constructor(app: AppService, public exampleProject: ExampleProjectService) {
    super(app);
  }

  ngOnInit(): void {
    this.exampleProject.loadData();
  }

}
