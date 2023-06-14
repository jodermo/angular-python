# `example-project` Documentation


## To create an project, follow these steps

*Use your project name instead of **"example-project"***

1. Open the app directory inside the angular-app in terminal:
    ```bash
   cd angular-app/src/app/
    ```

2. Create the Project-Module, run:
    ```bash
     ng generate module example-projecta
    ```
3. Register Your Project Module in [/angular-app/src/app/app.module.ts](../angular-app/src/app/app.module.ts):
     ```typescript
      import {ExampleProjectModule} from "./example-project/example-project.module";

      @NgModule({
        ...
        imports: [
            ...
            ExampleProjectModule,
        ],
        ...
      })
      export class AppModule { }

     ```
   
4. Create the Project-Component class (ExampleProjectComponent), run:
    ```bash
     ng generate compoenent example-project
    ```
5. Add Route for Project-Component class (ExampleProjectComponent) in [/angular-app/src/app/app-routing.module.ts](../angular-app/src/app/app-routing.module.ts):
     ```typescript
     export const AppRoutes: Routes = [
        {path: 'example-project', component: ExampleProjectComponent, data: {
            showInNavigation: true,
            title: 'Example Project'
        }},
        {path: '**', component: WelcomePageComponent, data: {
            showInNavigation: false,
            title: 'Welcome',
        }},
    ];

     ```
   
6. Create the Project-Service (optional but suggested), run:
   - A. Create Service:
     ```bash
     ng generate service example-project/example-project
     ```
   - B. If needed, edit example.project.service.ts to extend from AppService (this implements functionality from AppService):
     ```typescript
     import {Injectable} from '@angular/core';
     import {AppService} from "../app.service";

     @Injectable({
         ovidedIn: 'root'
     })
     export class ExampleProjectService extends AppService {
        projectTitle = 'Example Project';

     }

     ```
   - C. Register Service in Module, edit example-project.module.ts:
     ```typescript
      import {NgModule} from '@angular/core';
      import {CommonModule} from '@angular/common';
      import {ExampleProjectComponent} from './example-project.component';
      import {ExampleProjectService} from "./example-project.service";

      @NgModule({
          eclarations: [
              ExampleProjectComponent
          ],
          imports: [
              CommonModule
          ],
          providers: [
              ExampleProjectService
          ]
      })
      export class ExampleProjectModule {
      }

     ```
   - D. Load/Provide AppService in example-project.component.ts
     ```typescript
     import { Component, OnInit } from '@angular/core';
     import {ExampleProjectService} from "./example-project.service";

     @Component({
         selector: 'app-example-project',
         templateUrl: './example-project.component.html',
         styleUrls: ['./example-project.component.scss']
     })
     export class ExampleProjectComponent implements OnInit {

         constructor(public exampleProject: ExampleProjectService) { }

         ngOnInit(): void {
         }

     }
     ```
   - E. Now you can use "exampleService" globally in every component that extends from ExampleProjectComponent or caontains "exampleProject: ExampleProjectService" in the constructor, e.g.:
     ```html
     <div class="example-project">
        <h1>{{exampleProject.projectTitle}}</h1>
     </div>
     ```
## Extend your project Service from AppService 

### Some example code for communicating with the python server

This is an example project template that demonstrates data management functionality. It consists of a form and a
table. The form allows you to enter a table name and a value. You can load data, add new values to the table, and
update or delete existing values. The table displays the data retrieved from the server. Each row represents a
record with an ID and a corresponding value. You can edit the values in the table and perform update and delete
operations on each record. The template provides a user-friendly interface for managing data efficiently.


#### ExampleProjectData 'example-project.service.ts'

File: [angular-app/src/app/example-project/example-project.service.ts](../angular-app/src/app/example-project/example-project.service.ts)
```typescript
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
```

#### ExampleProjectComponent 'example-project.component.ts'

File: [angular-app/src/app/example-project/example-project.component.t](../angular-app/src/app/example-project/example-project.component.ts)
```typescript
import { Component, OnInit } from '@angular/core';
import {ExampleProjectService} from "./example-project.service";

@Component({
    selector: 'app-example-project',
    templateUrl: './example-project.component.html',
    styleUrls: ['./example-project.component.scss']
})
export class ExampleProjectComponent implements OnInit {

    constructor(public exampleProject: ExampleProjectService) { }

    ngOnInit(): void {
        this.exampleProject.loadData();
    }

}
```

#### ExampleProjectComponent Template 'example-project.component.html'

File: [angular-app/src/app/example-project/example-project.component.html](../angular-app/src/app/example-project/example-project.component.html)
```html
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
```

## Documentations
- [README.md](../README.md)
- [Angular Deploayment](./angular-deployment.md)
- [AppService Documentation](./app.service.ts.md)
