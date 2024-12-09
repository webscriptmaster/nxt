import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TEMPLATES } from '../shared/const';

import * as fromContainers from './containers';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'choose-sport',
  },
  {
    path: 'choose-sport',
    component: fromContainers.AddSportChooseSportComponent,
    data: { page: 'ChooseSport' },
  },
  {
    path: 'positions',
    component: fromContainers.AddSportChoosePositionComponent,
    data: { page: 'ChoosePositions' },
  },
  {
    path: 'general',
    component: fromContainers.AddSportGeneralComponent,
    data: { page: 'General' },
  },
  {
    path: 'contact-info',
    component: fromContainers.AddSportContactInformationComponent,
    data: { page: 'ContactInfo' },
  },
  {
    path: 'coach-info',
    component: fromContainers.AddSportCoachInformationComponent,
    data: { page: 'CoachInfo' },
  },
  {
    path: 'academic-info',
    component: fromContainers.AddSportAcademicInformationComponent,
    data: { page: 'AcademicInfo' },
  },
  {
    path: 'athletic-info',
    component: fromContainers.AddSportAthleticInformationComponent,
    data: { page: 'AthleticInfo' },
  },
  {
    path: 'stats',
    component: fromContainers.AddSportStatsComponent,
    data: { page: 'Stats' },
  },
  {
    path: 'offers',
    component: fromContainers.AddSportOffersComponent,
    data: { page: 'Offers' },
  },
  {
    path: 'complete',
    component: fromContainers.AddSportCompleteComponent,
    data: { page: 'Complete' },
  },
  {
    path: 'prospect-sheet',
    component: fromContainers.AddSportProspectSheetComponent,
    data: { page: 'ProspectSheet' },
  },
  {
    path: 'templates',
    component: fromContainers.AddSportTemplatesPageComponent,
    data: { page: 'Templates' },
  },
  {
    path: 'general-template',
    component: fromContainers.AddSportTemplatePageComponent,

    data: {
      type: TEMPLATES.GENERAL,
      page: 'Template',
    },
  },
  {
    path: 'personal-template',
    component: fromContainers.AddSportTemplatePageComponent,
    data: {
      type: TEMPLATES.PERSONAL,
      page: 'Template',
    },
  },
  {
    path: 'own-template',
    component: fromContainers.AddSportTemplatePageComponent,

    data: {
      type: TEMPLATES.OWN,
      page: 'Template',
    },
  },
  {
    path: 'social-template',
    component: fromContainers.AddSportTemplatePageComponent,

    data: {
      type: TEMPLATES.SOCIAL,
      page: 'Bio',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
