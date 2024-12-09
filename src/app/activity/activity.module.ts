import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routing } from './activity.routing';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { ActivityComponent } from './activity.component';
import { OffersModule } from '../offers/offers.module';

@NgModule({
  declarations: [ActivityComponent],
  imports: [
    CommonModule,
    FormsModule,
    routing,
    CoreModule,
    SharedModule,
    SidenavModule,
    OffersModule
  ]
})
export class ActivityModule { }
