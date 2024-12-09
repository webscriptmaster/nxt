import { TEMPLATES } from './../shared/const';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as fromContainers from './containers';
import { AuthGuardService as AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sign-in',
  },
  {
    path: 'sign-in',
    component: fromContainers.SignInComponent,
    data: { page: 'SignIn'},
  },
  {
    path: 'code',
    component: fromContainers.CodeComponent,
    data: { page: 'SignUp'},
  },
  {
    path: 'sign-up',
    component: fromContainers.SignUpComponent,
    data: { page: 'SignUp'},
  },
  {
    path: 'welcome',
    component: fromContainers.SignUpWelcomeComponent,
    data: { page: 'Welcome' },
    canActivate: [AuthGuard],
  },
  {
    path: 'general',
    component: fromContainers.SignUpGeneralComponent,
    data: { page: 'General' },
    canActivate: [AuthGuard],
  },
  {
    path: 'choose-sport',
    component: fromContainers.SignUpChooseSportComponent,
    data: { page: 'ChooseSport' },
    canActivate: [AuthGuard],
  },
  {
    path: 'choose-position',
    component: fromContainers.SingUpChoosePositionComponent,
    data: { page: 'ChoosePositions' },
    canActivate: [AuthGuard],
  },
  {
    path: 'contact-information',
    component: fromContainers.SignUpContactInformationComponent,
    data: { page: 'ContactInfo' },
    canActivate: [AuthGuard],
  },
  {
    path: 'coach-information',
    component: fromContainers.SignUpCoachInformationComponent,
    data: { page: 'CoachInfo' },
    canActivate: [AuthGuard],
  },
  {
    path: 'academic-information',
    component: fromContainers.SignUpAcademicInformationComponent,
    data: { page: 'AcademicInfo' },
    canActivate: [AuthGuard],
  },
  {
    path: 'athletic-information',
    component: fromContainers.SignUpAthleticInformationComponent,
    data: { page: 'AthleticInfo' },
    canActivate: [AuthGuard],
  },
  {
    path: 'stats',
    component: fromContainers.SignUpStatsComponent,
    data: { page: 'Stats' },
    canActivate: [AuthGuard],
  },
  {
    path: 'offers',
    component: fromContainers.SignUpOffersComponent,
    data: { page: 'Offers' },
    canActivate: [AuthGuard],
  },

  // {
  //   path: 'parents-information',
  //   component: fromContainers.SignUpParentsInformationComponent,
  //   data: { num: 11 },
  // },
  {
    path: 'complete',
    component: fromContainers.SignUpCompleteComponent,
    data: { page: 'Complete'},
    canActivate: [AuthGuard],
  },
  {
    path: 'prospect-sheet',
    component: fromContainers.SignUpProspectSheetComponent,
    data: { page: 'ProspectSheet' },
    canActivate: [AuthGuard],
  },
  {
    path: 'templates',
    component: fromContainers.SignUpTemplatesPageComponent,
    data: { page: 'Templates' },
    canActivate: [AuthGuard],
  },
  {
    path: 'general-template',
    component: fromContainers.SignUpTemplatePageComponent,

    data: {
      type: TEMPLATES.GENERAL,
      page: 'Template'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'personal-template',
    component: fromContainers.SignUpTemplatePageComponent,
    data: {
      type: TEMPLATES.PERSONAL,
      page: 'Template'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'own-template',
    component: fromContainers.SignUpTemplatePageComponent,

    data: {
      type: TEMPLATES.OWN,
      page: 'Template'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'social-template',
    component: fromContainers.SignUpTemplatePageComponent,

    data: {
      type: TEMPLATES.SOCIAL,
      page: 'Bio'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'how-it-works',
    component: fromContainers.SignUpHowItWorksComponent,
    data: { page: 'HowItWorks' },
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    component: fromContainers.SignUpNotificationsComponent,
    data: { page: 'Notifications' },
    canActivate: [AuthGuard],
  },
  {
    path: 'login-help',
    component: fromContainers.LoginHelpComponent,
    data: { page: 'LoginHelp' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
