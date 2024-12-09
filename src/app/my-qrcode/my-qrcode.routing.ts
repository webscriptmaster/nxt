import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyQrcodeComponent } from './my-qrcode.component';

const routes: Routes = [
  {
    path: '',
    component: MyQrcodeComponent,
    data: { page: 'MyQrcode' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
