import { CoreModule } from './../core/core.module';
import { SidenavModule } from './../sidenav/sidenav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './home.routing';

import * as fromContainers from './containers';
import * as fromDialogs from './dialogs';
import { OffersModule } from '../offers/offers.module';
import { MaterialModule } from '../shared/material.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [CommonModule, routing, SidenavModule, CoreModule, OffersModule, MaterialModule, MatSlideToggleModule],
  declarations: [...fromContainers.containers, ...fromDialogs.dialogs],
})
export class HomeModule {}
