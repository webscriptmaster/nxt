import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecruitingInfoComponent } from './recruiting-info.component';

const routes: Routes = [
  {
    path: '',
    component: RecruitingInfoComponent,
    data: { page: 'RecruitingInfo' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
