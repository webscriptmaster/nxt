import { MaterialModule } from './../shared/material.module';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './auth.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LottieModule } from 'ngx-lottie';
import { ProspectSheetModule } from '../prospect-sheet/prospect-sheet.module';
import { MatDialogModule } from '@angular/material/dialog';
import * as fromContainers from './containers';
import * as fromComponents from './components';
import { OffersModule } from '../offers/offers.module';
import { UpcomingComponent } from './containers/upcoming/upcoming.component';

@NgModule({
  declarations: [
    ...fromContainers.containers,
    ...fromContainers.dialogs,
    ...fromComponents.components,
    UpcomingComponent,
  ],
  entryComponents: [...fromContainers.dialogs],
  imports: [
    CommonModule,
    routing,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    LottieModule,
    SharedModule,
    MaterialModule,
    ProspectSheetModule,
    MatDialogModule,
    OffersModule,
  ],
})
export class AuthModule {}
