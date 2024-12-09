import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollegeLibraryService } from './college-library.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './college-library.routing';
import { CoreModule } from '../core/core.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';
import { LottieModule } from 'ngx-lottie';

import * as fromContainers from './containers';
import * as fromComponents from './components';
import * as fromDialogs from './dialogs';
import { CreateEmailModule } from '../create-email/create-email.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { NotEnoughDialogsComponent } from './dialogs/not-enough-dialogs/not-enough-dialogs.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    CoreModule,
    SharedModule,
    NgSelectModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    LottieModule,
    CreateEmailModule,
    SidenavModule,
    ShareButtonsModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
  ],
  declarations: [
    ...fromContainers.containers,
    ...fromComponents.components,
    ...fromDialogs.dialogs,
    NotEnoughDialogsComponent,
  ],
  exports: [...fromDialogs.dialogs, fromComponents.CollegeCardComponent],
  providers: [CollegeLibraryService],
})
export class CollegeLibraryModule {}
