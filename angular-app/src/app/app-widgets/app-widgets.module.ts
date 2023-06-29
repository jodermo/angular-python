import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppWidgetsComponent } from './app-widgets.component';
import { CopyToClipboardComponent } from './copy-to-clipboard/copy-to-clipboard.component';
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import { CodePreviewComponent } from './code-preview/code-preview.component';



@NgModule({
  declarations: [
    AppWidgetsComponent,
    CopyToClipboardComponent,
    CodePreviewComponent
  ],
  exports: [
    CopyToClipboardComponent,
    CodePreviewComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
  ]
})
export class AppWidgetsModule { }
