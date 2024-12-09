import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './nxt1-center.routing';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { Nxt1CenterComponent } from './nxt1-center.component';

@NgModule({
  imports: [CommonModule, routing, CoreModule, SidenavModule],
  declarations: [Nxt1CenterComponent],
  exports: [],
})
export class Nxt1CenterModule { }
