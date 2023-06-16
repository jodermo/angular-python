import {Api} from "../app.service";
import {ApiManagerService} from "./api-manager.service";

export class ApiResult {
  result?: any;
  loading = false;
  ready = false;
  error?: any;
  contentType?: any;
  resultFile?: any;
  isArray = false;

  constructor(private apiManager?: ApiManagerService, public api?: Api) {
    this.callApi();
  }

  async callApi(
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void
  ) {
    if (this.api) {
      this.error = undefined;
      this.loading = true;
      this.isArray = false;
      const headers: any = {};
      if (this.api.headers) {
        for (const header of this.api.headers) {
          headers[header.key] = header.value;
        }
      }

      try {
        this.result = await fetch(this.api.api_url, {
          method: this.api.method,
          headers: headers,
          body: JSON.stringify(this.api.body),
        }).then(result => {
          try {
            result = this.result.json();
            this.isArray = Array.isArray(this.result);
          } catch (e) {
            // do nothing
          }
          return result;
        });


        this.contentType = this.result.headers.get("content-type");
        if (!this.result.ok) {
          throw new Error(`${this.result.status} ${this.result.statusText}`);
        }
        if (this.contentType?.startsWith("text")) {
          this.result = await this.result.text();
        }else{
          try{
            this.result = await this.result.json();
          }catch (e) {
            // do nothing
          }
        }
        this.resultFile = this.result.blob ? await this.result.blob() : undefined;
        if (onSuccess) {
          onSuccess(this.result);
        }
      } catch (error: any) {
        this.error = {
          message: error.message,
          status: error.name,
          statusText: error.message,
        };
        this.result = error;
        if (onError) {
          onError(this.error);
        }
      }

      this.loading = false;
    }
    this.ready = true;
  }

}
