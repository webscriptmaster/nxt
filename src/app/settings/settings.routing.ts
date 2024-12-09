import { SettingsRecruitingProcessComponent } from './containers/recruiting-process/recruiting-process.component';
import { SettingsAccountInfoComponent } from './containers/account-info/account-info.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent, SettingsFaqComponent } from './containers';
import { SettingsContactUsComponent } from './containers/contact-us/contact-us.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    data: { page: 'Settings' },
  },
  {
    path: 'account-info',
    component: SettingsAccountInfoComponent,
    data: { page: 'SettingsAccountInfo' },
  },
  {
    path: 'recruiting-process',
    component: SettingsRecruitingProcessComponent,
    data: { page: 'SettingsRecruitingProcess' },
  },
  {
    path: 'faq',
    component: SettingsFaqComponent,
    data: { page: 'SettingsFaq' },
  },
  {
    path: 'contact-us',
    component: SettingsContactUsComponent,
    data: { page: 'SettingsContactUs' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
