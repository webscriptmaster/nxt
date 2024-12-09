import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollegeLibraryModule } from './../college-library/college-library.module';
import { CoreModule } from './../core/core.module';
import { SidenavModule } from './../sidenav/sidenav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './create-email.routing';

import { SharedModule } from '../shared/shared.module';
import { QuillModule } from 'ngx-quill';

import * as fromContainers from './containers';
import * as fromDialogs from './dialogs';
import { ProspectSheetModule } from '../prospect-sheet/prospect-sheet.module';
import { SaveCampaignDialogComponent } from './dialogs/save-campaign-dialog/save-campaign-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SidenavModule,
    CoreModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    ProspectSheetModule
  ],
  exports: [fromContainers.CreateEmailComponent, fromContainers.SendEmailResultComponent],
  declarations: [...fromContainers.containers, ...fromDialogs.dialogs, SaveCampaignDialogComponent],
})
export class CreateEmailModule {}
