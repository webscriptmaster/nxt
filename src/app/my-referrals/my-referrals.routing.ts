import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyReferralsPageComponent } from './my-referrals-page/my-referrals-page.component';


const routes: Routes = [
  {
    path: '',
    component: MyReferralsPageComponent,
    data: { page: 'MyReferrals' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
