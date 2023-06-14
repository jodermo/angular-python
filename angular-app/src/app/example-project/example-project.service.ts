import {Injectable} from '@angular/core';
import {AppService} from "../app.service";

export interface ExampleProjectData {
  id: number;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExampleProjectService extends AppService {
  projectTitle = 'Example Project';
  data?: ExampleProjectData[];
  dataLoaded = false;
  dataLoading = false;


  tableName?: string = 'test';
  value?: string;


  addValue() {
    if (this.value?.length) {
      const newData = {value: this.value} as ExampleProjectData;
      this.addData(newData);
    }
  }

  addData(newData: ExampleProjectData) {
    if(newData.id){
      return this.updateData(newData);
    }
    if (this.tableName?.length) {
      // Make an API request to fetch data
      this.API.add(this.tableName, newData, (result?: any) => {
        this.loadData();
      }, (error?: any) => {
        this.dataLoading = false;
      });
    }
  }

  updateData(data: ExampleProjectData) {
    if (this.tableName?.length) {
      // Make an API request to fetch data
      this.API.update(this.tableName, data, (result?: any) => {
        this.loadData();
        if(this.tableName){
          this.API.getById(this.tableName, data.id);
        }

      }, (error?: any) => {
        this.dataLoading = false;
      });
    }
  }

  deleteData(data: ExampleProjectData) {
    if (this.tableName?.length) {
      // Make an API request to fetch data
      this.API.delete(this.tableName, data, (result?: any) => {
        this.loadData();
      }, (error?: any) => {
        this.dataLoading = false;
      });
    }
  }

  loadData() {
    this.dataLoaded = false;
    this.dataLoading = true;


    if (this.tableName?.length) {
      // Make an API request to fetch data
      this.API.get(this.tableName, (result?: any) => {
        this.data = result as ExampleProjectData[];
        this.dataLoading = false;
        this.dataLoaded = true;
      }, (error?: any) => {
        this.dataLoading = false;
      });
    }

  }

  // Loads data from the API asynchronously using async/await
  async loadDataAsync() {
    this.dataLoaded = false;
    this.dataLoading = true;

    try {
      // Make an API request to fetch data using async/await
      this.data = await this.API.get('data') as ExampleProjectData[];
      this.dataLoaded = true;
    } catch (error) {
      this.dataLoaded = false;
    }

    this.dataLoading = false;
  }

  // Unloads the data by clearing the variables
  unloadData() {
    this.data = undefined;
    this.dataLoaded = false;
  }
}
