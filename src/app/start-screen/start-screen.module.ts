import { routing } from './start-screen.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { StartScreenComponent } from './start-screen.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
  ],
  declarations: [StartScreenComponent],
})
export class StartScreenModule {}
