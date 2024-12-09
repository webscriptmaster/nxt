import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailAutomationComponent } from './email-automation.component';
import { routing } from './email-automation.routing';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CreateEmailModule } from "../create-email/create-email.module";
import { CampaignSentComponent } from './campaign-sent/campaign-sent.component';
import { CollegeLibraryModule } from "../college-library/college-library.module";
import { SharedModule } from "../shared/shared.module";
import { SendEmailDialogComponent } from './dialogs/send-email-dialog/send-email-dialog.component';

@NgModule({
    declarations: [EmailAutomationComponent, CampaignSentComponent, SendEmailDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        routing,
        NgSelectModule,
        CoreModule,
        SidenavModule,
        CreateEmailModule,
        CollegeLibraryModule,
        SharedModule
    ]
})
export class EmailAutomationModule { }
