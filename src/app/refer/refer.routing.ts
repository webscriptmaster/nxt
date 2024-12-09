import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReferPageComponent } from './refer-page/refer-page.component';


const routes: Routes = [
  {
    path: '',
    component: ReferPageComponent,
    data: { page: 'Refer' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
