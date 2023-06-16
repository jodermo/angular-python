import {Injectable} from '@angular/core';
import {Api, AppService} from "../app.service";
import {ApiResult} from "./api-result";



@Injectable({
  providedIn: 'root'
})
export class ApiManagerService {

  api?: Api;
  editApi?: Api;
  apis?: Api[];
  private app?: AppService;
  initialized = false;

  results: ApiResult[] = [];

  selectedResult?: ApiResult;

  constructor() {
  }


  // View APIs
  loadApis(app = this.app): void {
    this.app = app;

    this.app?.getAPIs(
      (result: any) => {
        this.apis = result;
        this.api = undefined;
      },
      (error: any) => {
        // Handle error
        console.error("Error:", error);
      }
    );
  }


  newApi() {
    this.editApi = {} as Api;
  }


  callApi(api?: Api) {
    if (api) {
      const result = new ApiResult(this, api);
      this.selectedResult = result;
      this.results.push(result);
    }
  }

  init(app: AppService) {
    if (!this.initialized) {
      this.initialized = true;
      this.app = app;
      this.loadApis(this.app);
    }

  }
}
