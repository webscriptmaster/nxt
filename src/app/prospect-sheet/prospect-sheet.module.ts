import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fromContainers from './containers';
import { routing } from './prospect-sheet.routing';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [CommonModule, routing, SharedModule, CoreModule, SidenavModule],
  declarations: [...fromContainers.containers],
  exports: [],
})
export class ProspectSheetModule {}
