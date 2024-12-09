import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DraftsComponent } from './containers';

const routes: Routes = [
  {
    path: '',
    component: DraftsComponent,
    data: { page: 'Drafts' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
