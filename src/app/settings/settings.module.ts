import { SharedModule } from './../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './settings.routing';
import { UiSwitchModule } from 'ngx-ui-switch';

import * as fromContainers from './containers';
import * as fromDialogs from './dialogs';
import { LottieModule } from 'ngx-lottie';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    routing,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    UiSwitchModule,
    LottieModule,
    SidenavModule
  ],
  declarations: [...fromContainers.containers, ...fromDialogs.dialogs],
})
export class SettingsModule {}
