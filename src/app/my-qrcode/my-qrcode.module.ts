import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './my-qrcode.routing';
import { MyQrcodeComponent } from './my-qrcode.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LottieModule } from 'ngx-lottie';
import { UiSwitchModule } from 'ngx-ui-switch';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  declarations: [MyQrcodeComponent],
  imports: [
    CommonModule,
    SharedModule,
    routing,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    UiSwitchModule,
    LottieModule,
    SidenavModule,
    QrCodeModule,
  ],
})
export class MyQrcodeModule {}
