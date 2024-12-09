import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Nxt1CenterComponent } from './nxt1-center.component';

const routes: Routes = [
  {
    path: '',
    component: Nxt1CenterComponent,
    data: { page: 'NXT1Center' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
