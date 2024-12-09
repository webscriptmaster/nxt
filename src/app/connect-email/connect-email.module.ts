import { ConnectEmailComponent } from './connect-email.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './connect-email.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, routing, SharedModule],
  declarations: [ConnectEmailComponent],
})
export class ConnectEmailModule {}
