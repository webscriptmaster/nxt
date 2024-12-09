import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmailComponent } from './containers';

const routes: Routes = [
  {
    path: '',
    component: CreateEmailComponent,
    data: { num: 999 },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
