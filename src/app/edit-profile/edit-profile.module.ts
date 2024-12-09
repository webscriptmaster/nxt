import { ProspectSheetModule } from './../prospect-sheet/prospect-sheet.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fromContainers from './containers';
import { routing } from './edit-profile.routing';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { VideoImageModule } from '../video-image/video-image.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ProspectSheetModule,
    SidenavModule,
    VideoImageModule
  ],
  declarations: [...fromContainers.containers],
})
export class EditProfileModule {}
