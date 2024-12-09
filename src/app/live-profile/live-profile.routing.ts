import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveProfileComponent } from './live-profile.component';

const routes: Routes = [
  {
    path: ':code/:emailCode',
    component: LiveProfileComponent,
    data: { page: 'LiveProfile' },
  },
  {
    path: ':code',
    component: LiveProfileComponent,
    data: { page: 'LiveProfile' },
  },
  {
    path: ':code/:profileId',
    component: LiveProfileComponent,
    data: { page: 'LiveProfile' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
