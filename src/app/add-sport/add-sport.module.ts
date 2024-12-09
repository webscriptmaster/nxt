import { ProspectSheetModule } from './../prospect-sheet/prospect-sheet.module';
import { LottieModule } from 'ngx-lottie';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fromContainers from './containers';
import { routing } from './add-sport.routing';
import { CoreModule } from '../core/core.module';
import { OffersModule } from '../offers/offers.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    LottieModule,
    ProspectSheetModule,
    OffersModule
  ],
  declarations: [...fromContainers.containers],
})
export class AddSportModule {}
