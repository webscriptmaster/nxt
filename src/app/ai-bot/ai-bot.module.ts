import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiBotComponent } from './ai-bot.component';
import { routing } from './ai-bot.routing';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';



@NgModule({
  declarations: [AiBotComponent],
  imports: [
    CommonModule,
    routing,
    CoreModule,
    SidenavModule
  ]
})
export class AiBotModule { }
