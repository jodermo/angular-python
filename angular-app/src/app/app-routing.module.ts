import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExampleProjectComponent} from "./example-project/example-project.component";
import {WelcomePageComponent} from "./welcome-page/welcome-page.component";

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


@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
