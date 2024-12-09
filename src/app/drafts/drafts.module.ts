import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './drafts.routing';

import * as fromContainers from './containers';
import * as fromComponents from './components';
import { SharedModule } from '../shared/shared.module';
import { SidenavModule } from '../sidenav/sidenav.module';

@NgModule({
  imports: [CommonModule, routing, SharedModule, SidenavModule],
  declarations: [...fromContainers.containers, ...fromComponents.components],
})
export class DraftsModule {}
