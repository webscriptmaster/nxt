import { SettingsAccountInfoComponent } from './account-info/account-info.component';
import { SettingsContactUsComponent } from './contact-us/contact-us.component';
import { ContactUsSentResultDialogComponent } from './contact-us/sent-result-dialog/sent-result-dialog.component';
import { SettingsFaqComponent } from './faq/faq.component';
import { SettingsRecruitingProcessComponent } from './recruiting-process/recruiting-process.component';
import { SettingsComponent } from './settings/settings.component';

export const containers = [
  SettingsComponent,
  SettingsAccountInfoComponent,
  SettingsRecruitingProcessComponent,
  SettingsContactUsComponent,
  SettingsFaqComponent,
  ContactUsSentResultDialogComponent,
];

export * from './settings/settings.component';
export * from './account-info/account-info.component';
export * from './recruiting-process/recruiting-process.component';
export * from './contact-us/contact-us.component';
export * from './faq/faq.component';
export * from './contact-us/sent-result-dialog/sent-result-dialog.component';
