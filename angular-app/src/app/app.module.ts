import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import {CommonModule} from "@angular/common";
import {ExampleProjectModule} from "./example-project/example-project.module";
import { ApiManagerComponent } from './api-manager/api-manager.component';
import {FormsModule} from "@angular/forms";
import {AppService} from "./app.service";
import {ApiManagerService} from "./api-manager/api-manager.service";
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    ApiManagerComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ExampleProjectModule
  ],
  providers: [AppService, ApiManagerService],
  exports: [
    FileUploadComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
