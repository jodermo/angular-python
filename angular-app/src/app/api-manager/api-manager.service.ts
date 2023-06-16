import { Injectable } from '@angular/core';
import {Api, AppService} from "../app.service";

@Injectable({
  providedIn: 'root'
})
export class ApiManagerService {

  api?: Api;
  editApi?: Api;
  apis?: Api[];
  private app?: AppService;

  constructor() { }



  // View APIs
  loadApis(app = this.app): void {
    this.app = app;

    this.app?.getAPIs(
      (result: any) => {
        // Handle success
        console.log("APIs:", result);
        this.apis = result; // Assign the retrieved APIs to the "apis" property
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


}
