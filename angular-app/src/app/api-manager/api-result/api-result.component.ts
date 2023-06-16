import {Component, Input} from '@angular/core';
import {ApiManagerComponent} from "../api-manager.component";
import {ApiResult} from "../api-result";

@Component({
  selector: 'app-api-result',
  templateUrl: './api-result.component.html',
  styleUrls: ['./api-result.component.scss']
})
export class ApiResultComponent extends ApiManagerComponent {
  @Input() apiResult?: ApiResult;

  errorMessage() {
    if (this.apiResult?.error) {
      let errorMessage = 'Fetch error';
      if (this.apiResult.error instanceof Response) {
        if (this.apiResult.error.status === 0) {
          errorMessage = 'Network error';
        } else {
          errorMessage = `${this.apiResult.error.statusText} (Status code: ${this.apiResult.error.status})`;
        }
      } else if (this.apiResult.error instanceof TypeError && this.apiResult.error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Failed to fetch resource';
      } else {
        errorMessage = this.apiResult.error.message ? this.apiResult.error.message : typeof this.apiResult.error === 'string' ? this.apiResult.error : 'Fetch error';
      }
      return errorMessage;
    }
    return 'No error';
  }


  isTextResult() {
    return this.apiResult?.contentType?.startsWith('text/html');
  }

  isImageResult() {
    return this.apiResult?.contentType?.startsWith('image');
  }

  isObjectResult() {
    return this.apiResult?.contentType?.startsWith('application/json') && !this.apiResult.isArray;
  }

  getObjectResultKeys() {
    return Object.entries(this.apiResult?.result).map(([key, value]) => ({key, value}));
  }

  isOtherResult() {
    return !this.isTextResult() && !this.isImageResult();
  }

}
