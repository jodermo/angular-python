import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import {CommonModule} from "@angular/common";
import {ExampleProjectModule} from "./example-project/example-project.module";

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ExampleProjectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
