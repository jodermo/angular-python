import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExampleProjectComponent} from './example-project.component';
import {ExampleProjectService} from "./example-project.service";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    ExampleProjectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [
    ExampleProjectService
  ]
})
export class ExampleProjectModule {
}
