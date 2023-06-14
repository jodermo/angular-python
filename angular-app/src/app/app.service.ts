import { Injectable } from '@angular/core';
import {observable} from "rxjs";

// Define available header types
export const HeaderTypes = ['JSON', 'form'];
// Define a union type for header types
export type HeaderType = typeof HeaderTypes[number];

@Injectable({
  providedIn: 'root'
})
export class AppService {
  // API configuration
  API = {
    url: 'http://localhost:8000', // API base URL
    headers: {
      JSON: {
        'Content-Type': 'application/json' // JSON headers
      },
      form: {
        'Content-Type': 'application/x-www-form-urlencoded' // Form headers
      }
    },
    headerTypes: HeaderTypes, // Available header types
    // GET request
    get: async (
      tableName: string,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      return this.get(this.API.url + '/data?tableName=' + tableName, onSuccess, onError);
    },
    getById: async (
      tableName: string,
      id: number,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      return this.get(this.API.url + '/data?tableName=' + tableName + '&id=' + id, onSuccess, onError);
    },
    // POST request
    add: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        tableName: tableName,
        data: data
      };
      return this.post(this.API.url + '/data', body, onSuccess, onError);
    },
    // PUT request
    update: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        id: data.id,
        tableName: tableName,
        data: data
      };
      return this.put(this.API.url + '/data', body, onSuccess, onError);
    },
    // DELETE request
    delete: async (
      tableName: string,
      data: any,
      onSuccess?: (result?: any) => void,
      onError?: (error?: any) => void
    ): Promise<any> => {
      const body = {
        tableName: tableName,
        data: data
      };
      return this.delete(this.API.url + '/data', body, onSuccess, onError);
    }
  };

  constructor() {}

  // Perform a GET request
  async get(
    url: string,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const timestamp = Date.now(); // Get the current timestamp
      const cacheBusterUrl = `${url}&_=${timestamp}`; // Append the timestamp as a query parameter
      const response = await fetch(cacheBusterUrl, {
        method: 'GET',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON
      });
      if (response.ok) {
        let result: any = response;
        try {
          result = await response.json();
          if(result.length){
            const results = [];
            for(let data of result){
              if(data.id && data.data){
                results.push(Object.assign({id: data.id}, data.data));
              }
            }
            result = results;
          }
        } catch (e) {
          console.warn('GET request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(`GET request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a PUT request
  async put(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('PUT request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(`PUT request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a POST request
  async post(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('POST request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(`POST request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a PATCH request
  async patch(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('PATCH request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(`PATCH request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }

  // Perform a DELETE request
  async delete(
    url: string,
    body: any,
    onSuccess?: (result?: any) => void,
    onError?: (error?: any) => void,
    headerType: HeaderType = 'JSON'
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headerType === 'form' ? this.API.headers.form : this.API.headers.JSON,
        body: JSON.stringify(body)
      });
      if (response.ok) {
        let result = response;
        try {
          result = await response.json();
        } catch (e) {
          console.warn('DELETE request returned non-JSON data');
        }
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(`DELETE request failed with status ${response.status}`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
  }
}
