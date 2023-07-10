import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExampleProjectComponent} from './example-project.component';
import {ExampleProjectService} from "./example-project.service";
import {FormsModule} from "@angular/forms";
import {AppModule} from "../app.module";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";
import {AppRoutingModule} from "../app-routing.module";


@NgModule({
  declarations: [
    ExampleProjectComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,

  ],
  providers: [
    ExampleProjectService
  ]
})
export class ExampleProjectModule {
}
