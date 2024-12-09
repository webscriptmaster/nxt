import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './refer.routing';
import { SharedModule } from '../shared/shared.module';
import { ReferPageComponent } from './refer-page/refer-page.component';
import { LottieModule } from 'ngx-lottie';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    LottieModule,
    ShareButtonsModule,
    ShareIconsModule,
    SidenavModule
  ],
  declarations: [ReferPageComponent],
})
export class ReferModule {}
