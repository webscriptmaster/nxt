import { AcademicCategoryComponent } from './academic-category/academic-category.component';
import { SharedAthleticInfoComponent } from './athletic_information/athletic-info.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ProspectSheetInfoComponent } from './prospect-sheet-info/prospect-sheet-info.component';
import { SocialTemplateComponent } from './social-template/social-template.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { SharedStatsComponent } from './stats/stats.component';

export const components = [
  SharedStatsComponent,
  SharedAthleticInfoComponent,
  AcademicCategoryComponent,
  SpinnerComponent,
  ProgressBarComponent,
  EmailTemplateComponent,
  SocialTemplateComponent,
  ProspectSheetInfoComponent
];

export * from './athletic_information/athletic-info.component';
export * from './academic-category/academic-category.component';
export * from './stats/stats.component';
export * from './spinner/spinner.component';
export * from './progress-bar/progress-bar.component';
export * from  './social-template/social-template.component';
export * from  './email-template/email-template.component';
export * from './prospect-sheet-info/prospect-sheet-info.component';
