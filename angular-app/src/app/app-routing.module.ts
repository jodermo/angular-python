import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExampleProjectComponent} from "./example-project/example-project.component";
import {WelcomePageComponent} from "./welcome-page/welcome-page.component";
import {ApiManagerComponent} from "./api-manager/api-manager.component";
import {FileManagerComponent} from "./file-manager/file-manager.component";

export const AppRoutes: Routes = [
  {
    path: 'api-manager', component: ApiManagerComponent, data: {
      showInNavigation: true,
      title: 'API Manager'
    }
  },
  {
    path: 'file-manager', component: FileManagerComponent, data: {
      showInNavigation: true,
      title: 'File Manager'
    }
  },
  {
    path: 'example-project', component: ExampleProjectComponent, data: {
      showInNavigation: true,
      title: 'Example Project'
    }
  },
  {
    path: '**', component: WelcomePageComponent, data: {
      showInNavigation: false,
      title: 'Welcome',
    }
  },
];


@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
