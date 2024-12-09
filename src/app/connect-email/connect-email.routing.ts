import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectEmailComponent } from './connect-email.component';


const routes: Routes = [
  {
    path: '',
    component: ConnectEmailComponent,
    data: { num: 999 },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
