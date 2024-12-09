import { LottieModule } from 'ngx-lottie';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './offers.routing';
import { CoreModule } from '../core/core.module';

import * as fromContainers from './containers';
import * as fromComponents from './components';
import * as fromDialogs from './dialogs';
import { SidenavModule } from '../sidenav/sidenav.module';
import { UiSwitchModule } from 'ngx-ui-switch';
import { CreateEmailModule } from "../create-email/create-email.module";

@NgModule({
    declarations: [
        ...fromContainers.containers,
        ...fromComponents.components,
        ...fromDialogs.dialogs,
    ],
    entryComponents: [...fromDialogs.dialogs],
    exports: [fromContainers.OffersLogComponent, fromComponents.OffersCollegeCardComponent],
    imports: [
        CommonModule,
        routing,
        SharedModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        LottieModule,
        UiSwitchModule,
        SidenavModule,
        CreateEmailModule
    ]
})
export class OffersModule {}
