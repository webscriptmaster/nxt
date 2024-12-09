import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TEMPLATES } from '../shared/const';
import * as fromContainers from './containers';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'main',
  },
  {
    path: 'main',
    component: fromContainers.EditProfileComponent,
    data: { page: 'EditProfileMain'},
  },
  {
    path: 'general',
    component: fromContainers.EditProfileGeneralComponent,
    data: { page: 'General' },
  },
  {
    path: 'positions',
    component: fromContainers.EditProfileChoosePositionComponent,
    data: { page: 'Positions' },
  },
  {
    path: 'contact-info',
    component: fromContainers.EditProfileContactInformationComponent,
    data: { page: 'ContactInfo' },
  },
  {
    path: 'academic-info',
    component: fromContainers.EditProfileAcademicInformationComponent,
    data: { page: 'AcademicInfo' },
  },
  {
    path: 'athletic-info',
    component: fromContainers.EditProfileAthleticInformationComponent,
    data: { page: 'AthleticInfo'},
  },
  {
    path: 'coach-info',
    component: fromContainers.EditProfileCoachInformationComponent,
    data: { page: 'CoachInfo' },
  },
  {
    path: 'stats',
    component: fromContainers.EditProfileStatsComponent,
    data: { page: 'Stats' },
  },
  // {
  //   path: 'parents-info',
  //   component: fromContainers.EditProfileParentsInformationComponent,
  //   data: { num: 1 },
  // },
  {
    path: 'templates',
    component: fromContainers.EditProfileTemplatesPageComponent,
    data: { page: 'Templates' },
  },
  {
    path: 'general-template',
    component: fromContainers.EditProfileTemplatePageComponent,
    data: {
      type: TEMPLATES.GENERAL,
      page: 'Template'
    },
  },
  {
    path: 'personal-template',
    component: fromContainers.EditProfileTemplatePageComponent,
    data: {
      type: TEMPLATES.PERSONAL,
      page: 'Template'
    },
  },
  {
    path: 'own-template',
    component: fromContainers.EditProfileTemplatePageComponent,

    data: {
      type: TEMPLATES.OWN,
      page: 'Template'
    },
  },
  {
    path: 'social-template',
    component: fromContainers.EditProfileTemplatePageComponent,
    data: {
      type: TEMPLATES.SOCIAL,
      page: 'Bio'
    },
  },
  {
    path: 'dynamic-template',
    component: fromContainers.DynamicTemplatePageComponent,
    data: {
      page: 'DynamicTemplate'
    },
  },
  {
    path: 'media',
    component: fromContainers.MediaComponent,
    data: { page: 'Media' },
  },
  {
    path: 'about-me',
    component: fromContainers.AboutMeComponent,
    data: { page: 'AboutMe' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
