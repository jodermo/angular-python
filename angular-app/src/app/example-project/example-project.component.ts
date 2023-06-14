import { Component, OnInit } from '@angular/core';
import {ExampleProjectService} from "./example-project.service";

@Component({
  selector: 'app-example-project',
  templateUrl: './example-project.component.html',
  styleUrls: ['./example-project.component.scss']
})
export class ExampleProjectComponent implements OnInit {

  constructor(public exampleProject: ExampleProjectService) { }

  ngOnInit(): void {
    this.exampleProject.loadData();
  }

}
