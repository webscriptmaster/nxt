import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailAutomationComponent } from './email-automation.component';
import { CampaignSentComponent } from './campaign-sent/campaign-sent.component';

const routes: Routes = [
  {
    path: '',
    component: EmailAutomationComponent,
    data: { page: 'EmailAutomation' },
  },
  {
    path: 'campaign-sent',
    component: CampaignSentComponent,
    data: { page: 'CampaignSent' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
