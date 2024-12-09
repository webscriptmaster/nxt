import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './recruiting-info.routing';
import { CoreModule } from '../core/core.module';
import { RecruitingInfoComponent } from './recruiting-info.component';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [CommonModule, routing, CoreModule, SidenavModule],
  declarations: [RecruitingInfoComponent],
  exports: [],
})
export class RecruitingInfoModule {}
