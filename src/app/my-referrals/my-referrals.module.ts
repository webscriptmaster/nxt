import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './my-referrals.routing';
import { SharedModule } from '../shared/shared.module';
import { MyReferralsPageComponent } from './my-referrals-page/my-referrals-page.component';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    SidenavModule
  ],
  declarations: [MyReferralsPageComponent],
})
export class MyReferralsModule {}
