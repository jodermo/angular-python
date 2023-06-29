import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {AppWidgetsComponent} from "../app-widgets.component";
import hljs from "highlight.js/lib/core";

@Component({
  selector: 'app-code-preview',
  templateUrl: './code-preview.component.html',
  styleUrls: ['./code-preview.component.scss']
})
export class CodePreviewComponent extends AppWidgetsComponent implements AfterViewInit  {
  @ViewChild('codeElement', {static: false}) codeRef?: ElementRef<HTMLElement>;
  @Input() language?: string;
  @Input() code?: string;

  ngAfterViewInit() {
    if (this.codeRef) {
      hljs.highlightElement(this.codeRef.nativeElement);

    }
  }
}
